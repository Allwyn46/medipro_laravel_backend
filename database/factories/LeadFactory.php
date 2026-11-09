<?php

namespace Database\Factories;

use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lead>
 */
class LeadFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<Lead>
     */
    protected $model = Lead::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'service' => fake()->randomElement([
                'Dental Implants',
                'Orthodontics & Aligners',
                'Cardiology Checkup',
                'Dermatology & Laser Therapy',
                'Cosmetic Veneers',
                'General Health Consultation',
            ]),
            'status' => fake()->randomElement([
                'New',
                'Contacted',
                'Consultation Scheduled',
                'Treatment Plan Sent',
                'Won',
                'Lost',
            ]),
            'priority' => fake()->randomElement(['High', 'Medium', 'Low']),
            'value' => fake()->randomElement([450, 1200, 1850, 2900, 3200, 4500, 6400]),
            'payment_status' => fake()->randomElement(['Pending', 'Partially Paid', 'Paid']),
            'doctor' => fake()->randomElement([
                'Dr. Eddie Lake',
                'Dr. Jamik Tashpulatov',
                'Dr. Emily Whalen',
            ]),
            'source' => fake()->randomElement([
                'Website Form',
                'Google Ads',
                'Referral',
                'Direct Call',
                'Social Media',
            ]),
            'last_contact_date' => fake()->dateTimeBetween('-1 month', 'now')->format('Y-m-d'),
            'notes' => fake()->sentence(),
            'created_at' => fake()->dateTimeBetween('-2 months', 'now'),
            'updated_at' => now(),
        ];
    }
}
