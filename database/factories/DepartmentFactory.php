<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Department>
 */
class DepartmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->randomElement([
            'Ophthalmology', 'Pediatrics', 'Anesthesia', 'OBGyn', 'General Surgery', 'Cardiology', 'Dermatology',
        ]);

        return [
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 100000),
            'name' => $name,
            'name_ar' => fake()->unique()->randomElement([
                'طب العيون', 'طب الأطفال', 'التخدير', 'أمراض النساء والولادة', 'الجراحة العامة', 'أمراض القلب', 'الأمراض الجلدية',
            ]),
        ];
    }
}
