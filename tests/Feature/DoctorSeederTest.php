<?php

use App\Models\Department;
use App\Models\Doctor;
use Database\Seeders\DoctorSeeder;
use Illuminate\Support\Facades\Storage;

/**
 * Every department the seeder assigns doctors to, in the public display order
 * the sort_order migration sets.
 *
 * @var list<array{0: string, 1: string}>
 */
const SEEDED_DEPARTMENTS = [
    ['gynecology', 'Gynecology'],
    ['pediatrics', 'Pediatrics'],
    ['internal-medicine', 'Internal Medicine'],
    ['endocrinology', 'Endocrinology'],
    ['pulmonology', 'Pulmonology'],
    ['general-surgery', 'General Surgery'],
    ['orthopedics', 'Orthopedics'],
    ['dermatology', 'Dermatology'],
    ['cardiology', 'Cardiology'],
    ['ent', 'ENT'],
    ['ophthalmology', 'Ophthalmology'],
    ['urology', 'Urology'],
    ['dental', 'Dental'],
    ['spine-surgery-neurology', 'Spine Surgery & Neurology'],
    ['rheumatology', 'Rheumatology'],
    ['psychiatry', 'Psychiatry'],
    ['family-medicine', 'Family Medicine'],
    ['general-practice', 'General Practice'],
];

beforeEach(function () {
    Storage::fake('public');

    foreach (SEEDED_DEPARTMENTS as $index => [$slug, $name]) {
        Department::forceCreate([
            'slug' => $slug,
            'name' => $name,
            'name_ar' => $name,
            'sort_order' => $index + 1,
        ]);
    }
});

it('seeds every doctor listed on the public departments page', function () {
    $this->seed(DoctorSeeder::class);

    expect(Doctor::where('is_active', true)->count())->toBe(38);
    expect(Doctor::where('name', 'Dr. Asmaa Manzoor Uddin Sheikh')->sole()->job)
        ->toBe('Senior Registrar in Psychiatry');
    expect(Doctor::where('name', 'Dr. Hassan Hamza Almir')->sole()->department->name)
        ->toBe('Cardiology');
});

it('orders doctors to match the public departments page', function () {
    $this->seed(DoctorSeeder::class);

    $order = Department::with(['doctors' => fn ($query) => $query->orderBy('sort_order')])
        ->orderBy('sort_order')
        ->get()
        ->flatMap
        ->doctors
        ->pluck('name');

    expect($order->take(6)->all())->toBe([
        'Dr. Hiba Muhamad Ali',
        'Dr. Hasnaa Saber Hammad',
        'Dr. Hoyam Haidar Ibrahim',
        'Dr. Shamila Yaser',
        'Dr. Muhannad Hamarsha',
        'Dr. Amira Tabl',
    ]);

    expect($order->slice(6, 4)->values()->all())->toBe([
        'Dr. Rabab Salem',
        'Dr. Nagwa Ahmed Saad Habiba',
        'Dr. Reham Wahba Abdraboh Elbohy',
        'Dr. Mohammad Sami Montaser',
    ]);
});

it('stores the bundled photo for a doctor who has none', function () {
    $this->seed(DoctorSeeder::class);

    $doctor = Doctor::where('name', 'Dr. Mahmoud Mostafa Ashour')->sole();

    expect($doctor->image)->toBe('doctors/mahmoud-ashour.jpg');
    Storage::disk('public')->assertExists($doctor->image);
});

it('keeps a photo uploaded through the admin', function () {
    $this->seed(DoctorSeeder::class);

    Doctor::where('name', 'Dr. Mahmoud Mostafa Ashour')->update(['image' => 'doctors/uploaded.jpg']);

    $this->seed(DoctorSeeder::class);

    expect(Doctor::where('name', 'Dr. Mahmoud Mostafa Ashour')->sole()->image)
        ->toBe('doctors/uploaded.jpg');
});

it('deactivates a doctor who is no longer on the list', function () {
    $stale = Doctor::factory()->create([
        'name' => 'Psychiatry Consultant',
        'department_id' => Department::where('slug', 'psychiatry')->sole()->id,
        'is_active' => true,
    ]);

    $this->seed(DoctorSeeder::class);

    expect($stale->fresh()->is_active)->toBeFalse();
});
