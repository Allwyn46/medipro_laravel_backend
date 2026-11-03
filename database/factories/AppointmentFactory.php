<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Appointment>
 */
class AppointmentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<Appointment>
     */
    protected $model = Appointment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'patient_name' => fake()->name(),
            'patient_email' => fake()->safeEmail(),
            'patient_phone' => fake()->phoneNumber(),
            'service' => fake()->randomElement([
                'Dental Implants',
                'Orthodontics & Aligners',
                'Cardiology Checkup',
                'Dermatology & Laser Therapy',
                'Cosmetic Veneers',
            ]),
            'doctor' => fake()->randomElement([
                'Dr. Eddie Lake',
                'Dr. Jamik Tashpulatov',
                'Dr. Emily Whalen',
            ]),
            'date' => fake()->randomElement(['Today', 'Tomorrow', 'Nov 6', 'Nov 7']),
            'time' => fake()->randomElement(['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:15 PM']),
            'status' => fake()->randomElement(['Confirmed', 'In Progress', 'Scheduled', 'Pending']),
            'type' => fake()->randomElement(['Initial Consultation', 'Follow-up', 'Procedure', 'Health Check']),
            'room' => 'Suite 101',
            'duration' => '45 mins',
            'lead_id' => Lead::factory(),
            'notes' => fake()->sentence(),
            'source' => 'Website Booking',
            'requested_at' => 'Just now',
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
