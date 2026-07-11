<?php

namespace Database\Factories;

use App\Models\CallbackRequest;
use App\Models\Doctor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CallbackRequest>
 */
class CallbackRequestFactory extends Factory
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
            'name' => fake()->name(),
            'phone' => fake()->numerify('05########'),
            'best_time' => 'Morning',
            'preferred_contact' => 'phone',
            'status' => 'new',
        ];
    }
}
