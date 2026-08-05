<?php

use App\Enums\DoctorScheduleStatus;
use App\Models\Department;
use App\Models\Doctor;
use Illuminate\Support\Carbon;

it('books from the obgyn page in a modal instead of navigating away', function () {
    $department = Department::factory()->create(['slug' => 'gynecology', 'name' => 'Gynecology']);

    $doctor = Doctor::factory()->create([
        'department_id' => $department->id,
        'name' => 'Dr. Sarah Ahmed',
        'is_active' => true,
    ]);

    $doctor->schedules()->create([
        'date' => Carbon::today(config('booking.timezone'))->addDay()->toDateString(),
        'status' => DoctorScheduleStatus::Work,
        'windows' => [
            ['start' => '09:00', 'end' => '12:00', 'bookable' => true],
        ],
    ]);

    $page = visit('/obgyn');

    $page->assertNoJavaScriptErrors()
        ->click('.doc-cta .book')
        ->wait(1)
        ->assertUrlIs(url('/obgyn'))
        ->assertPresent('.bk-day')
        ->assertSee('Dr. Sarah Ahmed');
});
