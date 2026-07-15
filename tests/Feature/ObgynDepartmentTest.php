<?php

use App\Mail\CallbackRequestReceived;
use App\Models\CallbackRequest;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\Package;
use Illuminate\Support\Facades\Mail;

function gynecologyDepartment(): Department
{
    return Department::factory()->create([
        'slug' => 'gynecology',
        'name' => 'Gynecology',
    ]);
}

test('the obgyn page renders with active packages and doctors', function () {
    $department = gynecologyDepartment();

    $package = Package::factory()->create([
        'department_id' => $department->id,
        'type' => 'delivery',
        'name_en' => 'Normal Delivery',
        'is_active' => true,
    ]);
    $package->features()->create(['label_en' => 'Free Circumcision', 'label_ar' => 'ختان مجاني', 'is_highlighted' => true]);

    Package::factory()->create([
        'department_id' => $department->id,
        'is_active' => false,
        'name_en' => 'Hidden Package',
    ]);

    Doctor::factory()->create(['department_id' => $department->id, 'is_active' => true]);

    $this->get(route('obgyn'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/departments/obgyn')
            ->where('department.slug', 'gynecology')
            ->has('department.packages', 1)
            ->where('department.packages.0.name_en', 'Normal Delivery')
            ->has('department.packages.0.features', 1)
            ->has('department.doctors', 1));
});

test('the obgyn page 404s when the department is missing', function () {
    $this->get(route('obgyn'))->assertNotFound();
});

test('a guest can submit a department callback request', function () {
    Mail::fake();

    $department = gynecologyDepartment();

    $this->post(route('departments.callback-requests.store', $department), [
        'name' => 'Sara',
        'phone' => '0500000000',
        'package_of_interest' => 'Normal Delivery',
        'preferred_contact' => 'phone',
    ])->assertRedirect();

    $callbackRequest = CallbackRequest::sole();
    expect($callbackRequest)
        ->department_id->toBe($department->id)
        ->doctor_id->toBeNull()
        ->name->toBe('Sara');

    Mail::assertSent(CallbackRequestReceived::class);
});
