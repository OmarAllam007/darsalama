<?php

use App\Enums\DoctorScheduleStatus;
use App\Models\Doctor;
use Illuminate\Support\Carbon;

it('shows day -> time -> information booking flow for online doctors', function () {
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
        ->assertSee('Select a date')
        ->assertSee('Today · View only');

    expect($page->script('document.querySelectorAll(".bk-day").length'))->toBe(8)
        ->and($page->script('document.querySelector(".bk-day.is-today").disabled'))->toBeTrue()
        ->and($page->script('document.querySelector(".bk-day").textContent'))
        ->toContain((string) Carbon::now(config('booking.timezone'))->day);

    // Pick a date -> choose time -> enter info.
    $page->click('.bk-day:not([disabled]) >> nth=0')
        ->wait(1)
        ->assertSee('Select a time')
        ->assertSee('Back to dates')
        ->click('.bk-grid .bk-chip >> nth=0')
        ->wait(1)
        ->assertSee('Back to times')
        ->assertSee('Your information')
        ->assertSee('Appointment Request');
});

it('keeps callback form for non-online doctors', function () {
    $doctor = Doctor::factory()->create();

    $page = visit("/book/{$doctor->id}");

    $page->assertNoJavaScriptErrors()
        ->assertDontSee('Select a date')
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
        ->assertDontSee('Select a date')
        ->click('.bk-callback-bar')
        ->assertSee('Full name (first & last)')
        ->assertPresent('select[name="preferred_contact"]')
        ->assertPresent('select[name="best_time"]')
        ->assertPresent('textarea[name="notes"]')
        ->assertNoJavaScriptErrors();
});
