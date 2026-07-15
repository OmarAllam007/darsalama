<?php

namespace Database\Factories;

use App\Models\Package;
use App\Models\PackageStage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PackageStage>
 */
class PackageStageFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'package_id' => Package::factory(),
            'name_en' => fake()->words(2, true),
            'name_ar' => fake()->words(2, true),
            'name_ur' => null,
            'name_tl' => null,
            'subtitle_en' => null,
            'subtitle_ar' => null,
            'subtitle_ur' => null,
            'subtitle_tl' => null,
            'free_consultations' => 2,
            'sort_order' => 0,
        ];
    }
}
