<?php

use App\Enums\DoctorScheduleStatus;
use App\Models\Doctor;
use Illuminate\Support\Carbon;

it('shows a week from today, keeps today view-only, and offers a callback', function () {
    $doctor = Doctor::factory()->create();

    foreach (range(1, 7) as $offset) {
        $doctor->schedules()->create([
            'date' => Carbon::today(config('booking.timezone'))->addDays($offset)->toDateString(),
            'status' => DoctorScheduleStatus::Work,
            'windows' => [
                ['start' => '09:00', 'end' => '12:00', 'bookable' => true],
            ],
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

it('shows the complete callback form in the booking flow', function () {
    $doctor = Doctor::factory()->create();
    $doctor->schedules()->create([
        'date' => Carbon::today(config('booking.timezone'))->addDays(2)->toDateString(),
        'status' => DoctorScheduleStatus::Work,
        'windows' => [
            ['start' => '09:00', 'end' => '12:00', 'bookable' => true],
        ],
    ]);

    $page = visit("/book/{$doctor->id}");

    $page->assertNoJavaScriptErrors()
        ->click('.bk-callback-bar')
        ->assertSee($doctor->name)
        ->assertSee($doctor->department->name)
        ->assertSee('Full name (first & last)')
        ->assertSee('9 digits, starts with 5')
        ->assertSee('Preferred contact')
        ->assertSee('Best time to call')
        ->assertSee('What do you need? (optional)')
        ->assertPresent('select[name="preferred_contact"]')
        ->assertPresent('select[name="best_time"]')
        ->assertPresent('textarea[name="notes"]')
        ->assertNoJavaScriptErrors();
});

it('shows the phone message when a doctor has no future online booking', function () {
    $doctor = Doctor::factory()->create();

    visit("/book/{$doctor->id}")
        ->assertNoJavaScriptErrors()
        ->assertSee(
            "This doctor isn't available for online booking yet. Please call 920023552 to book.",
        )
        ->assertSee('Want us to call you back? Tap here.')
        ->assertPresent('a[href="tel:920023552"]')
        ->assertDontSee('Choose a date')
        ->click('.bk-callback-bar')
        ->assertSee('Full name (first & last)')
        ->assertPresent('select[name="preferred_contact"]')
        ->assertPresent('select[name="best_time"]')
        ->assertPresent('textarea[name="notes"]')
        ->assertNoJavaScriptErrors();
});
