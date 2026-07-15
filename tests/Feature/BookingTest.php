<?php

use App\Models\Appointment;
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
    $doctor = Doctor::factory()->create();

    $doctor->availabilities()->create([
        'weekday' => Carbon::tomorrow()->dayOfWeekIso - 1,
        'start_time' => '00:00',
        'end_time' => '23:30',
        'slot_minutes' => 30,
    ]);

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

    $doctor = Doctor::factory()->create();
    $doctor->availabilities()->create([
        'weekday' => $dayAfter->dayOfWeekIso - 1,
        'start_time' => '09:00',
        'end_time' => '12:00',
        'slot_minutes' => 30,
    ]);

    $slots = $this->getJson(route('booking.slots', $doctor).'?date='.$dayAfter->toDateString());

    $slots->assertOk();
    expect($slots->json('slots'))->not->toBeEmpty();
});
