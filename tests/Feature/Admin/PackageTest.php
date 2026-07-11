<?php

use App\Models\Department;
use App\Models\Package;
use App\Models\User;

test('guests are redirected to login', function () {
    $this->get(route('admin.packages.index'))->assertRedirect(route('admin.login'));
});

test('an authenticated user can create a package', function () {
    $this->actingAs(User::factory()->create());
    $department = Department::factory()->create();

    $response = $this->post(route('admin.packages.store'), [
        'department_id' => $department->id,
        'name' => 'Full Checkup',
        'name_ar' => 'فحص شامل',
        'description' => 'A complete health checkup.',
        'price' => '499.99',
    ]);

    $response->assertRedirect(route('admin.packages.index'));
    $this->assertDatabaseHas('packages', ['name' => 'Full Checkup', 'department_id' => $department->id]);
});

test('an authenticated user can update a package', function () {
    $this->actingAs(User::factory()->create());
    $package = Package::factory()->create();

    $response = $this->put(route('admin.packages.update', $package), [
        'department_id' => $package->department_id,
        'name' => 'Updated Package',
        'name_ar' => $package->name_ar,
        'description' => $package->description,
        'price' => '99.50',
    ]);

    $response->assertRedirect(route('admin.packages.index'));
    expect($package->fresh()->name)->toBe('Updated Package');
    expect($package->fresh()->price)->toBe('99.50');
});

test('an authenticated user can delete a package', function () {
    $this->actingAs(User::factory()->create());
    $package = Package::factory()->create();

    $this->delete(route('admin.packages.destroy', $package))
        ->assertRedirect(route('admin.packages.index'));

    $this->assertDatabaseMissing('packages', ['id' => $package->id]);
});
