<?php

use App\Models\Department;
use App\Models\Doctor;
use App\Models\Offer;

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
