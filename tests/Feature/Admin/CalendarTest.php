<?php

use App\Enums\DoctorScheduleStatus;
use App\Models\Appointment;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Support\Carbon;

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-07-01 07:00', config('booking.timezone')));
    $this->actingAs(User::factory()->create());
});

afterEach(function () {
    Carbon::setTestNow();
});

/**
 * A doctor working 08:00–12:00 (open) then 12:00–16:00 on LTC (closed).
 */
function splitDayDoctor(string $date = '2026-07-02'): Doctor
{
    $doctor = Doctor::factory()->create([
        'department_id' => Department::factory()->create(['slot_minutes' => 30]),
        'is_active' => true,
    ]);

    $doctor->schedules()->create([
        'date' => $date,
        'status' => DoctorScheduleStatus::Work,
        'windows' => [
            ['start' => '08:00', 'end' => '12:00', 'code' => 'OPD', 'bookable' => true, 'note' => null],
            ['start' => '12:00', 'end' => '16:00', 'code' => 'LTC', 'bookable' => false, 'note' => null],
        ],
    ]);

    return $doctor;
}

function events(Doctor $doctor, string $start = '2026-07-02', string $end = '2026-07-03'): array
{
    return test()->getJson(route('admin.calendar.events', [
        'doctor' => $doctor->id,
        'start' => $start,
        'end' => $end,
    ]))->assertOk()->json();
}

test('the calendar bands the day with the open and closed windows', function () {
    $payload = events(splitDayDoctor());

    $windows = collect($payload['events'])->where('display', 'background');

    expect($payload['slotMinutes'])->toBe(30);

    $open = $windows->firstWhere('start', '2026-07-02T08:00:00');
    expect($open['end'])->toBe('2026-07-02T12:00:00')
        ->and($open['classNames'])->toContain('calendar-open');

    $closed = $windows->firstWhere('start', '2026-07-02T12:00:00');
    expect($closed['end'])->toBe('2026-07-02T16:00:00')
        ->and($closed['title'])->toBe('LTC')
        ->and($closed['classNames'])->toContain('calendar-closed');
});

test('every free slot in the open window is offered at the department duration', function () {
    $slots = collect(events(splitDayDoctor())['events'])
        ->where('extendedProps.kind', 'slot')
        ->pluck('start')
        ->values()
        ->all();

    // 08:00 to 12:00 in 30-minute steps, and nothing in the closed afternoon.
    expect($slots)->toHaveCount(8)
        ->and($slots[0])->toBe('2026-07-02T08:00:00')
        ->and($slots[1])->toBe('2026-07-02T08:30:00')
        ->and($slots[7])->toBe('2026-07-02T11:30:00');
});

test('a booked slot shows the patient instead of a free slot', function () {
    $doctor = splitDayDoctor();

    Appointment::factory()->create([
        'doctor_id' => $doctor->id,
        'date' => '2026-07-02',
        'time' => '09:00',
        'first_name' => 'Ahmed',
        'last_name' => 'Ali',
    ]);

    $atNine = collect(events($doctor)['events'])
        ->where('start', '2026-07-02T09:00:00')
        ->whereNotNull('extendedProps');

    expect($atNine)->toHaveCount(1)
        ->and($atNine->first()['extendedProps']['kind'])->toBe('appointment')
        ->and($atNine->first()['title'])->toBe('Ahmed Ali');
});

test('a day the schedule never covered offers nothing', function () {
    $doctor = splitDayDoctor();

    $events = collect(events($doctor, '2026-07-05', '2026-07-06')['events']);

    expect($events->where('extendedProps.kind', 'slot'))->toBeEmpty()
        ->and($events->firstWhere('allDay', true)['title'])->toBe('Not scheduled');
});

test('closed periods are shown rather than hidden', function () {
    $doctor = Doctor::factory()->create(['department_id' => Department::factory()]);

    $doctor->schedules()->create([
        'date' => '2026-07-02',
        'status' => DoctorScheduleStatus::Vacation,
        'windows' => [],
    ]);

    $event = collect(events($doctor)['events'])->firstWhere('allDay', true);

    expect($event['title'])->toBe('Vacation')
        ->and($event['classNames'])->toContain('calendar-closed');
});

