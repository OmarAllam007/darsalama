<?php

use App\Enums\DoctorScheduleStatus;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\User;
use App\Support\BookingSlots;
use Illuminate\Support\Carbon;

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-07-15 09:00', config('booking.timezone')));
});

afterEach(function () {
    Carbon::setTestNow();
});

function scheduledDoctor(int $slotMinutes = 15): Doctor
{
    $department = Department::factory()->create(['slot_minutes' => $slotMinutes]);

    return Doctor::factory()->create(['department_id' => $department->id]);
}

function slotsFor(Doctor $doctor, string $date): array
{
    return app(BookingSlots::class)->available($doctor, $date);
}

test('a working schedule generates slots at the department duration', function () {
    $doctor = scheduledDoctor(slotMinutes: 40);
    $date = Carbon::tomorrow()->toDateString();

    $doctor->schedules()->create([
        'date' => $date,
        'status' => DoctorScheduleStatus::Work,
        'windows' => [['start' => '08:00', 'end' => '10:00', 'bookable' => true]],
    ]);

    expect(slotsFor($doctor, $date))
        ->toBe(['08:00', '08:40', '09:20']);
});

test('other departments default to 15 minute slots', function () {
    $doctor = scheduledDoctor(slotMinutes: 15);
    $date = Carbon::tomorrow()->toDateString();

    $doctor->schedules()->create([
        'date' => $date,
        'status' => DoctorScheduleStatus::Work,
        'windows' => [['start' => '08:00', 'end' => '09:00', 'bookable' => true]],
    ]);

    expect(slotsFor($doctor, $date))
        ->toBe(['08:00', '08:15', '08:30', '08:45']);
});

test('OR windows are closed for booking', function () {
    $doctor = scheduledDoctor();
    $date = Carbon::tomorrow()->toDateString();

    $doctor->schedules()->create([
        'date' => $date,
        'status' => DoctorScheduleStatus::Work,
        'windows' => [['start' => '08:00', 'end' => '16:00', 'bookable' => false]],
    ]);

    expect(slotsFor($doctor, $date))->toBeEmpty();
});

test('a half day exposes only the open window', function () {
    $doctor = scheduledDoctor();
    $date = Carbon::tomorrow()->toDateString();

    $doctor->schedules()->create([
        'date' => $date,
        'status' => DoctorScheduleStatus::Work,
        'windows' => [
            ['start' => '08:00', 'end' => '12:00', 'bookable' => true],
            ['start' => '16:00', 'end' => '20:00', 'bookable' => false],
        ],
    ]);

    $slots = slotsFor($doctor, $date);

    expect($slots)->toContain('08:00')
        ->and($slots)->not->toContain('16:00');
});

test('off, vacation and no-clinic days have no slots', function (DoctorScheduleStatus $status) {
    $doctor = scheduledDoctor();
    $date = Carbon::tomorrow()->toDateString();

    $doctor->schedules()->create(['date' => $date, 'status' => $status, 'windows' => []]);

    expect(slotsFor($doctor, $date))->toBeEmpty();
})->with([
    DoctorScheduleStatus::Off,
    DoctorScheduleStatus::Vacation,
    DoctorScheduleStatus::NoClinic,
]);

test('a day the schedule never covered has no slots', function () {
    $doctor = scheduledDoctor();

    // A weekly availability row must not make the day bookable on its own.
    $doctor->availabilities()->create([
        'weekday' => Carbon::tomorrow()->dayOfWeekIso - 1,
        'start_time' => '09:00',
        'end_time' => '10:00',
        'slot_minutes' => 30,
    ]);

    expect(slotsFor($doctor, Carbon::tomorrow()->toDateString()))->toBe([]);
});

test('the days endpoint lists only schedule-open dates', function () {
    $doctor = scheduledDoctor();

    $doctor->schedules()->createMany([
        ['date' => '2026-07-06', 'status' => DoctorScheduleStatus::Work, 'windows' => [['start' => '08:00', 'end' => '12:00', 'bookable' => true]]],
        ['date' => '2026-07-07', 'status' => DoctorScheduleStatus::Off, 'windows' => []],
        ['date' => '2026-07-08', 'status' => DoctorScheduleStatus::Work, 'windows' => [['start' => '08:00', 'end' => '16:00', 'bookable' => false]]],
    ]);

    $days = $this->getJson(route('booking.days', $doctor).'?month=2026-07')->json('days');

    expect($days)->toContain('2026-07-06')
        ->and($days)->not->toContain('2026-07-07')
        ->and($days)->not->toContain('2026-07-08');
});

