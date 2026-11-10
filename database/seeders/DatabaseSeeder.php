<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'admin@medipro.com'],
            ['name' => 'admin', 'password' => bcrypt('password')]
        );

        $this->call([
            DoctorSeeder::class,
            LeadSeeder::class,
            AppointmentSeeder::class,
            DoctorSeeder::class, // Run again to ensure backfilling of leads and appointments
        ]);
    }
}
