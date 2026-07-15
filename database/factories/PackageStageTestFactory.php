<?php

namespace Database\Factories;

use App\Models\PackageStage;
use App\Models\PackageStageTest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PackageStageTest>
 */
class PackageStageTestFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'package_stage_id' => PackageStage::factory(),
            'name' => fake()->randomElement(['CBC', 'RBS', 'Urine', 'Ultrasound']),
            'code' => strtoupper(fake()->bothify('??####')),
            'sort_order' => 0,
        ];
    }
}
