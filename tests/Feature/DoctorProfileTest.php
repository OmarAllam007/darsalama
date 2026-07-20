<?php

use App\Enums\DoctorScheduleStatus;
use App\Models\Doctor;
use Illuminate\Support\Carbon;

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-07-01 09:00', config('booking.timezone')));
});

afterEach(function () {
    Carbon::setTestNow();
});

/**
 * @param  list<array{start: string, end: string, bookable: bool}>  $windows
 */
function workDay(Doctor $doctor, string $date, array $windows): void
{
    $doctor->schedules()->create([
        'date' => $date,
        'status' => DoctorScheduleStatus::Work,
        'windows' => $windows,
    ]);
}

test('the profile working days come from the schedule, not the weekly template', function () {
    $doctor = Doctor::factory()->create();

    // Weekly template says Monday (0); the schedule says otherwise.
    $doctor->availabilities()->create([
        'weekday' => 0,
        'start_time' => '09:00',
        'end_time' => '12:00',
        'slot_minutes' => 30,
    ]);

    workDay($doctor, '2026-07-01', [['start' => '08:00', 'end' => '12:00', 'bookable' => true]]); // Wed
    $doctor->schedules()->create(['date' => '2026-07-02', 'status' => DoctorScheduleStatus::Off, 'windows' => []]); // Thu

    $this->get(route('doctors.show', $doctor))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('workingWeekdays', fn ($days) => collect($days)->contains(2) // Wednesday
                && ! collect($days)->contains(3))                                // Thursday (off)
        );
});

test('a uniform Saturday-to-Thursday schedule reports its shared hours', function () {
    $doctor = Doctor::factory()->create();

    $windows = [
        ['start' => '08:00', 'end' => '12:00', 'bookable' => true],
        ['start' => '16:00', 'end' => '20:00', 'bookable' => true],
    ];

    // Sat 4 → Thu 9 July 2026 (Friday the 3rd stays off), identical hours.
    foreach (['2026-07-04', '2026-07-05', '2026-07-06', '2026-07-07', '2026-07-08', '2026-07-09'] as $date) {
        workDay($doctor, $date, $windows);
    }

    $this->get(route('doctors.show', $doctor))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('workingWeekdays', fn ($days) => collect($days)->diff([0, 1, 2, 3, 5, 6])->isEmpty()
                && collect($days)->contains(5) && ! collect($days)->contains(4))
            ->where('workingHours', [
                ['start' => '08:00', 'end' => '12:00'],
                ['start' => '16:00', 'end' => '20:00'],
            ])
        );
});

test('a schedule with differing hours reports no shared hours', function () {
    $doctor = Doctor::factory()->create();

    workDay($doctor, '2026-07-04', [['start' => '08:00', 'end' => '12:00', 'bookable' => true]]);
    workDay($doctor, '2026-07-05', [['start' => '09:00', 'end' => '13:00', 'bookable' => true]]);

    $this->get(route('doctors.show', $doctor))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('workingHours', null));
});

test('doctors without a schedule fall back to the weekly template days', function () {
    $doctor = Doctor::factory()->create();
    $doctor->availabilities()->create([
        'weekday' => 2, // Wednesday
        'start_time' => '09:00',
        'end_time' => '12:00',
        'slot_minutes' => 30,
    ]);

    $this->get(route('doctors.show', $doctor))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('workingWeekdays', fn ($days) => collect($days)->contains(2)));
});
