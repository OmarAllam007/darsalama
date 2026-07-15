<?php

namespace Database\Factories;

use App\Models\Package;
use App\Models\PackagePriceTier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PackagePriceTier>
 */
class PackagePriceTierFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'package_id' => Package::factory(),
            'label_en' => fake()->randomElement(['Specialist', 'Consultant']),
            'label_ar' => fake()->randomElement(['أخصائي', 'استشاري']),
            'label_ur' => null,
            'label_tl' => null,
            'amount' => fake()->randomFloat(2, 100, 1000),
            'sort_order' => 0,
        ];
    }
}