test('booked appointments carry the patient name and details', function () {
    $doctor = splitDayDoctor();

    Appointment::factory()->create([
        'doctor_id' => $doctor->id,
        'date' => '2026-07-02',
        'time' => '09:00',
        'first_name' => 'Ahmed',
        'last_name' => 'Ali',
        'phone' => '0501234567',
    ]);

    $event = collect(events($doctor)['events'])
        ->firstWhere('title', 'Ahmed Ali');

    expect($event['start'])->toBe('2026-07-02T09:00:00')
        ->and($event['end'])->toBe('2026-07-02T09:30:00')
        ->and($event['extendedProps']['phone'])->toBe('0501234567');
});

test('reception can book inside a bookable window', function () {
    $doctor = splitDayDoctor();

    $this->post(route('admin.calendar.appointments.store', $doctor), [
        'date' => '2026-07-02',
        'time' => '09:00',
        'first_name' => 'Sara',
        'last_name' => 'Mohamed',
        'phone' => '0500000000',
        'note' => 'Follow-up',
    ])->assertSessionHasNoErrors();

    $appointment = Appointment::sole();

    expect($appointment->note)->toBe('Follow-up')
        ->and($appointment->created_by)->toBe(auth()->id());
});

test('reception cannot book inside a closed LTC window', function () {
    $doctor = splitDayDoctor();

    $this->post(route('admin.calendar.appointments.store', $doctor), [
        'date' => '2026-07-02',
        'time' => '13:00',
        'first_name' => 'Sara',
        'last_name' => 'Mohamed',
    ])->assertSessionHasErrors('time');

    expect(Appointment::count())->toBe(0);
});

test('reception cannot book outside the imported availability', function () {
    $doctor = splitDayDoctor();

    $this->post(route('admin.calendar.appointments.store', $doctor), [
        'date' => '2026-07-02',
        'time' => '18:00',
        'first_name' => 'Sara',
        'last_name' => 'Mohamed',
    ])->assertSessionHasErrors('time');

    expect(Appointment::count())->toBe(0);
});

test('an appointment that would run past the window end is rejected', function () {
    $doctor = splitDayDoctor();

    // 11:45 + 30 minutes spills into the closed LTC period.
    $this->post(route('admin.calendar.appointments.store', $doctor), [
        'date' => '2026-07-02',
        'time' => '11:45',
        'first_name' => 'Sara',
        'last_name' => 'Mohamed',
    ])->assertSessionHasErrors('time');
});

test('the same slot cannot be booked twice', function () {
    $doctor = splitDayDoctor();

    $payload = [
        'date' => '2026-07-02',
        'time' => '09:00',
        'first_name' => 'Sara',
        'last_name' => 'Mohamed',
    ];

    $this->post(route('admin.calendar.appointments.store', $doctor), $payload)->assertSessionHasNoErrors();
    $this->post(route('admin.calendar.appointments.store', $doctor), [...$payload, 'first_name' => 'Other'])
        ->assertSessionHasErrors('time');

    expect(Appointment::count())->toBe(1);
});

test('an inactive doctor cannot be booked', function () {
    $doctor = splitDayDoctor();
    $doctor->update(['is_active' => false]);

    $this->post(route('admin.calendar.appointments.store', $doctor), [
        'date' => '2026-07-02',
        'time' => '09:00',
        'first_name' => 'Sara',
        'last_name' => 'Mohamed',
    ])->assertSessionHasErrors('doctor_id');
});

test('patient lookup finds someone who has booked before', function () {
    $doctor = splitDayDoctor();

    Appointment::factory()->create([
        'doctor_id' => $doctor->id,
        'first_name' => 'Ahmed',
        'last_name' => 'Ali',
        'phone' => '0501234567',
    ]);

    $this->getJson(route('admin.calendar.patients', ['q' => '05012']))
        ->assertOk()
        ->assertJsonPath('patients.0.first_name', 'Ahmed');
});

test('the calendar requires authentication', function () {
    auth()->logout();

    $this->get(route('admin.calendar.index'))->assertRedirect();
});
