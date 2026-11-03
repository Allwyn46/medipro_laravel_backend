<?php

namespace Database\Factories;

use App\Models\Lead;
use App\Models\LeadActivity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LeadActivity>
 */
class LeadActivityFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<LeadActivity>
     */
    protected $model = LeadActivity::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'lead_id' => Lead::factory(),
            'type' => fake()->randomElement(['Call', 'Email', 'Consultation', 'Note', 'Status Change']),
            'title' => fake()->sentence(3),
            'description' => fake()->sentence(8),
            'doctor' => fake()->randomElement([
                'Dr. Eddie Lake',
                'Dr. Jamik Tashpulatov',
                'Dr. Emily Whalen',
                'Staff Emma',
                'Staff Sarah',
            ]),
            'date' => fake()->dateTimeBetween('-1 month', 'now')->format('Y-m-d H:i'),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
