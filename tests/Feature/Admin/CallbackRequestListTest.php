<?php

use App\Models\CallbackRequest;
use App\Models\Doctor;
use App\Models\User;

test('guests are redirected to login', function () {
    $this->get(route('admin.callback-requests.index'))->assertRedirect(route('admin.login'));
});

test('admins can see submitted callback requests', function () {
    $this->actingAs(User::factory()->create());

    $doctor = Doctor::factory()->create();
    CallbackRequest::factory()->create(['doctor_id' => $doctor->id, 'name' => 'Jane Doe']);

    $response = $this->get(route('admin.callback-requests.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('callbackRequests.data.0.name', 'Jane Doe')
        ->where('callbackRequests.data.0.doctor.id', $doctor->id));
});
