<?php

use App\Models\Nationality;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guests are redirected to login', function () {
    $this->get(route('admin.nationalities.index'))->assertRedirect(route('admin.login'));
});

test('an authenticated user can create a nationality with a flag image', function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());

    $response = $this->post(route('admin.nationalities.store'), [
        'name' => 'Egyptian',
        'name_ar' => 'مصري',
        'flag' => UploadedFile::fake()->image('flag.png', 30, 20),
    ]);

    $response->assertRedirect(route('admin.nationalities.index'));
    $nationality = Nationality::sole();
    expect($nationality->name)->toBe('Egyptian');
    expect($nationality->flag)->toStartWith('/storage/nationality-flags/');
    Storage::disk('public')->assertExists(str_replace('/storage/', '', $nationality->flag));
});

test('an authenticated user can update a nationality', function () {
    $this->actingAs(User::factory()->create());
    $nationality = Nationality::factory()->create();

    $response = $this->put(route('admin.nationalities.update', $nationality), [
        'name' => 'Updated Name',
        'name_ar' => 'اسم محدث',
    ]);

    $response->assertRedirect(route('admin.nationalities.index'));
    expect($nationality->fresh()->name)->toBe('Updated Name');
});

test('an authenticated user can delete a nationality', function () {
    $this->actingAs(User::factory()->create());
    $nationality = Nationality::factory()->create();

    $this->delete(route('admin.nationalities.destroy', $nationality))
        ->assertRedirect(route('admin.nationalities.index'));

    $this->assertDatabaseMissing('nationalities', ['id' => $nationality->id]);
});
