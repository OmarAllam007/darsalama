<?php

use App\Models\User;

it('renders the redesigned staff login on desktop and mobile', function () {
    $page = visit('/login')->resize(1440, 900);

    $page->assertSee('Care, coordinated with confidence.')
        ->assertSee('Welcome back')
        ->assertSee('Sign in securely')
        ->assertNoJavaScriptErrors()
        ->screenshot(filename: 'admin-login-desktop');

    $page->resize(390, 844)
        ->assertSee('Welcome back')
        ->assertSee('Secure staff access')
        ->assertNoJavaScriptErrors()
        ->screenshot(filename: 'admin-login-mobile');
});

it('renders the redesigned admin workspace', function () {
    $this->actingAs(User::factory()->create(['name' => 'Admin User']));

    $page = visit('/dashboard')->resize(1440, 900);

    $page->assertSee('Care operations')
        ->assertSee('Hospital workspace')
        ->assertSee('Welcome back, Admin')
        ->assertSee('Total appointments')
        ->assertNoJavaScriptErrors()
        ->screenshot(filename: 'admin-dashboard');

    $page->resize(390, 844)
        ->assertSee('Dashboard')
        ->assertNoJavaScriptErrors()
        ->screenshot(filename: 'admin-dashboard-mobile');
});
