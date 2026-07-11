<?php

use App\Models\Department;
use App\Models\Doctor;
use App\Models\Nationality;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guests are redirected to login', function () {
    $this->get(route('admin.doctors.index'))->assertRedirect(route('admin.login'));
});

test('an authenticated user can create a doctor with an image, availability, qualifications, and services', function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());
    $department = Department::factory()->create();
    $nationality = Nationality::factory()->create();

    $response = $this->post(route('admin.doctors.store'), [
        'department_id' => $department->id,
        'nationality_id' => $nationality->id,
        'name' => 'Dr. Jane Doe',
        'name_ar' => 'د. جين دو',
        'job' => 'Consultant Cardiologist',
        'job_ar' => 'استشاري قلب',
        'is_active' => '1',
        'image' => UploadedFile::fake()->image('doctor.jpg'),
        'availabilities' => [
            ['weekday' => 0, 'start_time' => '09:00', 'end_time' => '17:00', 'slot_minutes' => 30],
        ],
        'qualifications' => [
            ['name' => 'MBBS', 'name_ar' => 'بكالوريوس الطب'],
        ],
        'services' => [
            ['name' => 'Root Canal', 'name_ar' => 'علاج جذور الأسنان'],
        ],
    ]);

    $response->assertRedirect(route('admin.doctors.index'));
    $doctor = Doctor::sole();
    expect($doctor->name)->toBe('Dr. Jane Doe');
    expect($doctor->nationality_id)->toBe($nationality->id);
    expect($doctor->availabilities)->toHaveCount(1);
    expect($doctor->qualifications)->toHaveCount(1);
    expect($doctor->qualifications->first()->name)->toBe('MBBS');
    expect($doctor->services)->toHaveCount(1);
    expect($doctor->services->first()->name)->toBe('Root Canal');
    Storage::disk('public')->assertExists($doctor->image);
});

test('an authenticated user can update a doctor and replace its availability, qualifications, and services', function () {
    $this->actingAs(User::factory()->create());
    $doctor = Doctor::factory()->create();
    $doctor->availabilities()->create(['weekday' => 0, 'start_time' => '09:00', 'end_time' => '17:00', 'slot_minutes' => 30]);
    $doctor->qualifications()->create(['name' => 'MBBS', 'name_ar' => 'بكالوريوس الطب']);
    $doctor->services()->create(['name' => 'Root Canal', 'name_ar' => 'علاج جذور الأسنان']);

    $response = $this->put(route('admin.doctors.update', $doctor), [
        'department_id' => $doctor->department_id,
        'name' => 'Dr. Updated',
        'name_ar' => $doctor->name_ar,
        'job' => $doctor->job,
        'job_ar' => $doctor->job_ar,
        'is_active' => '0',
        'availabilities' => [
            ['weekday' => 2, 'start_time' => '10:00', 'end_time' => '14:00', 'slot_minutes' => 15],
        ],
        'qualifications' => [
            ['name' => 'PhD', 'name_ar' => 'دكتوراه'],
        ],
        'services' => [
            ['name' => 'Teeth Whitening', 'name_ar' => 'تبييض الأسنان'],
        ],
    ]);

    $response->assertRedirect(route('admin.doctors.index'));
    $doctor->refresh();
    expect($doctor->name)->toBe('Dr. Updated');
    expect($doctor->is_active)->toBeFalse();
    expect($doctor->availabilities)->toHaveCount(1);
    expect($doctor->availabilities->first()->weekday)->toBe(2);
    expect($doctor->qualifications)->toHaveCount(1);
    expect($doctor->qualifications->first()->name)->toBe('PhD');
    expect($doctor->services)->toHaveCount(1);
    expect($doctor->services->first()->name)->toBe('Teeth Whitening');
});
