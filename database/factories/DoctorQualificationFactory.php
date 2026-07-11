<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\DoctorQualification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DoctorQualification>
 */
class DoctorQualificationFactory extends Factory
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
            'name' => fake()->words(2, true),
            'name_ar' => fake()->words(2, true),
        ];
    }
}
