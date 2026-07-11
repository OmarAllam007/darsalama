<?php

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Support\Carbon;

test('guests are redirected to login', function () {
    $this->get(route('admin.appointments.index'))->assertRedirect(route('admin.login'));
});

test('appointments list is scoped to the selected doctor', function () {
    $this->actingAs(User::factory()->create());

    $wantedDoctor = Doctor::factory()->create();
    $otherDoctor = Doctor::factory()->create();

    Appointment::factory()->create(['doctor_id' => $wantedDoctor->id, 'first_name' => 'Wanted']);
    Appointment::factory()->create(['doctor_id' => $otherDoctor->id, 'first_name' => 'Other']);

    $response = $this->get(route('admin.appointments.index', ['doctor_id' => $wantedDoctor->id]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('appointments.data.0.first_name', 'Wanted')
        ->where('appointments.total', 1));
});

test('appointments list is scoped to the today date preset', function () {
    $this->actingAs(User::factory()->create());
    $doctor = Doctor::factory()->create();

    Appointment::factory()->create(['doctor_id' => $doctor->id, 'date' => Carbon::today(), 'first_name' => 'Today']);
    Appointment::factory()->create(['doctor_id' => $doctor->id, 'date' => Carbon::tomorrow(), 'first_name' => 'Tomorrow']);

    $response = $this->get(route('admin.appointments.index', ['range' => 'today']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('appointments.total', 1)
        ->where('appointments.data.0.first_name', 'Today'));
});

test('appointments list supports a custom date range', function () {
    $this->actingAs(User::factory()->create());
    $doctor = Doctor::factory()->create();

    Appointment::factory()->create(['doctor_id' => $doctor->id, 'date' => Carbon::today()->addDays(10), 'first_name' => 'InRange']);
    Appointment::factory()->create(['doctor_id' => $doctor->id, 'date' => Carbon::today()->addDays(30), 'first_name' => 'OutOfRange']);

    $response = $this->get(route('admin.appointments.index', [
        'range' => 'custom',
        'from' => Carbon::today()->addDays(5)->toDateString(),
        'to' => Carbon::today()->addDays(15)->toDateString(),
    ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('appointments.total', 1)
        ->where('appointments.data.0.first_name', 'InRange'));
});
