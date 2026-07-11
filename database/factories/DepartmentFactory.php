<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

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
        return [
            'name' => fake()->unique()->randomElement([
                'Ophthalmology', 'Pediatrics', 'Anesthesia', 'OBGyn', 'General Surgery', 'Cardiology', 'Dermatology',
            ]),
            'name_ar' => fake()->unique()->randomElement([
                'طب العيون', 'طب الأطفال', 'التخدير', 'أمراض النساء والولادة', 'الجراحة العامة', 'أمراض القلب', 'الأمراض الجلدية',
            ]),
        ];
    }
}
