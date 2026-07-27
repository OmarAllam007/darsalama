<?php

use App\Models\Doctor;
use Illuminate\Support\Carbon;

it('shows a week from today, keeps today view-only, and offers a callback', function () {
    $doctor = Doctor::factory()->create();

    // Open every weekday so the strip has bookable days besides today.
    foreach (range(0, 6) as $weekday) {
        $doctor->availabilities()->create([
            'weekday' => $weekday,
            'start_time' => '09:00',
            'end_time' => '12:00',
            'slot_minutes' => 30,
        ]);
    }

    $page = visit("/book/{$doctor->id}");

    $page->assertNoJavaScriptErrors()
        ->assertSee('Choose a date')
        ->assertSee('Today · View only')
        ->assertSee('Want us to call you back? Tap here');

    expect($page->script('document.querySelectorAll(".bk-day").length'))->toBe(7)
        ->and($page->script('document.querySelector(".bk-day.is-today").disabled'))->toBeTrue()
        ->and($page->script('document.querySelector(".bk-day").textContent'))
        ->toContain((string) Carbon::now(config('booking.timezone'))->day);

    // Picking a bookable day swaps the callback bar for the time slots.
    $page->click('.bk-day:not([disabled]) >> nth=0')
        ->wait(1)
        ->assertSee('Available times')
        ->assertDontSee('Want us to call you back? Tap here');
});
