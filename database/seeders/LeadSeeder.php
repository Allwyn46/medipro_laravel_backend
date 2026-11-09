<?php

namespace Database\Seeders;

use App\Models\Lead;
use App\Models\LeadActivity;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LeadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $leads = [
            [
                'id' => 1,
                'name' => 'Sarah Connor',
                'email' => 'sarah.connor@example.com',
                'phone' => '+1 (555) 234-5678',
                'service' => 'Dental Implants',
                'status' => 'New',
                'priority' => 'High',
                'value' => 3200,
                'doctor' => 'Dr. Eddie Lake',
                'source' => 'Website Form',
                'createdAt' => '2026-11-02',
                'lastContactDate' => '2026-11-02',
                'notes' => 'Patient expressed urgent need for full upper molar implants. Prefers morning appointments.',
                'activities' => [
                    [
                        'id' => 101,
                        'type' => 'Note',
                        'title' => 'Inquiry Received',
                        'description' => 'Submitted online contact form regarding dental implant options and pricing.',
                        'doctor' => 'Dr. Eddie Lake',
                        'date' => '2026-11-02 09:15',
                    ],
                    [
                        'id' => 102,
                        'type' => 'Call',
                        'title' => 'Initial Phone Screen',
                        'description' => 'Left voicemail with clinical coordinator contact details.',
                        'doctor' => 'Staff Sarah',
                        'date' => '2026-11-02 11:30',
                    ],
                ],
            ],
            [
                'id' => 2,
                'name' => 'Michael Chen',
                'email' => 'michael.chen@example.com',
                'phone' => '+1 (555) 345-6789',
                'service' => 'Orthodontics & Aligners',
                'status' => 'Consultation Scheduled',
                'priority' => 'High',
                'value' => 4500,
                'doctor' => 'Dr. Jamik Tashpulatov',
                'source' => 'Google Ads',
                'createdAt' => '2026-10-29',
                'lastContactDate' => '2026-11-01',
                'notes' => 'Interested in clear aligners for teeth alignment. Consultation booked for Thursday.',
                'activities' => [
                    [
                        'id' => 201,
                        'type' => 'Call',
                        'title' => 'Consultation Booking Call',
                        'description' => 'Scheduled in-clinic consultation and 3D digital scan for Nov 6.',
                        'doctor' => 'Dr. Jamik Tashpulatov',
                        'date' => '2026-11-01 14:00',
                    ],
                    [
                        'id' => 202,
                        'type' => 'Email',
                        'title' => 'Pre-Appointment Questionnaire',
                        'description' => 'Sent patient health history and insurance verification form.',
                        'doctor' => 'Staff Emma',
                        'date' => '2026-11-01 14:15',
                    ],
                ],
            ],
            [
                'id' => 3,
                'name' => 'Emma Watson',
                'email' => 'emma.watson@example.com',
                'phone' => '+1 (555) 456-7890',
                'service' => 'Cardiology Checkup',
                'status' => 'Treatment Plan Sent',
                'priority' => 'Medium',
                'value' => 1850,
                'doctor' => 'Dr. Emily Whalen',
                'source' => 'Referral',
                'createdAt' => '2026-10-27',
                'lastContactDate' => '2026-10-31',
                'notes' => 'Comprehensive cardiac stress test & Holter monitor plan sent for insurance approval.',
                'activities' => [
                    [
                        'id' => 301,
                        'type' => 'Consultation',
                        'title' => 'Clinical Consultation',
                        'description' => 'Completed initial cardiac evaluation and ECG assessment.',
                        'doctor' => 'Dr. Emily Whalen',
                        'date' => '2026-10-30 10:30',
                    ],
                    [
                        'id' => 302,
                        'type' => 'Email',
                        'title' => 'Treatment Plan Dispatched',
                        'description' => 'Shared itemized breakdown of cardiac monitoring package.',
                        'doctor' => 'Dr. Emily Whalen',
                        'date' => '2026-10-31 16:45',
                    ],
                ],
            ],
            [
                'id' => 4,
                'name' => 'David Rodriguez',
                'email' => 'david.rodriguez@example.com',
                'phone' => '+1 (555) 567-8901',
                'service' => 'Dermatology & Laser Therapy',
                'status' => 'Contacted',
                'priority' => 'Medium',
                'value' => 1200,
                'doctor' => 'Dr. Eddie Lake',
                'source' => 'Direct Call',
                'createdAt' => '2026-10-30',
                'lastContactDate' => '2026-11-01',
                'notes' => 'Looking for scar revision and laser skin rejuvenation package.',
                'activities' => [
                    [
                        'id' => 401,
                        'type' => 'Call',
                        'title' => 'Patient Inquiry Call',
                        'description' => 'Discussed laser therapy options and expected downtime.',
                        'doctor' => 'Dr. Eddie Lake',
                        'date' => '2026-11-01 15:20',
                    ],
                ],
            ],
            [
                'id' => 5,
                'name' => 'Jessica Taylor',
                'email' => 'jessica.taylor@example.com',
                'phone' => '+1 (555) 678-9012',
                'service' => 'Cosmetic Veneers',
                'status' => 'Won',
                'priority' => 'High',
                'value' => 6400,
                'doctor' => 'Dr. Jamik Tashpulatov',
                'source' => 'Social Media',
                'createdAt' => '2026-10-18',
                'lastContactDate' => '2026-10-29',
                'notes' => 'Deposit paid. Full smile makeover scheduled across two sessions.',
                'activities' => [
                    [
                        'id' => 501,
                        'type' => 'Status Change',
                        'title' => 'Deal Won & Booked',
                        'description' => 'Patient signed treatment agreement and paid 50% deposit.',
                        'doctor' => 'Dr. Jamik Tashpulatov',
                        'date' => '2026-10-29 11:00',
                    ],
                ],
            ],
            [
                'id' => 6,
                'name' => 'Robert Martinez',
                'email' => 'robert.martinez@example.com',
                'phone' => '+1 (555) 789-0123',
                'service' => 'Knee Arthroscopy & Rehab',
                'status' => 'Consultation Scheduled',
                'priority' => 'High',
                'value' => 5800,
                'doctor' => 'Dr. Emily Whalen',
                'source' => 'Referral',
                'createdAt' => '2026-10-25',
                'lastContactDate' => '2026-11-02',
                'notes' => 'MRI scans uploaded. Referred by sports clinic for meniscus evaluation.',
                'activities' => [
                    [
                        'id' => 601,
                        'type' => 'Consultation',
                        'title' => 'Pre-Op Consultation Booked',
                        'description' => 'Consultation scheduled for Nov 7 with orthopedic team.',
                        'doctor' => 'Dr. Emily Whalen',
                        'date' => '2026-11-02 08:45',
                    ],
                ],
            ],
            [
                'id' => 7,
                'name' => 'Amanda White',
                'email' => 'amanda.white@example.com',
                'phone' => '+1 (555) 890-1234',
                'service' => 'Pediatric Health Screening',
                'status' => 'New',
                'priority' => 'Low',
                'value' => 450,
                'doctor' => 'Dr. Eddie Lake',
                'source' => 'Website Form',
                'createdAt' => '2026-11-03',
                'lastContactDate' => '2026-11-03',
                'notes' => 'Looking for routine annual health checkup for two children.',
                'activities' => [
                    [
                        'id' => 701,
                        'type' => 'Note',
                        'title' => 'Form Received',
                        'description' => 'Requested weekend slot for routine checkups.',
                        'doctor' => 'Dr. Eddie Lake',
                        'date' => '2026-11-03 08:10',
                    ],
                ],
            ],
            [
                'id' => 8,
                'name' => 'Daniel Black',
                'email' => 'daniel.black@example.com',
                'phone' => '+1 (555) 901-2345',
                'service' => 'Physiotherapy Program',
                'status' => 'Treatment Plan Sent',
                'priority' => 'Medium',
                'value' => 1400,
                'doctor' => 'Dr. Jamik Tashpulatov',
                'source' => 'Google Ads',
                'createdAt' => '2026-10-22',
                'lastContactDate' => '2026-10-31',
                'notes' => '10-week spinal rehabilitation program proposed. Awaiting confirmation.',
                'activities' => [
                    [
                        'id' => 801,
                        'type' => 'Email',
                        'title' => 'Rehab Proposal Sent',
                        'description' => 'Detailed 10-session package including hydrotherapy sent.',
                        'doctor' => 'Dr. Jamik Tashpulatov',
                        'date' => '2026-10-31 17:00',
                    ],
                ],
            ],
            [
                'id' => 9,
                'name' => 'Olivia Wilson',
                'email' => 'olivia.wilson@example.com',
                'phone' => '+1 (555) 012-3456',
                'service' => 'Cataract Assessment',
                'status' => 'Contacted',
                'priority' => 'Medium',
                'value' => 2900,
                'doctor' => 'Dr. Emily Whalen',
                'source' => 'Referral',
                'createdAt' => '2026-10-24',
                'lastContactDate' => '2026-10-29',
                'notes' => 'Followed up via telephone. Patient requested time to review dates with family.',
                'activities' => [
                    [
                        'id' => 901,
                        'type' => 'Call',
                        'title' => 'Follow-up Call',
                        'description' => 'Explained multifocal lens options.',
                        'doctor' => 'Dr. Emily Whalen',
                        'date' => '2026-10-29 13:15',
                    ],
                ],
            ],
            [
                'id' => 10,
                'name' => 'James Anderson',
                'email' => 'james.anderson@example.com',
                'phone' => '+1 (555) 123-7890',
                'service' => 'Sleep Apnea Diagnostics',
                'status' => 'Lost',
                'priority' => 'Low',
                'value' => 750,
                'doctor' => 'Dr. Eddie Lake',
                'source' => 'Website Form',
                'createdAt' => '2026-10-15',
                'lastContactDate' => '2026-10-25',
                'notes' => 'Patient decided to proceed with clinic closer to their home.',
                'activities' => [
                    [
                        'id' => 1001,
                        'type' => 'Status Change',
                        'title' => 'Marked as Lost',
                        'description' => 'Patient cited travel distance constraints.',
                        'doctor' => 'Dr. Eddie Lake',
                        'date' => '2026-10-25 10:00',
                    ],
                ],
            ],
            [
                'id' => 11,
                'name' => 'Sophia Martinez',
                'email' => 'sophia.m@example.com',
                'phone' => '+1 (555) 234-8901',
                'service' => 'Executive Health Screening',
                'status' => 'Won',
                'priority' => 'High',
                'value' => 2200,
                'doctor' => 'Dr. Jamik Tashpulatov',
                'source' => 'Corporate Partner',
                'createdAt' => '2026-10-14',
                'lastContactDate' => '2026-10-28',
                'notes' => 'Corporate executive package booked and paid by employer.',
                'activities' => [
                    [
                        'id' => 1101,
                        'type' => 'Status Change',
                        'title' => 'Appointment Confirmed',
                        'description' => 'VIP suite reserved for half-day health checkup.',
                        'doctor' => 'Dr. Jamik Tashpulatov',
                        'date' => '2026-10-28 16:30',
                    ],
                ],
            ],
            [
                'id' => 12,
                'name' => 'Lucas Brown',
                'email' => 'lucas.brown@example.com',
                'phone' => '+1 (555) 345-9012',
                'service' => 'General Health Consultation',
                'status' => 'New',
                'priority' => 'Medium',
                'value' => 300,
                'doctor' => 'Dr. Emily Whalen',
                'source' => 'Direct Call',
                'createdAt' => '2026-11-03',
                'lastContactDate' => '2026-11-03',
                'notes' => 'New patient in the area looking to register family.',
                'activities' => [
                    [
                        'id' => 1201,
                        'type' => 'Call',
                        'title' => 'Registration Inquiry',
                        'description' => 'Provided registration pack via email.',
                        'doctor' => 'Staff Sarah',
                        'date' => '2026-11-03 10:45',
                    ],
                ],
            ],
        ];

        foreach ($leads as $data) {
            $activities = $data['activities'] ?? [];
            unset($data['activities']);

            $createdAt = Carbon::parse($data['createdAt']);
            $lastContact = Carbon::parse($data['lastContactDate']);
            unset($data['createdAt'], $data['lastContactDate']);

            $lead = Lead::updateOrCreate(
                ['id' => $data['id']],
                array_merge($data, [
                    'payment_status' => $data['payment_status'] ?? ($data['status'] === 'Won' ? 'Paid' : 'Pending'),
                    'last_contact_date' => $lastContact->format('Y-m-d'),
                    'created_at' => $createdAt,
                    'updated_at' => $lastContact,
                ])
            );

            foreach ($activities as $act) {
                LeadActivity::updateOrCreate(
                    ['id' => $act['id']],
                    [
                        'lead_id' => $lead->id,
                        'type' => $act['type'],
                        'title' => $act['title'],
                        'description' => $act['description'],
                        'doctor' => $act['doctor'] ?? null,
                        'date' => $act['date'],
                        'created_at' => Carbon::parse($act['date']),
                        'updated_at' => Carbon::parse($act['date']),
                    ]
                );
            }
        }
    }
}
