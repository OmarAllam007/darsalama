<?php

namespace App\Http\Controllers;

use App\Enums\DoctorScheduleStatus;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\DoctorAvailability;
use App\Models\DoctorSchedule;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class PublicDoctorController extends Controller
{
    /**
     * Display the public list of active doctors, grouped by department.
     */
    public function index(): Response
    {
        return Inertia::render('site/doctors', [
            'departments' => Department::with([
                'doctors' => fn ($query) => $query->where('is_active', true)
                    ->withCount('offers')
                    ->with(['nationality', 'services', 'availabilities:id,doctor_id,weekday', 'offers']),
            ])
                ->withCount('offers')
                ->get(),
        ]);
    }

    /**
     * Display the public profile for a single doctor.
     */
    public function show(Doctor $doctor): Response
    {
        abort_unless($doctor->is_active, 404);

        $doctor->load([
            'department.packages',
            'nationality',
            'qualifications',
            'services',
            'availabilities',
        ]);

        $summary = $this->scheduleSummary($doctor);

        return Inertia::render('site/doctors/show', [
            'doctor' => $doctor,
            'workingWeekdays' => $summary['weekdays'],
            'workingHours' => $summary['hours'],
        ]);
    }

    /**
     * Summarise the doctor's coming weeks for the profile's working-hours card:
     * which weekdays they see patients (0 = Monday … 6 = Sunday), and the shared
     * bookable window set when every working day has identical hours (else null,
     * so the card falls back to "Varies — check booking"). Uses the schedule with
     * the weekly template as fallback, matching the booking calendar.
     *
     * @return array{weekdays: array<int, int>, hours: list<array{start: string, end: string}>|null}
     */
    private function scheduleSummary(Doctor $doctor): array
    {
        $today = Carbon::today(config('booking.timezone'));
        $end = $today->copy()->addMonthsNoOverflow(2);

        $schedules = $doctor->schedules()
            ->whereBetween('date', [$today->toDateString(), $end->toDateString()])
            ->get()
            ->keyBy(fn (DoctorSchedule $s): string => $s->date->toDateString());

        $availabilityByWeekday = $doctor->availabilities->groupBy('weekday');

        $weekdays = [];
        $signatures = [];

        for ($day = $today->copy(); $day->lt($end); $day->addDay()) {
            $weekday = $day->dayOfWeekIso - 1;
            $windows = $this->bookableWindowsFor($day, $schedules, $availabilityByWeekday, $weekday);

            if ($windows === []) {
                continue;
            }

            $weekdays[$weekday] = true;
            $signatures[] = $windows;
        }

        $uniform = collect($signatures)->unique(fn (array $w): string => json_encode($w))->count() === 1;

        return [
            'weekdays' => collect(array_keys($weekdays))->sort()->values()->all(),
            'hours' => $uniform ? $signatures[0] : null,
        ];
    }

    /**
     * The bookable windows for one day — the schedule row's open windows when it
     * exists, otherwise the weekly template's windows for that weekday.
     *
     * @param  Collection<string, DoctorSchedule>  $schedules
     * @param  Collection<int, Collection<int, DoctorAvailability>>  $availabilityByWeekday
     * @return list<array{start: string, end: string}>
     */
    private function bookableWindowsFor(Carbon $day, Collection $schedules, Collection $availabilityByWeekday, int $weekday): array
    {
        $schedule = $schedules->get($day->toDateString());

        if ($schedule !== null) {
            if ($schedule->status !== DoctorScheduleStatus::Work) {
                return [];
            }

            return collect($schedule->windows ?? [])
                ->filter(fn (array $w): bool => $w['bookable'] ?? true)
                ->map(fn (array $w): array => ['start' => $w['start'], 'end' => $w['end']])
                ->values()
                ->all();
        }

        return collect($availabilityByWeekday->get($weekday) ?? [])
            ->map(fn ($a): array => [
                'start' => substr((string) $a->start_time, 0, 5),
                'end' => substr((string) $a->end_time, 0, 5),
            ])
            ->values()
            ->all();
    }
}
