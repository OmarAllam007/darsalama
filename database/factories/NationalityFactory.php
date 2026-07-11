<?php

namespace Database\Factories;

use App\Models\Nationality;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Nationality>
 */
class NationalityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->country(),
            'name_ar' => fake()->unique()->words(2, true),
            'flag' => null,
        ];
    }
}
