<?php

namespace Database\Factories;

use App\Models\Doctor;
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
            'doctor_id' => Doctor::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'image' => null,
            'price' => null,
            'original_price' => null,
            'is_expired' => false,
        ];
    }

    /**
     * @return Factory<Offer>
     */
    public function expired(): Factory
    {
        return $this->state(fn (array $attributes) => ['is_expired' => true]);
    }
}
