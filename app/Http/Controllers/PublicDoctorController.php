<?php

namespace App\Http\Controllers;

use App\Enums\DoctorScheduleStatus;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Illuminate\Support\Carbon;
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
                    ->with(['nationality', 'services', 'offers']),
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
     * so the card falls back to "Varies — check booking"). Reads the imported
     * schedule only, matching the booking calendar.
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

        $weekdays = [];
        $signatures = [];

        for ($day = $today->copy(); $day->lt($end); $day->addDay()) {
            $weekday = $day->dayOfWeekIso - 1;
            $windows = $this->bookableWindowsFor($schedules->get($day->toDateString()));

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
     * The bookable windows a schedule row opens. A day the workbook never covered
     * has none.
     *
     * @return list<array{start: string, end: string}>
     */
    private function bookableWindowsFor(?DoctorSchedule $schedule): array
    {
        if ($schedule === null || $schedule->status !== DoctorScheduleStatus::Work) {
            return [];
        }

        return collect($schedule->windows)
            ->filter(fn (array $w): bool => $w['bookable'] ?? true)
            ->map(fn (array $w): array => ['start' => $w['start'], 'end' => $w['end']])
            ->values()
            ->all();
    }
}
