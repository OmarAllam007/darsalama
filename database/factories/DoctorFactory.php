<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Doctor;
use App\Models\Nationality;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Doctor>
 */
class DoctorFactory extends Factory
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
            'nationality_id' => Nationality::factory(),
            'name' => 'Dr. '.fake()->name(),
            'name_ar' => 'د. '.fake()->firstName(),
            'job' => fake()->jobTitle(),
            'job_ar' => fake()->words(2, true),
            'image' => null,
            'is_active' => true,
        ];
    }
}