test('the days endpoint offers nothing for a month with no schedule rows', function () {
    $doctor = scheduledDoctor();
    $doctor->availabilities()->create([
        'weekday' => 0, // Monday
        'start_time' => '09:00',
        'end_time' => '12:00',
        'slot_minutes' => 30,
    ]);

    expect($this->getJson(route('booking.days', $doctor).'?month=2026-07')->json('days'))
        ->toBe([]);
});

test('the public site cannot book today', function () {
    $doctor = scheduledDoctor();
    $today = Carbon::today(config('booking.timezone'))->toDateString();

    $doctor->schedules()->create([
        'date' => $today,
        'status' => DoctorScheduleStatus::Work,
        'windows' => [['start' => '08:00', 'end' => '20:00', 'bookable' => true]],
    ]);

    // The public slots endpoint rejects today outright.
    $this->getJson(route('booking.slots', $doctor).'?date='.$today)->assertStatus(422);

    $this->from(route('booking.show', $doctor))->post(route('booking.store', $doctor), [
        'date' => $today,
        'time' => '10:00',
        'first_name' => 'Sara',
        'last_name' => 'Ali',
    ])->assertSessionHasErrors('date');

    expect($doctor->appointments()->count())->toBe(0);
});

test('reception can still book today', function () {
    $this->actingAs(User::factory()->create());
    $doctor = scheduledDoctor();
    $today = Carbon::today(config('booking.timezone'))->toDateString();

    $doctor->schedules()->create([
        'date' => $today,
        'status' => DoctorScheduleStatus::Work,
        'windows' => [['start' => '08:00', 'end' => '20:00', 'bookable' => true]],
    ]);

    $slots = $this->getJson(route('admin.appointments.slots', $doctor).'?date='.$today)->json('slots');

    expect($slots)->not->toBeEmpty();

    $this->post(route('admin.appointments.store'), [
        'doctor_id' => $doctor->id,
        'date' => $today,
        'time' => $slots[0],
        'first_name' => 'Sara',
        'last_name' => 'Ali',
    ])->assertRedirect(route('admin.appointments.index'));

    expect($doctor->appointments()->count())->toBe(1);
});

test('admin can manually book an available slot', function () {
    $this->actingAs(User::factory()->create());
    $doctor = scheduledDoctor();
    $date = Carbon::tomorrow()->toDateString();

    $doctor->schedules()->create([
        'date' => $date,
        'status' => DoctorScheduleStatus::Work,
        'windows' => [['start' => '08:00', 'end' => '09:00', 'bookable' => true]],
    ]);

    $this->post(route('admin.appointments.store'), [
        'doctor_id' => $doctor->id,
        'date' => $date,
        'time' => '08:15',
        'first_name' => 'Sara',
        'last_name' => 'Ali',
    ])->assertRedirect(route('admin.appointments.index'));

    expect($doctor->appointments()->count())->toBe(1);
});

test('admin manual booking rejects a closed slot', function () {
    $this->actingAs(User::factory()->create());
    $doctor = scheduledDoctor();
    $date = Carbon::tomorrow()->toDateString();

    $doctor->schedules()->create([
        'date' => $date,
        'status' => DoctorScheduleStatus::Off,
        'windows' => [],
    ]);

    $this->from(route('admin.appointments.create'))->post(route('admin.appointments.store'), [
        'doctor_id' => $doctor->id,
        'date' => $date,
        'time' => '08:15',
        'first_name' => 'Sara',
        'last_name' => 'Ali',
    ])->assertSessionHasErrors('time');

    expect($doctor->appointments()->count())->toBe(0);
});

test('the schedule exports as an xlsx download', function () {
    $this->actingAs(User::factory()->create());
    scheduledDoctor();

    $response = $this->get(route('admin.doctor-schedules.export', ['month' => '2026-07']));

    $response->assertOk();
    expect($response->headers->get('content-type'))
        ->toContain('spreadsheetml');
});
