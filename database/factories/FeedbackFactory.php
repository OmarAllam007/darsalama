<?php

namespace Database\Factories;

use App\Models\Feedback;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Feedback>
 */
class FeedbackFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'rating' => fake()->randomElement(['terrible', 'bad', 'okay', 'good', 'excellent']),
            'mobile' => fake()->numerify('05########'),
            'notes' => fake()->optional()->sentence(),
            'status' => 'new',
        ];
    }

    /**
     * Indicate a negative rating that should trigger a follow-up alert.
     */
    public function negative(): static
    {
        return $this->state(fn (): array => [
            'rating' => fake()->randomElement(Feedback::NEGATIVE_RATINGS),
        ]);
    }
}
