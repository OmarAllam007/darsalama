<?php

use App\Models\Department;
use App\Models\Offer;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guests are redirected to login', function () {
    $this->get(route('admin.offers.index'))->assertRedirect(route('admin.login'));
});

test('an authenticated user can create an offer with an image', function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());
    $department = Department::factory()->create();

    $response = $this->post(route('admin.offers.store'), [
        'department_id' => $department->id,
        'title' => 'Summer discount',
        'description' => '20% off checkups this summer.',
        'image' => UploadedFile::fake()->image('offer.jpg'),
    ]);

    $response->assertRedirect(route('admin.offers.index'));
    $offer = Offer::sole();
    expect($offer->title)->toBe('Summer discount');
    Storage::disk('public')->assertExists($offer->image);
});

test('an authenticated user can update an offer and replace its image', function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());
    $offer = Offer::factory()->create(['image' => 'offers/old.jpg']);
    Storage::disk('public')->put('offers/old.jpg', 'fake');

    $response = $this->put(route('admin.offers.update', $offer), [
        'department_id' => $offer->department_id,
        'title' => 'Updated offer',
        'description' => $offer->description,
        'image' => UploadedFile::fake()->image('new.jpg'),
    ]);

    $response->assertRedirect(route('admin.offers.index'));
    $offer->refresh();
    expect($offer->title)->toBe('Updated offer');
    Storage::disk('public')->assertMissing('offers/old.jpg');
    Storage::disk('public')->assertExists($offer->image);
});

test('an authenticated user can delete an offer', function () {
    $this->actingAs(User::factory()->create());
    $offer = Offer::factory()->create();

    $this->delete(route('admin.offers.destroy', $offer))
        ->assertRedirect(route('admin.offers.index'));

    $this->assertDatabaseMissing('offers', ['id' => $offer->id]);
});
