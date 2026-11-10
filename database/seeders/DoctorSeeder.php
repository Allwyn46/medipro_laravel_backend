<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DoctorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ensure Admin User has role 'admin'
        $admin = User::firstOrCreate(
            ['email' => 'admin@medipro.com'],
            [
                'name' => 'Clinic Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        if ($admin->role !== 'admin') {
            $admin->update(['role' => 'admin']);
        }

        // 2. Define Doctors
        $doctorsData = [
            [
                'name' => 'Dr. Eddie Lake',
                'email' => 'eddie.lake@medipro.com',
                'specialty' => 'Dental Implants & Cosmetic',
                'phone' => '+91 98765 00001',
                'consultation_fee' => 1500.00,
                'room' => 'Room 101',
            ],
            [
                'name' => 'Dr. Jamik Tashpulatov',
                'email' => 'jamik.tashpulatov@medipro.com',
                'specialty' => 'Orthodontics & Clear Aligners',
                'phone' => '+91 98765 00002',
                'consultation_fee' => 2000.00,
                'room' => 'Room 102',
            ],
            [
                'name' => 'Dr. Emily Whalen',
                'email' => 'emily.whalen@medipro.com',
                'specialty' => 'Cardiology Checkup & ECG',
                'phone' => '+91 98765 00003',
                'consultation_fee' => 1800.00,
                'room' => 'Room 201',
            ],
            [
                'name' => 'Dr. Sarah Jenkins',
                'email' => 'sarah.jenkins@medipro.com',
                'specialty' => 'General & Preventative Care',
                'phone' => '+91 98765 00004',
                'consultation_fee' => 1200.00,
                'room' => 'Room 103',
            ],
        ];

        foreach ($doctorsData as $doc) {
            $user = User::firstOrCreate(
                ['email' => $doc['email']],
                [
                    'name' => $doc['name'],
                    'password' => Hash::make('password'),
                    'role' => 'doctor',
                ]
            );

            if ($user->role !== 'doctor') {
                $user->update(['role' => 'doctor']);
            }

            $doctor = Doctor::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => $doc['name'],
                    'email' => $doc['email'],
                    'specialty' => $doc['specialty'],
                    'phone' => $doc['phone'],
                    'consultation_fee' => $doc['consultation_fee'],
                    'room' => $doc['room'],
                    'is_active' => true,
                ]
            );

            // 3. Backfill existing appointments and leads matching doctor name
            Appointment::where('doctor', $doctor->name)
                ->whereNull('doctor_id')
                ->update(['doctor_id' => $doctor->id]);

            Lead::where('doctor', $doctor->name)
                ->whereNull('doctor_id')
                ->update(['doctor_id' => $doctor->id]);
        }
    }
}
