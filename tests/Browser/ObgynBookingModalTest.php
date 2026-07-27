<?php

use App\Models\Department;
use App\Models\Doctor;

it('books from the obgyn page in a modal instead of navigating away', function () {
    $department = Department::factory()->create(['slug' => 'gynecology', 'name' => 'Gynecology']);

    $doctor = Doctor::factory()->create([
        'department_id' => $department->id,
        'name' => 'Dr. Sarah Ahmed',
        'is_active' => true,
    ]);

    $doctor->availabilities()->create([
        'weekday' => 0,
        'start_time' => '09:00',
        'end_time' => '12:00',
        'slot_minutes' => 30,
    ]);

    $page = visit('/obgyn');

    $page->assertNoJavaScriptErrors()
        ->click('.doc-cta .book')
        ->wait(1)
        ->assertUrlIs(url('/obgyn'))
        ->assertSee('Choose a date')
        ->assertSee('Dr. Sarah Ahmed');
});
