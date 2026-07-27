<?php

use App\Models\Department;
use App\Models\Package;

it('only shows a struck-out price when it differs from the price paid', function () {
    $department = Department::factory()->create(['slug' => 'gynecology', 'name' => 'Gynecology']);

    Package::factory()->create([
        'department_id' => $department->id,
        'name_en' => 'Flat Price Package',
        'price' => 2500,
        'original_price' => 2500,
        'sort_order' => 1,
    ]);

    Package::factory()->create([
        'department_id' => $department->id,
        'name_en' => 'Discounted Package',
        'price' => 2500,
        'original_price' => 3250,
        'sort_order' => 2,
    ]);

    $page = visit('/obgyn');

    $page->assertNoJavaScriptErrors();

    // One package is discounted, so exactly one crossed-out price should render.
    expect($page->script('document.querySelectorAll(".price-card .old").length'))->toBe(1);
});
