<?php

use App\Models\Department;
use App\Models\Doctor;
use App\Models\Offer;
use Database\Seeders\DepartmentOfferSeeder;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

it('gives every gynecology doctor all six posters from the offers modal', function () {
    $department = Department::factory()->create(['slug' => 'gynecology']);
    $doctors = Doctor::factory()->count(3)->create(['department_id' => $department->id]);

    $this->seed(DepartmentOfferSeeder::class);

    foreach ($doctors as $doctor) {
        expect(Offer::where('doctor_id', $doctor->id)->count())->toBe(6);
    }
});

it('stores the poster artwork on the public disk', function () {
    $department = Department::factory()->create(['slug' => 'cardiology']);
    Doctor::factory()->create(['department_id' => $department->id]);

    $this->seed(DepartmentOfferSeeder::class);

    $offer = Offer::sole();

    expect($offer->image)->toBe('offers/cardiovascular-pathway.jpg');
    Storage::disk('public')->assertExists($offer->image);
});

it('leaves a manually curated offer untouched', function () {
    $department = Department::factory()->create(['slug' => 'cardiology']);
    $doctor = Doctor::factory()->create(['department_id' => $department->id]);

    $existing = Offer::factory()->create([
        'doctor_id' => $doctor->id,
        'title' => 'Cardiovascular Pathway',
        'price' => 200,
        'image' => 'offers/hand-uploaded.webp',
    ]);

    $this->seed(DepartmentOfferSeeder::class);

    expect(Offer::count())->toBe(1);
    expect($existing->fresh()->price)->toEqual('200.00');
    expect($existing->fresh()->image)->toBe('offers/hand-uploaded.webp');
});

it('skips departments that do not exist', function () {
    $this->seed(DepartmentOfferSeeder::class);

    expect(Offer::count())->toBe(0);
});
