<?php

use App\Enums\DoctorScheduleStatus;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\Nationality;
use App\Models\Offer;
use App\Models\Package;
use Illuminate\Support\Carbon;

function seedDoctorsDirectory(): Doctor
{
    $department = Department::factory()->create([
        'name' => 'Cardiology',
        'name_ar' => 'أمراض القلب',
    ]);

    $nationality = Nationality::factory()->create();

    $doctor = Doctor::factory()->create([
        'department_id' => $department->id,
        'nationality_id' => $nationality->id,
        'name' => 'Dr. Sarah Johnson',
        'name_ar' => 'د. سارة جونسون',
    ]);

    Offer::factory()->create([
        'doctor_id' => $doctor->id,
        'title' => 'Free heart checkup',
    ]);

    $doctor->services()->create([
        'name' => 'Echocardiogram',
        'name_ar' => 'تخطيط صدى القلب',
        'description' => 'Heart imaging',
    ]);

    $doctor->qualifications()->create([
        'name' => 'Board Certified Cardiologist',
        'name_ar' => 'استشاري قلب معتمد',
    ]);

    $doctor->availabilities()->create([
        'weekday' => Carbon::tomorrow()->dayOfWeekIso - 1,
        'start_time' => '09:00',
        'end_time' => '17:00',
        'slot_minutes' => 30,
    ]);
    $doctor->schedules()->create([
        'date' => Carbon::today(config('booking.timezone'))->addDays(2)->toDateString(),
        'status' => DoctorScheduleStatus::Work,
        'windows' => [
            ['start' => '09:00', 'end' => '17:00', 'bookable' => true],
        ],
    ]);

    // A second, otherwise-empty department for the grid.
    Doctor::factory()->create();

    return $doctor;
}

it('renders the redesigned doctors index and drills into a department', function () {
    seedDoctorsDirectory();

    $page = visit('/doctors');

    $page->assertNoJavaScriptErrors()
        ->assertSee('Care.')
        ->screenshot(filename: 'doctors-index');

    $page->click('.dept-card:first-of-type')
        ->wait(0.5)
        ->assertSee('Cardiology')
        ->screenshot(filename: 'doctors-detail');

    $page->click('.svc-chip')
        ->wait(0.3)
        ->screenshot(filename: 'doctors-detail-filtered');
});

it('opens a doctor profile, expand lightbox, booking modal and callback modal', function () {
    $doctor = seedDoctorsDirectory();

    $page = visit("/doctors/{$doctor->id}");

    $page->assertNoJavaScriptErrors()
        ->assertSee('Dr. Sarah Johnson')
        ->screenshot(filename: 'doctor-profile');

    $page->click('.dp-expand')
        ->wait(0.3)
        ->screenshot(filename: 'doctor-profile-expand');

    $page->click('.olb-x')
        ->wait(0.3);

    $page->click('.x-book')
        ->wait(0.3)
        ->assertSee('Book')
        ->screenshot(filename: 'booking-modal');

    $page->click(
        (string) Carbon::today(config('booking.timezone'))->addDays(2)->day,
    )
        ->wait(0.5)
        ->screenshot(filename: 'booking-modal-date-selected');

    $page->click('.bk-close')
        ->wait(0.3);

    $page->click('.x-call')
        ->wait(0.3)
        ->assertSee('Request a Callback')
        ->assertSee('Dr. Sarah Johnson')
        ->assertNotPresent('select[name="package_of_interest"]')
        ->screenshot(filename: 'callback-modal');
});

it('shows the OB/GYN package dropdown in the doctor callback modal', function () {
    $department = Department::factory()->create([
        'slug' => 'gynecology',
        'name' => 'Gynecology',
        'name_ar' => 'أمراض النساء والولادة',
    ]);
    $doctor = Doctor::factory()->for($department)->create();

    Package::factory()->for($department)->create([
        'name_en' => 'Maternity Care Package',
        'is_active' => true,
    ]);
    Package::factory()->for($department)->create([
        'name_en' => 'Hidden Package',
        'is_active' => false,
    ]);

    $page = visit("/doctors/{$doctor->id}");

    $page->assertNoJavaScriptErrors()
        ->click('.x-call')
        ->assertPresent('select[name="package_of_interest"]')
        ->assertDontSee('Hidden Package')
        ->assertNoJavaScriptErrors();

    expect(
        $page->script(
            'Array.from(document.querySelector(\'select[name="package_of_interest"]\').options).map((option) => option.textContent)',
        ),
    )->toContain('Maternity Care Package', 'Not sure — please advise');
});

it('disables the callback button and shows a spinner while sending', function () {
    $doctor = seedDoctorsDirectory();
    $page = visit("/doctors/{$doctor->id}");

    $page->click('.x-call')
        ->fill('#cb-name', 'Jane Doe')
        ->fill('#cb-phone', '500000000');

    $page->script(
        <<<'JS'
        window.callbackRequestSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function (...args) {
            window.setTimeout(() => window.callbackRequestSend.apply(this, args), 1000);
        };
        JS,
    );

    $page->click('.callback-modal__submit')
        ->assertButtonDisabled('Sending…')
        ->assertPresent('.callback-modal__spinner')
        ->assertAriaAttribute(
            '.callback-modal__submit',
            'busy',
            'true',
        )
        ->assertNoJavaScriptErrors();
});

it('renders arabic RTL', function () {
    seedDoctorsDirectory();

    $page = visit('/doctors');
    $page->click('.nav__lang:not(.nav__lang--mobile)')
        ->wait(0.5)
        ->assertNoJavaScriptErrors()
        ->screenshot(filename: 'doctors-index-ar');
});

it('leaves other pages unchanged', function () {
    $pages = visit(['/', '/about', '/services']);
    $pages->assertNoJavaScriptErrors();
});
