<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Support\BookingSlots;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The reception calendar: one doctor's imported schedule laid out slot by slot,
 * with the patient booked into each taken slot and every free slot ready to book.
 *
 * Availability comes only from `doctor_schedules` — a day the hospital's workbook
 * never covered shows as unscheduled rather than quietly falling back to anything.
 */
class CalendarController extends Controller
{
    public function __construct(private BookingSlots $slots) {}

    /**
     * The calendar shell. Events are fetched per visible range, not up front.
     */
    public function index(): Response
    {
        $departments = Department::whereHas('doctors', fn ($query) => $query->where('is_active', true))
            ->with(['doctors' => fn ($query) => $query->where('is_active', true)->orderBy('name')])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/calendar/index', [
            'departments' => $departments->map(fn (Department $department): array => [
                'id' => $department->id,
                'name' => $department->name,
                'slot_minutes' => $department->slot_minutes,
                'doctors' => $department->doctors->map(fn (Doctor $doctor): array => [
                    'id' => $doctor->id,
                    'name' => $doctor->name,
                ])->values()->all(),
            ])->values()->all(),
        ]);
    }

    /**
     * The visible range as FullCalendar events: closed periods as background,
     * booked slots as the patient, and every remaining free slot as bookable.
     */
    public function events(Request $request, Doctor $doctor): JsonResponse
    {
        $validated = $request->validate([
            'start' => ['required', 'date'],
            'end' => ['required', 'date', 'after:start'],
        ]);

        $doctor->load('department:id,name,slot_minutes');
        $start = Carbon::parse($validated['start'])->startOfDay();
        $end = Carbon::parse($validated['end'])->endOfDay();
        $slotMinutes = $doctor->department->slot_minutes;

        // Two queries for the whole range, then everything else is in memory.
        $schedules = $doctor->schedules()
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->keyBy(fn (DoctorSchedule $schedule): string => $schedule->date->toDateString());

        $appointments = $doctor->appointments()
            ->with('createdBy:id,name')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->groupBy(fn (Appointment $appointment): string => $appointment->date->toDateString());

        $events = [];

        for ($day = $start->copy(); $day->lte($end); $day->addDay()) {
            $date = $day->toDateString();

            $events = array_merge($events, $this->dayEvents(
                $date,
                $schedules->get($date),
                $appointments->get($date) ?? collect(),
                $slotMinutes,
            ));
        }

        return response()->json(['slotMinutes' => $slotMinutes, 'events' => $events]);
    }

    /**
     * Book an appointment from the calendar. Availability is re-checked here —
     * what the calendar rendered is a convenience, not the rule.
     */
    public function store(Request $request, Doctor $doctor): RedirectResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'time' => ['required', 'date_format:H:i'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:32'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        if (! $doctor->is_active) {
            return back()->withErrors(['doctor_id' => 'This doctor is not active.']);
        }

        if (! in_array($validated['time'], $this->slots->available($doctor, $validated['date'], enforceLeadTime: false), true)) {
            return back()->withErrors(['time' => 'The doctor is not available at that time.']);
        }

        try {
            $doctor->appointments()->create([...$validated, 'created_by' => $request->user()?->id]);
        } catch (QueryException) {
            // The unique doctor/date/time index is what actually stops two
            // receptionists booking the same slot at the same moment.
            return back()->withErrors(['time' => 'That time was just booked. Please pick another.']);
        }

        return back();
    }

    /**
     * Look up someone who has booked before, so reception can re-use their
     * details instead of retyping them.
     */
    public function patients(Request $request): JsonResponse
    {
        $validated = $request->validate(['q' => ['required', 'string', 'min:2', 'max:64']]);
        $term = '%'.$validated['q'].'%';

        $patients = Appointment::query()
            ->select('first_name', 'last_name', 'email', 'phone')
            ->where(fn ($query) => $query
                ->where('first_name', 'like', $term)
                ->orWhere('last_name', 'like', $term)
                ->orWhere('phone', 'like', $term))
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->unique(fn (Appointment $a): string => $a->first_name.$a->last_name.$a->phone)
            ->take(8)
            ->values();

        return response()->json(['patients' => $patients]);
    }

    /**
     * One day of the calendar: the shape of the day behind, the slots in front.
     *
     * @param  Collection<int, Appointment>  $appointments
     * @return array<int, array<string, mixed>>
     */
    private function dayEvents(string $date, ?DoctorSchedule $schedule, Collection $appointments, int $slotMinutes): array
    {
        if ($schedule === null) {
            return [$this->closedDay($date, 'Not scheduled')];
        }

        if (! $schedule->status->allowsBooking()) {
            return [$this->closedDay($date, $schedule->status->label())];
        }

        $events = array_map(
            fn (array $window): array => $this->window($date, $window),
            $schedule->windows,
        );

        return array_merge($events, $this->slotEvents($date, $schedule, $appointments, $slotMinutes));
    }

    /**
     * Every slot the day's open windows produce: the patient where one is booked,
     * a bookable placeholder where none is.
     *
     * @param  Collection<int, Appointment>  $appointments
     * @return array<int, array<string, mixed>>
     */
    private function slotEvents(string $date, DoctorSchedule $schedule, Collection $appointments, int $slotMinutes): array
    {
        $booked = $appointments->keyBy(fn (Appointment $a): string => Carbon::parse($a->time)->format('H:i'));

        $events = $booked
            ->map(fn (Appointment $appointment, string $time): array => $this->appointmentEvent($date, $time, $appointment, $slotMinutes))
            ->values()
            ->all();

        foreach ($this->slots->slotsIn($schedule->windows, $date, $slotMinutes) as $time) {
            if (! $booked->has($time)) {
                $events[] = $this->freeSlot($date, $time, $slotMinutes);
            }
        }

        return $events;
    }

    /**
     * @return array<string, mixed>
     */
    private function freeSlot(string $date, string $time, int $slotMinutes): array
    {
        return [
            'id' => "slot-{$date}-{$time}",
            'start' => "{$date}T{$time}:00",
            'end' => $date.'T'.$this->plus($time, $slotMinutes).':00',
            'title' => 'Available',
            'classNames' => ['calendar-slot'],
            'extendedProps' => ['kind' => 'slot', 'date' => $date, 'time' => $time],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function appointmentEvent(string $date, string $time, Appointment $appointment, int $slotMinutes): array
    {
        return [
            'id' => "appointment-{$appointment->id}",
            'start' => "{$date}T{$time}:00",
            'end' => $date.'T'.$this->plus($time, $slotMinutes).':00',
            'title' => trim($appointment->first_name.' '.$appointment->last_name),
            'classNames' => ['calendar-appointment'],
            'extendedProps' => [
                'kind' => 'appointment',
                'reference' => $appointment->reference,
                'status' => $appointment->status,
                'email' => $appointment->email,
                'phone' => $appointment->phone,
                'note' => $appointment->note,
                'createdBy' => $appointment->createdBy?->name,
            ],
        ];
    }

    /**
     * The band behind a window. Closed ones keep the hospital's own code as the
     * label so reception can see why nothing can be booked there.
     *
     * @param  array<string, mixed>  $window
     * @return array<string, mixed>
     */
    private function window(string $date, array $window): array
    {
        $bookable = $window['bookable'] ?? true;
        $code = $window['code'] ?? null;

        return [
            'id' => "window-{$date}-{$window['start']}",
            'start' => "{$date}T{$window['start']}:00",
            'end' => "{$date}T{$window['end']}:00",
            'display' => 'background',
            'title' => $bookable ? '' : trim(($code ?? 'Unavailable').' '.($window['note'] ?? '')),
            'classNames' => [$bookable ? 'calendar-open' : 'calendar-closed'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function closedDay(string $date, string $label): array
    {
        return [
            'id' => "status-{$date}",
            'start' => $date,
            'allDay' => true,
            'display' => 'background',
            'title' => $label,
            'classNames' => ['calendar-closed'],
        ];
    }

    private function plus(string $time, int $minutes): string
    {
        return Carbon::createFromFormat('H:i', $time)->addMinutes($minutes)->format('H:i');
    }
}
