<?php

use App\Models\Doctor;
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
    $doctor = Doctor::factory()->create();

    $response = $this->post(route('admin.offers.store'), [
        'doctor_id' => $doctor->id,
        'title' => 'Summer discount',
        'description' => '20% off checkups this summer.',
        'price' => '149.00',
        'original_price' => '199.00',
        'image' => UploadedFile::fake()->image('offer.jpg'),
    ]);

    $response->assertRedirect(route('admin.offers.index'));
    $offer = Offer::sole();
    expect($offer->title)->toBe('Summer discount');
    expect($offer->doctor_id)->toBe($doctor->id);
    expect($offer->price)->toBe('149.00');
    expect($offer->original_price)->toBe('199.00');
    expect($offer->is_expired)->toBeFalse();
    Storage::disk('public')->assertExists($offer->image);
});

test('an authenticated user can update an offer and replace its image', function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());
    $offer = Offer::factory()->create(['image' => 'offers/old.jpg']);
    Storage::disk('public')->put('offers/old.jpg', 'fake');

    $response = $this->put(route('admin.offers.update', $offer), [
        'doctor_id' => $offer->doctor_id,
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

test('an authenticated user can mark an offer as expired', function () {
    $this->actingAs(User::factory()->create());
    $offer = Offer::factory()->create([
        'price' => '149.00',
        'original_price' => '199.00',
        'is_expired' => false,
    ]);

    $this->put(route('admin.offers.update', $offer), [
        'doctor_id' => $offer->doctor_id,
        'title' => $offer->title,
        'description' => $offer->description,
        'is_expired' => '1',
    ])->assertRedirect(route('admin.offers.index'));

    expect($offer->refresh()->is_expired)->toBeTrue();
});

test('an authenticated user can restore an expired offer at any time', function () {
    $this->actingAs(User::factory()->create());
    $offer = Offer::factory()->expired()->create([
        'price' => '149.00',
        'original_price' => '199.00',
    ]);

    $this->patch(route('admin.offers.restore', $offer))
        ->assertRedirect();

    $offer->refresh();
    expect($offer->is_expired)->toBeFalse();
    // Restoring only reactivates the offer — the original price it
    // reverts to on the public site stays intact.
    expect($offer->original_price)->toBe('199.00');
});
