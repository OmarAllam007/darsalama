<?php

namespace Database\Factories;

use App\Enums\DoctorScheduleStatus;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DoctorSchedule>
 */
class DoctorScheduleFactory extends Factory
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
            'date' => fake()->dateTimeBetween('+1 day', '+2 weeks')->format('Y-m-d'),
            'status' => DoctorScheduleStatus::Work,
            'windows' => [
                ['start' => '08:00', 'end' => '12:00', 'bookable' => true],
                ['start' => '16:00', 'end' => '20:00', 'bookable' => true],
            ],
            'note' => null,
        ];
    }

    /**
     * A day the doctor is not seeing patients (off, vacation, or no clinic).
     */
    public function closed(DoctorScheduleStatus $status = DoctorScheduleStatus::Off): static
    {
        return $this->state(fn (): array => [
            'status' => $status,
            'windows' => [],
        ]);
    }

    /**
     * A day where the given windows are closed for booking (in surgery / OR).
     */
    public function operating(): static
    {
        return $this->state(fn (): array => [
            'status' => DoctorScheduleStatus::Work,
            'windows' => [
                ['start' => '08:00', 'end' => '16:00', 'bookable' => false],
            ],
        ]);
    }
}
