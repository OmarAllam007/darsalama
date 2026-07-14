<?php

use App\Models\Department;
use App\Models\Doctor;
use App\Models\Nationality;
use App\Models\Offer;
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

    $page->click((string) Carbon::tomorrow()->day)
        ->wait(0.5)
        ->screenshot(filename: 'booking-modal-date-selected');

    $page->click('.bk-close')
        ->wait(0.3);

    $page->click('.x-call')
        ->wait(0.3)
        ->screenshot(filename: 'callback-modal');
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
