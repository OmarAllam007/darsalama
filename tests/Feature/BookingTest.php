<?php

use App\Enums\DoctorScheduleStatus;
use App\Models\Appointment;
use App\Models\Department;
use App\Models\Doctor;
use Illuminate\Support\Carbon;

beforeEach(function () {
    // Freeze to a fixed morning (clinic time) so the 8pm next-day cut-off
    // never makes these time-of-day dependent tests flaky.
    Carbon::setTestNow(Carbon::parse('2026-07-15 09:00', config('booking.timezone')));
});

afterEach(function () {
    Carbon::setTestNow();
});

function bookableDoctor(): Doctor
{
    $doctor = Doctor::factory()->create([
        'department_id' => Department::factory()->create(['slot_minutes' => 30]),
    ]);

    // Booking reads the imported schedule and nothing else, so give the next few
    // days an open all-day window.
    foreach ([1, 2, 3] as $offset) {
        $doctor->schedules()->create([
            'date' => Carbon::today()->addDays($offset)->toDateString(),
            'status' => DoctorScheduleStatus::Work,
            'windows' => [['start' => '00:00', 'end' => '23:30', 'bookable' => true]],
        ]);
    }

    return $doctor;
}

test('guests can view a bookable doctor page', function () {
    $doctor = bookableDoctor();

    $response = $this->get(route('booking.show', $doctor));

    $response->assertOk();
});

test('inactive doctors cannot be booked', function () {
    $doctor = Doctor::factory()->create(['is_active' => false]);

    $this->get(route('booking.show', $doctor))->assertNotFound();
});

test('slots endpoint returns open times and excludes booked ones', function () {
    $doctor = bookableDoctor();
    $date = Carbon::tomorrow()->toDateString();

    Appointment::factory()->create([
        'doctor_id' => $doctor->id,
        'date' => $date,
        'time' => '09:00',
    ]);

    $response = $this->getJson(route('booking.slots', $doctor).'?date='.$date);

    $response->assertOk();
    expect($response->json('slots'))
        ->toContain('09:30')
        ->not->toContain('09:00');
});

test('a guest can book an available slot and reach the confirmation page', function () {
    $doctor = bookableDoctor();
    $date = Carbon::tomorrow()->toDateString();

    $response = $this->post(route('booking.store', $doctor), [
        'date' => $date,
        'time' => '09:00',
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane@example.com',
        'phone' => '0500000000',
    ]);

    $appointment = Appointment::sole();

    $response->assertRedirect(route('appointments.show', $appointment));
    expect($appointment)
        ->doctor_id->toBe($doctor->id)
        ->first_name->toBe('Jane');

    $this->get(route('appointments.show', $appointment))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('appointment.id', $appointment->id));
});

test('the confirmation page shows a stable APT- booking reference', function () {
    $appointment = Appointment::factory()->create([
        'doctor_id' => bookableDoctor()->id,
        'date' => Carbon::tomorrow()->toDateString(),
        'time' => '09:00',
    ]);

    expect($appointment->reference)
        ->toMatch('/^APT-[0-9A-Z]{6}$/')
        ->toBe($appointment->fresh()->reference);

    $this->get(route('appointments.show', $appointment))
        ->assertInertia(fn ($page) => $page->where('appointment.reference', $appointment->reference));
});

test('the check-in qr code is only shown while the appointment is still upcoming', function () {
    $doctor = bookableDoctor();

    $upcoming = Appointment::factory()->create([
        'doctor_id' => $doctor->id,
        'date' => Carbon::tomorrow()->toDateString(),
        'time' => '09:00',
    ]);

    $past = Appointment::factory()->create([
        'doctor_id' => $doctor->id,
        'date' => Carbon::yesterday()->toDateString(),
        'time' => '09:00',
    ]);

    $this->get(route('appointments.show', $upcoming))
        ->assertInertia(fn ($page) => $page->where('qrCodeDataUri', fn ($uri) => str_starts_with($uri, 'data:image/png')));

    $this->get(route('appointments.show', $past))
        ->assertInertia(fn ($page) => $page->where('qrCodeDataUri', null));
});

test('booking an already taken slot fails validation', function () {
    $doctor = bookableDoctor();
    $date = Carbon::tomorrow()->toDateString();

    Appointment::factory()->create([
        'doctor_id' => $doctor->id,
        'date' => $date,
        'time' => '09:00',
    ]);

    $response = $this->from(route('booking.show', $doctor))->post(route('booking.store', $doctor), [
        'date' => $date,
        'time' => '09:00',
        'first_name' => 'Jane',
        'last_name' => 'Doe',
    ]);

    $response->assertRedirect(route('booking.show', $doctor));
    $response->assertSessionHasErrors('time');
    expect(Appointment::count())->toBe(1);
});

test('bookings for the next day close after the evening cut-off', function () {
    Carbon::setTestNow(Carbon::parse('2026-07-15 20:30', config('booking.timezone')));
    $doctor = bookableDoctor();
    $date = Carbon::tomorrow()->toDateString();

    $slots = $this->getJson(route('booking.slots', $doctor).'?date='.$date);
    $slots->assertOk();
    expect($slots->json('slots'))->toBeEmpty();

    $response = $this->from(route('booking.show', $doctor))->post(route('booking.store', $doctor), [
        'date' => $date,
        'time' => '09:00',
        'first_name' => 'Jane',
        'last_name' => 'Doe',
    ]);

    $response->assertSessionHasErrors('time');
    expect(Appointment::count())->toBe(0);
});

test('the day after next stays bookable after the evening cut-off', function () {
    Carbon::setTestNow(Carbon::parse('2026-07-15 20:30', config('booking.timezone')));
    $dayAfter = Carbon::now(config('booking.timezone'))->addDays(2);

    $doctor = Doctor::factory()->create([
        'department_id' => Department::factory()->create(['slot_minutes' => 30]),
    ]);
    $doctor->schedules()->create([
        'date' => $dayAfter->toDateString(),
        'status' => DoctorScheduleStatus::Work,
        'windows' => [['start' => '09:00', 'end' => '12:00', 'bookable' => true]],
    ]);

    $slots = $this->getJson(route('booking.slots', $doctor).'?date='.$dayAfter->toDateString());

    $slots->assertOk();
    expect($slots->json('slots'))->not->toBeEmpty();
});
