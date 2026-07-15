<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Package;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Package>
 */
class PackageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'department_id' => Department::factory(),
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 100000),
            'type' => 'delivery',
            'name_en' => $name,
            'name_ar' => fake()->words(3, true),
            'name_ur' => null,
            'name_tl' => null,
            'category_label_en' => 'Package',
            'category_label_ar' => 'باقة',
            'subtitle_en' => null,
            'description_en' => fake()->paragraph(),
            'description_ar' => fake()->paragraph(),
            'tagline_en' => 'Prices excl. VAT',
            'tagline_ar' => 'الأسعار لا تشمل الضريبة',
            'image' => null,
            'price' => fake()->randomFloat(2, 250, 8000),
            'original_price' => null,
            'sort_order' => 0,
            'is_active' => true,
        ];
    }

    public function care(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => 'care',
            'price' => null,
        ]);
    }

    public function transport(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => 'transport',
        ]);
    }
}
