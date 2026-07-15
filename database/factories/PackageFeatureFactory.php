<?php

namespace Database\Factories;

use App\Models\Package;
use App\Models\PackageFeature;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PackageFeature>
 */
class PackageFeatureFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'package_id' => Package::factory(),
            'is_highlighted' => false,
            'label_en' => fake()->words(3, true),
            'label_ar' => fake()->words(3, true),
            'label_ur' => null,
            'label_tl' => null,
            'sort_order' => 0,
        ];
    }
}
