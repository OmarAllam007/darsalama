<?php

use App\Models\Department;
use App\Models\Doctor;
use App\Models\Offer;
use App\Models\Package;

use function Pest\Laravel\get;

it('scopes offers to each doctor rather than the whole department', function () {
    // Two departments so ordering is deterministic (first created = index 0).
    $withOffer = Doctor::factory()->for(Department::factory())->create();
    $withoutOffer = Doctor::factory()->for(Department::factory())->create();

    Offer::factory()->for($withOffer)->create();

    get(route('doctors'))
        ->assertInertia(fn ($page) => $page
            ->where('departments.0.doctors.0.offers_count', 1)
            ->has('departments.0.doctors.0.offers', 1)
            ->where('departments.1.doctors.0.offers_count', 0)
            ->has('departments.1.doctors.0.offers', 0)
        );

    expect($withoutOffer->offers()->count())->toBe(0);
});

it('builds the doctor profile offers section from department packages, not offers', function () {
    $department = Department::factory()->create();
    $doctor = Doctor::factory()->for($department)->create();

    Package::factory()->for($department)->create(['name_en' => 'Normal Delivery']);
    Offer::factory()->for($doctor)->create(['title' => 'Stale Offer']);

    get(route('doctors.show', $doctor))
        ->assertInertia(fn ($page) => $page
            ->has('doctor.department.packages', 1)
            ->where('doctor.department.packages.0.name_en', 'Normal Delivery')
            ->missing('doctor.offers')
        );
});
