<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'doctor_id' => Doctor::factory(),
            'name' => fake()->words(3, true),
            'name_ar' => fake()->words(3, true),
            'description' => fake()->sentence(),
        ];
    }
}
