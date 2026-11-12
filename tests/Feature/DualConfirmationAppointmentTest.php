<?php

namespace Tests\Feature;

use App\Mail\AppointmentDoctorReminderMail;
use App\Mail\AppointmentPatientReminderMail;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Lead;
use App\Models\User;
use Database\Seeders\DoctorSeeder;
use Database\Seeders\LeadSeeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    (new LeadSeeder)->run();
    (new DoctorSeeder)->run();
});

test('scheduling an appointment sets awaiting confirmation status and sends dual reminder emails', function () {
    Mail::fake();

    $admin = User::where('role', 'admin')->first();
    $doctor = Doctor::first();
    $lead = Lead::where('doctor_id', $doctor->id)->first();

    $response = $this->actingAs($admin)->postJson(route('appointments.store'), [
        'patientName' => 'Sarah Connor',
        'patientEmail' => 'sarah.connor@example.com',
        'patientPhone' => '+1 (555) 234-5678',
        'service' => 'Dental Implants',
        'doctor' => $doctor->name,
        'date' => now()->addDays(3)->format('Y-m-d'),
        'time' => '10:00 AM',
        'source' => 'Staff Booking',
        'leadId' => $lead->id,
        'notes' => 'Urgent molar consultation.',
    ]);

    $response->assertCreated();
    $response->assertJson([
        'success' => true,
        'appointment' => [
            'status' => 'Awaiting Confirmation',
            'patient_email' => 'sarah.connor@example.com',
        ],
    ]);

    $appointmentId = $response->json('appointment.id');
    $appointment = Appointment::find($appointmentId);

    expect($appointment)->not->toBeNull()
        ->and($appointment->patient_token)->not->toBeNull()
        ->and($appointment->doctor_token)->not->toBeNull()
        ->and($appointment->status)->toBe('Awaiting Confirmation')
        ->and($appointment->reminder_sent_at)->not->toBeNull();

    // Mail sent to both patient and doctor
    Mail::assertSent(AppointmentPatientReminderMail::class, function ($mail) use ($appointment) {
        return $mail->hasTo('sarah.connor@example.com') &&
            $mail->appointment->id === $appointment->id &&
            str_contains($mail->confirmUrl, $appointment->patient_token);
    });

    Mail::assertSent(AppointmentDoctorReminderMail::class, function ($mail) use ($doctor, $appointment) {
        return $mail->hasTo($doctor->email) &&
            $mail->appointment->id === $appointment->id &&
            str_contains($mail->confirmUrl, $appointment->doctor_token);
    });
});

test('scheduled appointment does not appear in dashboard pending confirmation block while portal appointment does', function () {
    $admin = User::where('role', 'admin')->first();
    $doctor = Doctor::first();

    // 1. Staff scheduled appointment
    $staffApt = Appointment::create([
        'patient_name' => 'Scheduled Patient',
        'patient_email' => 'scheduled@test.com',
        'patient_phone' => '+91 99999 11111',
        'service' => 'Dental Consultation',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'date' => now()->addDays(4)->format('Y-m-d'),
        'time' => '11:00 AM',
        'status' => 'Awaiting Confirmation',
        'source' => 'Staff Booking',
    ]);

    // 2. Client portal appointment
    $portalApt = Appointment::create([
        'patient_name' => 'Portal Patient',
        'patient_email' => 'portal@test.com',
        'patient_phone' => '+91 99999 22222',
        'service' => 'Dental Checkup',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'date' => now()->addDays(2)->format('Y-m-d'),
        'time' => '02:30 PM',
        'status' => 'Pending',
        'source' => 'Website Booking',
    ]);

    $response = $this->actingAs($admin)->get(route('dashboard'));
    $response->assertOk();

    $pendingAppointments = $response->viewData('page')['props']['pendingAppointments'];
    $pendingIds = array_column(is_array($pendingAppointments) ? $pendingAppointments : $pendingAppointments->toArray(), 'id');

    // Portal appointment must be in pending confirmation block
    expect($pendingIds)->toContain($portalApt->id);

    // Staff scheduled appointment must NOT be in pending confirmation block
    expect($pendingIds)->not->toContain($staffApt->id);
});

