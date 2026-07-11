<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Offer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Offer>
 */
class OfferFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'department_id' => Department::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'image' => null,
        ];
    }
}
