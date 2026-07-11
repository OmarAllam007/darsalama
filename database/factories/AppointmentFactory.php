<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Appointment>
 */
class AppointmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'doctor_id' => Doctor::factory(),
            'date' => fake()->dateTimeBetween('+1 day', '+2 weeks')->format('Y-m-d'),
            'time' => '09:00',
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->numerify('05########'),
            'status' => 'confirmed',
        ];
    }
}