test('dual confirmation workflow: both patient and doctor must confirm via email to book appointment', function () {
    $doctor = Doctor::first();
    $lead = Lead::where('doctor_id', $doctor->id)->first();

    $appointment = Appointment::create([
        'patient_name' => 'Alice Johnson',
        'patient_email' => 'alice@test.com',
        'patient_phone' => '+91 98765 43210',
        'service' => 'General Checkup',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'date' => now()->addDays(5)->format('Y-m-d'),
        'time' => '09:00 AM',
        'status' => 'Awaiting Confirmation',
        'source' => 'Staff Booking',
        'lead_id' => $lead->id,
        'patient_token' => 'patient-secret-token-12345',
        'doctor_token' => 'doctor-secret-token-67890',
    ]);

    // 1. Patient clicks confirmation link from their email
    $patientResponse = $this->get(route('appointments.email-confirm', ['token' => 'patient-secret-token-12345']));
    $patientResponse->assertOk();
    $patientResponse->assertInertia(fn ($page) => $page
        ->component('appointments/confirmed')
        ->where('role', 'patient')
        ->where('bothConfirmed', false)
        ->where('patientConfirmed', true)
        ->where('doctorConfirmed', false)
    );

    $appointment->refresh();
    expect($appointment->patient_confirmed_at)->not->toBeNull()
        ->and($appointment->doctor_confirmed_at)->toBeNull()
        ->and($appointment->status)->toBe('Awaiting Confirmation'); // Not booked yet

    // 2. Doctor clicks confirmation link from their email
    $doctorResponse = $this->get(route('appointments.email-confirm', ['token' => 'doctor-secret-token-67890']));
    $doctorResponse->assertOk();
    $doctorResponse->assertInertia(fn ($page) => $page
        ->component('appointments/confirmed')
        ->where('role', 'doctor')
        ->where('bothConfirmed', true)
        ->where('patientConfirmed', true)
        ->where('doctorConfirmed', true)
    );

    $appointment->refresh();
    // Both confirmed: appointment is now officially Confirmed & Booked!
    expect($appointment->doctor_confirmed_at)->not->toBeNull()
        ->and($appointment->status)->toBe('Confirmed')
        ->and($lead->fresh()->status)->toBe('Consultation Scheduled');
});

test('send appointment reminders console command sends emails 1 week before appointment date', function () {
    Mail::fake();

    $doctor = Doctor::first();

    // Appointment 6 days away (within 1 week) with no reminder sent yet
    $upcomingApt = Appointment::create([
        'patient_name' => 'Upcoming Patient',
        'patient_email' => 'upcoming@test.com',
        'patient_phone' => '+91 88888 11111',
        'service' => 'Orthodontics',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'date' => now()->addDays(6)->format('Y-m-d'),
        'time' => '03:30 PM',
        'status' => 'Awaiting Confirmation',
        'source' => 'Staff Booking',
        'reminder_sent_at' => null,
    ]);

    // Appointment 20 days away (more than 1 week)
    $farApt = Appointment::create([
        'patient_name' => 'Far Future Patient',
        'patient_email' => 'far@test.com',
        'patient_phone' => '+91 88888 22222',
        'service' => 'Orthodontics',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'date' => now()->addDays(20)->format('Y-m-d'),
        'time' => '04:30 PM',
        'status' => 'Awaiting Confirmation',
        'source' => 'Staff Booking',
        'reminder_sent_at' => null,
    ]);

    Artisan::call('appointments:send-reminders');

    $upcomingApt->refresh();
    $farApt->refresh();

    // Upcoming appointment within 1 week should have reminder sent
    expect($upcomingApt->reminder_sent_at)->not->toBeNull()
        ->and($upcomingApt->patient_token)->not->toBeNull()
        ->and($upcomingApt->doctor_token)->not->toBeNull();

    // Far appointment should NOT have reminder sent yet
    expect($farApt->reminder_sent_at)->toBeNull();

    Mail::assertSent(AppointmentPatientReminderMail::class, function ($mail) {
        return $mail->hasTo('upcoming@test.com');
    });

    Mail::assertNotSent(AppointmentPatientReminderMail::class, function ($mail) {
        return $mail->hasTo('far@test.com');
    });
});
