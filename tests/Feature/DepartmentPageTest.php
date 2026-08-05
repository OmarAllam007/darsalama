<?php

use App\Enums\DoctorScheduleStatus;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\SitePage;

test('the department page serves its roster from the database', function () {
    $department = Department::factory()->create([
        'slug' => 'pediatrics',
        'name' => 'Pediatrics',
        'name_ar' => 'طب الأطفال',
    ]);

    $doctor = Doctor::factory()->create([
        'department_id' => $department->id,
        'name' => 'Dr. Rabab Salem',
        'name_ar' => 'د. رباب سالم',
        'job' => 'Consultant Pediatrician',
        'is_active' => true,
        'sort_order' => 1,
    ]);
    $doctor->qualifications()->create(['name' => 'MRCPCH (UK)', 'name_ar' => 'زمالة MRCPCH']);
    $doctor->services()->create(['name' => 'Vaccinations', 'name_ar' => 'التطعيمات']);

    Doctor::factory()->create([
        'department_id' => $department->id,
        'name' => 'Dr. Retired',
        'is_active' => false,
    ]);

    $this->get(route('departments.show', 'pediatrics'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/departments/show')
            ->where('department.slug', 'pediatrics')
            // Only the active doctor is listed, and it comes with its own relations.
            ->has('department.doctors', 1)
            ->where('department.doctors.0.name', 'Dr. Rabab Salem')
            ->where('department.doctors.0.name_ar', 'د. رباب سالم')
            ->has('department.doctors.0.qualifications', 1)
            ->has('department.doctors.0.services', 1)
            ->where('department.doctors.0.has_online_booking', false));
});

test('a doctor with a bookable future schedule is flagged for online booking', function () {
    $department = Department::factory()->create(['slug' => 'dental', 'name' => 'Dental']);
    $doctor = Doctor::factory()->create(['department_id' => $department->id, 'is_active' => true]);

    DoctorSchedule::factory()->create([
        'doctor_id' => $doctor->id,
        'date' => now()->addWeek()->toDateString(),
        'status' => DoctorScheduleStatus::Work,
        'windows' => [['start' => '09:00', 'end' => '13:00', 'bookable' => true]],
    ]);

    $this->get(route('departments.show', 'dental'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('department.doctors.0.has_online_booking', true));
});

test('a department with no active doctors still renders', function () {
    Department::factory()->create(['slug' => 'psychiatry', 'name' => 'Psychiatry']);

    $this->get(route('departments.show', 'psychiatry'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/departments/show')
            ->has('department.doctors', 0));
});

test('gynecology redirects to its own landing page', function () {
    Department::factory()->create(['slug' => 'gynecology', 'name' => 'Gynecology']);

    $this->get(route('departments.show', 'gynecology'))
        ->assertRedirect(route('obgyn'));
});

test('an unknown department slug 404s', function () {
    $this->get(route('departments.show', 'astrology'))->assertNotFound();
});

test('the department page is hidden when the services page is hidden', function () {
    Department::factory()->create(['slug' => 'pediatrics', 'name' => 'Pediatrics']);

    SitePage::query()->updateOrCreate(['slug' => 'services'], ['is_visible' => false]);

    $this->get(route('departments.show', 'pediatrics'))->assertNotFound();
});
