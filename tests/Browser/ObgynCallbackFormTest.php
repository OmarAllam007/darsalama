<?php

use App\Models\Department;

it('keeps the scroll position when the callback form succeeds', function () {
    Department::factory()->create(['slug' => 'gynecology', 'name' => 'Gynecology']);

    $page = visit('/obgyn');

    $page->script("document.getElementById('og-name').scrollIntoView({block: 'center'})");
    $page->wait(0.5);

    $before = $page->script('window.scrollY');

    $page->fill('#og-name', 'Sara')
        ->fill('#og-phone', '500000000')
        ->click('.submit-btn')
        ->wait(1);

    $page->assertSee("Thank you — we'll be in touch.");

    $after = $page->script('window.scrollY');

    expect($before)->toBeGreaterThan(0)
        ->and(abs($after - $before))->toBeLessThan(120);
});

it('keeps letters out of the mobile field and blocks a malformed number', function () {
    Department::factory()->create(['slug' => 'gynecology', 'name' => 'Gynecology']);

    $page = visit('/obgyn');

    $page->typeSlowly('#og-phone', 'ab5x01122334455', 10);

    // Non-digits are dropped as they are typed, and the field stops at 9 digits.
    expect($page->script("document.getElementById('og-phone').value"))->toBe('501122334');

    $page->fill('#og-name', 'Sara')
        ->fill('#og-phone', '4123')
        ->click('.submit-btn')
        ->wait(0.5);

    expect($page->script("document.getElementById('og-phone').checkValidity()"))->toBeFalse();

    $page->assertDontSee("Thank you — we'll be in touch.");
});
