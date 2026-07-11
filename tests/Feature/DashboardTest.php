<?php

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard reports appointment stats and chart data', function () {
    $this->actingAs(User::factory()->create());

    $doctor = Doctor::factory()->create();
    Appointment::factory()->create(['doctor_id' => $doctor->id, 'date' => today()]);
    Appointment::factory()->create(['doctor_id' => $doctor->id, 'date' => today(), 'time' => '10:00']);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('stats.total', 2)
        ->where('stats.today', 2)
        ->where('stats.activeDoctors', 1)
        ->where('byDoctor.0.label', $doctor->name)
        ->where('byDoctor.0.value', 2)
        ->where('byDepartment.0.value', 2)
        ->where('statusBreakdown.0.label', 'confirmed')
        ->where('statusBreakdown.0.value', 2)
        ->has('last7Days', 7)
        ->has('next7Days', 7)
        ->has('monthlyTrend', 6)
        ->where('monthlyTrend.5.value', 2));
});