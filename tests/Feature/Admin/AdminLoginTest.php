<?php

use App\Models\User;

test('guests visiting an admin page are redirected to the admin login page', function () {
    $this->get(route('admin.doctors.index'))->assertRedirect(route('admin.login'));
});

test('admin login page renders for guests', function () {
    $this->get(route('admin.login'))->assertOk();
});

test('logging in from the admin login page lands on the admin doctors page', function () {
    $user = User::factory()->create(['password' => bcrypt('secret-password')]);

    // Visiting the admin area first (as a guest) records it as the intended destination.
    $this->get(route('admin.doctors.index'));

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'secret-password',
    ]);

    $response->assertRedirect(route('admin.doctors.index'));
});
