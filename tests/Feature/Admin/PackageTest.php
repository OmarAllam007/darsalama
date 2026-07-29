<?php

use App\Models\Department;
use App\Models\Package;
use App\Models\User;
use Database\Seeders\ObgynPackageSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guests are redirected to login', function () {
    $this->get(route('admin.packages.index'))->assertRedirect(route('admin.login'));
});

test('an authenticated user can create a package with features', function () {
    $this->actingAs(User::factory()->create());
    $department = Department::factory()->create();

    $response = $this->post(route('admin.packages.store'), [
        'department_id' => $department->id,
        'type' => 'delivery',
        'name_en' => 'Normal Delivery',
        'name_ar' => 'الولادة الطبيعية',
        'price' => '2500',
        'original_price' => '3250',
        'is_active' => '1',
        'features' => [
            ['is_highlighted' => '1', 'label_en' => 'Free Circumcision', 'label_ar' => 'ختان مجاني'],
            ['is_highlighted' => '0', 'label_en' => 'Private Room', 'label_ar' => 'غرفة خاصة'],
        ],
    ]);

    $response->assertRedirect(route('admin.packages.index'));

    $package = Package::firstWhere('name_en', 'Normal Delivery');
    expect($package)->not->toBeNull();
    expect($package->department_id)->toBe($department->id);
    expect($package->features)->toHaveCount(2);
    expect($package->features->firstWhere('is_highlighted', true)->label_en)->toBe('Free Circumcision');
});

test('an authenticated user can create a care package with tiers, stages and tests', function () {
    $this->actingAs(User::factory()->create());
    $department = Department::factory()->create();

    $this->post(route('admin.packages.store'), [
        'department_id' => $department->id,
        'type' => 'care',
        'name_en' => 'Maternity Care',
        'name_ar' => 'متابعة الحمل',
        'is_active' => '1',
        'price_tiers' => [
            ['label_en' => 'Specialist', 'label_ar' => 'أخصائي', 'amount' => '400'],
            ['label_en' => 'Consultant', 'label_ar' => 'استشاري', 'amount' => '650'],
        ],
        'stages' => [
            [
                'name_en' => 'First Trimester',
                'name_ar' => 'الثلث الأول',
                'free_consultations' => '2',
                'tests' => [
                    ['name' => 'CBC', 'code' => 'LB1052'],
                    ['name' => 'Urine', 'code' => 'Lb1107'],
                ],
            ],
        ],
    ])->assertRedirect(route('admin.packages.index'));

    $package = Package::firstWhere('name_en', 'Maternity Care');
    expect($package->priceTiers)->toHaveCount(2);
    expect($package->stages)->toHaveCount(1);
    expect($package->stages->first()->tests)->toHaveCount(2);
    expect($package->stages->first()->free_consultations)->toBe(2);
});

test('an authenticated user can update a package and resync children', function () {
    $this->actingAs(User::factory()->create());
    $package = Package::factory()->create(['type' => 'delivery']);
    $package->features()->create(['label_en' => 'Old', 'label_ar' => 'قديم']);

    $this->put(route('admin.packages.update', $package), [
        'department_id' => $package->department_id,
        'type' => 'delivery',
        'name_en' => 'Updated Package',
        'name_ar' => $package->name_ar,
        'price' => '99.50',
        'is_active' => '1',
        'features' => [
            ['is_highlighted' => '0', 'label_en' => 'New Feature', 'label_ar' => 'ميزة جديدة'],
        ],
    ])->assertRedirect(route('admin.packages.index'));

    $package->refresh();
    expect($package->name_en)->toBe('Updated Package');
    expect($package->price)->toBe('99.50');
    expect($package->features)->toHaveCount(1);
    expect($package->features->first()->label_en)->toBe('New Feature');
});

test('an authenticated user can delete a package', function () {
    $this->actingAs(User::factory()->create());
    $package = Package::factory()->create();

    $this->delete(route('admin.packages.destroy', $package))
        ->assertRedirect(route('admin.packages.index'));

    $this->assertDatabaseMissing('packages', ['id' => $package->id]);
});

test('an authenticated user can replace a package poster image', function () {
    Storage::fake('public');
    Storage::disk('public')->put('packages/old.jpg', 'old');

    $this->actingAs(User::factory()->create());
    $package = Package::factory()->create(['type' => 'delivery', 'image' => 'packages/old.jpg']);

    $this->put(route('admin.packages.update', $package), [
        'department_id' => $package->department_id,
        'type' => 'delivery',
        'name_en' => $package->name_en,
        'name_ar' => $package->name_ar,
        'is_active' => '1',
        'image' => UploadedFile::fake()->image('poster.jpg'),
    ])->assertRedirect(route('admin.packages.index'));

    $package->refresh();
    expect($package->image)->not->toBe('packages/old.jpg');
    Storage::disk('public')->assertExists($package->image);
    Storage::disk('public')->assertMissing('packages/old.jpg');
});

test('the seeder publishes a default poster image without overwriting a custom one', function () {
    Storage::fake('public');

    $this->seed(ObgynPackageSeeder::class);

    $package = Package::firstWhere('slug', 'normal-delivery');
    expect($package->image)->toBe('packages/post-normal.jpg');
    Storage::disk('public')->assertExists('packages/post-normal.jpg');

    $package->update(['image' => 'packages/custom.jpg']);
    $this->seed(ObgynPackageSeeder::class);

    expect($package->refresh()->image)->toBe('packages/custom.jpg');
});

test('creating a package requires a type and english name', function () {
    $this->actingAs(User::factory()->create());
    $department = Department::factory()->create();

    $this->post(route('admin.packages.store'), [
        'department_id' => $department->id,
        'name_ar' => 'بدون اسم',
    ])->assertSessionHasErrors(['type', 'name_en']);
});
