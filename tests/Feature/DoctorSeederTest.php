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
    ['general-surgery', 'General Surgery'],
    ['orthopedics', 'Orthopedics'],
    ['dermatology', 'Dermatology'],
    ['cardiology', 'Cardiology'],
    ['ent', 'ENT'],
    ['ophthalmology', 'Ophthalmology'],
    ['urology', 'Urology'],
    ['dental', 'Dental'],
    ['spine-surgery-neurology', 'Neuroscience'],
    ['rheumatology', 'Rheumatology'],
    ['psychiatry', 'Psychiatry'],
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

    expect(Doctor::where('is_active', true)->count())->toBe(39);
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

it('groups doctors into the departments the public page groups them under', function () {
    $this->seed(DoctorSeeder::class);

    $counts = Department::withCount('doctors')->pluck('doctors_count', 'name');

    expect($counts->all())->toBe([
        'Gynecology' => 6,
        'Pediatrics' => 4,
        'Internal Medicine' => 5,
        'General Surgery' => 4,
        'Orthopedics' => 2,
        'Dermatology' => 1,
        'Cardiology' => 2,
        'ENT' => 1,
        'Ophthalmology' => 1,
        'Urology' => 2,
        'Dental' => 2,
        'Neuroscience' => 3,
        'Rheumatology' => 2,
        'Psychiatry' => 1,
        'General Practice' => 3,
    ]);
});

it('leaves a doctor the site shows without a photo without one', function () {
    $this->seed(DoctorSeeder::class);

    expect(Doctor::whereIn('name', [
        'Dr. Manal Matar Al-Anazi',
        'Dr. Hassan Hamza Almir',
        'Dr. Hashim Taher Bin Baqer Al-Salman',
    ])->pluck('image')->all())->toBe([null, null, null]);
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

it('deactivates the placeholder its psychiatrist supersedes', function () {
    $stale = Doctor::factory()->create([
        'name' => 'Psychiatry Consultant',
        'department_id' => Department::where('slug', 'psychiatry')->sole()->id,
        'is_active' => true,
    ]);

    $this->seed(DoctorSeeder::class);

    expect($stale->fresh()->is_active)->toBeFalse();
});

it('leaves a doctor added through the admin alone', function () {
    $added = Doctor::factory()->create([
        'name' => 'Dr. Someone The Seeder Never Heard Of',
        'department_id' => Department::where('slug', 'general-surgery')->sole()->id,
        'is_active' => true,
    ]);

    $this->seed(DoctorSeeder::class);

    expect($added->fresh()->is_active)->toBeTrue();
});
