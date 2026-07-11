<?php

use App\Models\Department;
use App\Models\User;

test('guests are redirected to login', function () {
    $this->get(route('admin.departments.index'))->assertRedirect(route('admin.login'));
});

test('an authenticated user can create a department', function () {
    $this->actingAs(User::factory()->create());

    $response = $this->post(route('admin.departments.store'), [
        'name' => 'Cardiology',
        'name_ar' => 'أمراض القلب',
    ]);

    $response->assertRedirect(route('admin.departments.index'));
    $this->assertDatabaseHas('departments', ['name' => 'Cardiology']);
});

test('an authenticated user can update a department', function () {
    $this->actingAs(User::factory()->create());
    $department = Department::factory()->create();

    $response = $this->put(route('admin.departments.update', $department), [
        'name' => 'Updated Name',
        'name_ar' => 'اسم محدث',
    ]);

    $response->assertRedirect(route('admin.departments.index'));
    expect($department->fresh()->name)->toBe('Updated Name');
});

test('an authenticated user can delete a department', function () {
    $this->actingAs(User::factory()->create());
    $department = Department::factory()->create();

    $this->delete(route('admin.departments.destroy', $department))
        ->assertRedirect(route('admin.departments.index'));

    $this->assertDatabaseMissing('departments', ['id' => $department->id]);
});
