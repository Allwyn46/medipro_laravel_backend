<?php

namespace Tests\Feature;

use App\Mail\AppointmentConfirmedPatientMail;
use App\Mail\AppointmentDoctorReminderMail;
use App\Mail\AppointmentPatientReminderMail;
use App\Mail\AppointmentUpdatedPatientMail;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\User;
use App\Services\AppointmentCalendarService;
use Database\Seeders\DoctorSeeder;
use Database\Seeders\LeadSeeder;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    (new LeadSeeder)->run();
    (new DoctorSeeder)->run();
});

test('confirming an appointment via dashboard queues confirmation mail with calendar invite', function () {
    Mail::fake();

    $admin = User::where('role', 'admin')->first();
    $doctor = Doctor::first();
    $lead = Lead::where('doctor_id', $doctor->id)->first();

    $appointment = Appointment::create([
        'patient_name' => 'Alice Martin',
        'patient_email' => 'alice.martin@example.com',
        'patient_phone' => '+1 (555) 345-6789',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'lead_id' => $lead->id,
        'service' => 'Cardiology Consultation',
        'date' => now()->addDays(2)->format('Y-m-d'),
        'time' => '10:00 AM',
        'status' => 'Pending',
        'type' => 'Initial Consultation',
        'room' => 'Suite 3',
        'duration' => '45 mins',
    ]);

    $response = $this->actingAs($admin)->postJson(route('appointments.confirm', $appointment->id));

    $response->assertOk();
    $response->assertJson([
        'success' => true,
        'message' => 'Appointment confirmed successfully.',
        'appointment' => [
            'id' => $appointment->id,
            'status' => 'Confirmed',
        ],
    ]);

    expect($appointment->fresh()->doctor_confirmed_at)->not->toBeNull();

    // Verify confirmation mail was sent
    Mail::assertSent(AppointmentConfirmedPatientMail::class, function ($mail) use ($appointment) {
        return $mail->hasTo('alice.martin@example.com')
            && $mail->appointment->id === $appointment->id
            && str_contains($mail->googleCalendarUrl, 'calendar.google.com/calendar/render')
            && str_contains($mail->googleCalendarUrl, urlencode($appointment->doctor));
    });

    // Verify LeadActivity was recorded
    $activity = LeadActivity::where('lead_id', $lead->id)
        ->where('title', 'Appointment Confirmation Sent')
        ->first();

    expect($activity)->not->toBeNull()
        ->and($activity->description)->toContain('alice.martin@example.com');
});

test('confirming an appointment with invalid or empty email completes cleanly without error', function () {
    Mail::fake();

    $admin = User::where('role', 'admin')->first();
    $doctor = Doctor::first();
    $lead = Lead::where('doctor_id', $doctor->id)->first();

    $appointment = Appointment::create([
        'patient_name' => 'Walkin Patient',
        'patient_email' => '',
        'patient_phone' => '+1 (555) 999-0000',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'lead_id' => $lead->id,
        'service' => 'General Checkup',
        'date' => now()->addDays(1)->format('Y-m-d'),
        'time' => '11:00 AM',
        'status' => 'Pending',
    ]);

    $response = $this->actingAs($admin)->postJson(route('appointments.confirm', $appointment->id));

    $response->assertOk();
    $response->assertJson([
        'success' => true,
        'appointment' => [
            'id' => $appointment->id,
            'status' => 'Confirmed',
        ],
    ]);

    Mail::assertNothingSent();

    $activity = LeadActivity::where('lead_id', $lead->id)
        ->where('title', 'Appointment Confirmed')
        ->first();

    expect($activity)->not->toBeNull()
        ->and($activity->description)->toContain('No patient email on file');
});

test('re-confirming an already confirmed appointment does not send duplicate confirmation email', function () {
    Mail::fake();

    $admin = User::where('role', 'admin')->first();
    $doctor = Doctor::first();

    $appointment = Appointment::create([
        'patient_name' => 'Bruce Wayne',
        'patient_email' => 'bruce@wayne-enterprises.com',
        'patient_phone' => '+1 (555) 123-4567',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'service' => 'Orthopedics',
        'date' => now()->addDays(4)->format('Y-m-d'),
        'time' => '02:00 PM',
        'status' => 'Confirmed',
        'doctor_confirmed_at' => now(),
    ]);

    $response = $this->actingAs($admin)->postJson(route('appointments.confirm', $appointment->id));

    $response->assertOk();
    Mail::assertNothingSent();
});

test('updating schedule of a confirmed appointment queues updated mail with diff and incremented sequence', function () {
    Mail::fake();

    $admin = User::where('role', 'admin')->first();
    $doctor = Doctor::first();
    $lead = Lead::where('doctor_id', $doctor->id)->first();

    $appointment = Appointment::create([
        'patient_name' => 'Diana Prince',
        'patient_email' => 'diana@amazon.org',
        'patient_phone' => '+1 (555) 777-8888',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'lead_id' => $lead->id,
        'service' => 'Dermatology',
        'date' => now()->addDays(3)->format('Y-m-d'),
        'time' => '09:00 AM',
        'room' => 'Consultation Suite 1',
        'status' => 'Confirmed',
        'doctor_confirmed_at' => now(),
    ]);

    $newDate = now()->addDays(5)->format('Y-m-d');

    $response = $this->actingAs($admin)->patchJson(route('appointments.update', $appointment->id), [
        'date' => $newDate,
        'time' => '03:00 PM',
        'room' => 'Consultation Suite 4',
    ]);

    $response->assertOk();
    $response->assertJson([
        'success' => true,
        'appointment' => [
            'id' => $appointment->id,
            'time' => '03:00 PM',
            'room' => 'Consultation Suite 4',
        ],
    ]);

    Mail::assertSent(AppointmentUpdatedPatientMail::class, function ($mail) use ($appointment) {
        return $mail->hasTo('diana@amazon.org')
            && $mail->appointment->id === $appointment->id
            && isset($mail->changes['time'])
            && $mail->changes['time']['old'] === '09:00 AM'
            && $mail->changes['time']['new'] === '03:00 PM'
            && isset($mail->changes['room'])
            && $mail->changes['room']['old'] === 'Consultation Suite 1'
            && $mail->changes['room']['new'] === 'Consultation Suite 4';
    });

    $activity = LeadActivity::where('lead_id', $lead->id)
        ->where('title', 'Appointment Schedule Update Sent')
        ->first();

    expect($activity)->not->toBeNull()
        ->and($activity->description)->toContain('09:00 AM → 03:00 PM');
});

test('updating an unconfirmed appointment does not queue update email', function () {
    Mail::fake();

    $admin = User::where('role', 'admin')->first();
    $doctor = Doctor::first();

    $appointment = Appointment::create([
        'patient_name' => 'Barry Allen',
        'patient_email' => 'barry@star-labs.com',
        'patient_phone' => '+1 (555) 444-3333',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'service' => 'Neurology',
        'date' => now()->addDays(2)->format('Y-m-d'),
        'time' => '01:00 PM',
        'status' => 'Pending',
    ]);

    $response = $this->actingAs($admin)->patchJson(route('appointments.update', $appointment->id), [
        'time' => '02:30 PM',
    ]);

    $response->assertOk();
    Mail::assertNothingSent();
});

test('calendar service generates RFC 5545 compliant ics content and Google Calendar URL', function () {
    $doctor = Doctor::first();
    $appointment = Appointment::create([
        'patient_name' => 'Clark Kent',
        'patient_email' => 'clark@dailyplanet.com',
        'patient_phone' => '+1 (555) 111-2222',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'service' => 'Vision Examination',
        'date' => '2026-12-01',
        'time' => '10:00 AM',
        'room' => 'Suite 2',
        'duration' => '30 mins',
        'status' => 'Confirmed',
    ]);

    $service = app(AppointmentCalendarService::class);

    $googleUrl = $service->generateGoogleCalendarUrl($appointment);
    expect($googleUrl)->toContain('calendar.google.com/calendar/render')
        ->and($googleUrl)->toContain('action=TEMPLATE')
        ->and($googleUrl)->toContain('Suite+2');

    $ics = $service->generateIcsContent($appointment, 0);
    expect($ics)->toContain('BEGIN:VCALENDAR')
        ->and($ics)->toContain('VERSION:2.0')
        ->and($ics)->toContain("UID:medipro-apt-{$appointment->id}@medipro.com")
        ->and($ics)->toContain('SUMMARY:Consultation with')
        ->and($ics)->toContain('METHOD:REQUEST')
        ->and($ics)->toContain('SEQUENCE:0')
        ->and($ics)->toContain('STATUS:CONFIRMED')
        ->and($ics)->toContain('END:VCALENDAR');
});

test('booking an appointment requires patient email', function () {
    $doctor = Doctor::first();

    $response = $this->postJson(route('appointments.store'), [
        'patientName' => 'No Email Patient',
        'patientPhone' => '+1 (555) 000-1111',
        'service' => 'General Practice',
        'doctor' => $doctor->name,
        'date' => now()->addDays(2)->format('Y-m-d'),
        'time' => '09:00 AM',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['patientEmail']);
});

test('client portal booking creates pending appointment without triggering dual confirmation flow', function () {
    Mail::fake();

    $doctor = Doctor::first();

    $response = $this->postJson(route('appointments.store'), [
        'patientName' => 'Portal User',
        'patientEmail' => 'portal.user@example.com',
        'patientPhone' => '+1 (555) 888-9999',
        'service' => 'Cardiology',
        'doctor' => $doctor->name,
        'date' => now()->addDays(2)->format('Y-m-d'),
        'time' => '10:00 AM',
        'source' => 'Website Booking',
    ]);

    $response->assertCreated();
    $response->assertJson([
        'success' => true,
        'appointment' => [
            'status' => 'Pending',
            'patient_email' => 'portal.user@example.com',
            'source' => 'Website Booking',
        ],
    ]);

    $appointmentId = $response->json('appointment.id');
    $appointment = Appointment::find($appointmentId);

    expect($appointment)->not->toBeNull()
        ->and($appointment->status)->toBe('Pending')
        ->and($appointment->reminder_sent_at)->toBeNull();

    // Verify dual confirmation emails were NOT sent to patient or doctor
    Mail::assertNotSent(AppointmentPatientReminderMail::class);
    Mail::assertNotSent(AppointmentDoctorReminderMail::class);

    // Now doctor confirms on dashboard: confirmation email with calendar invites is sent
    $admin = User::where('role', 'admin')->first();
    $confirmResponse = $this->actingAs($admin)->postJson(route('appointments.confirm', $appointment->id));
    $confirmResponse->assertOk();

    expect($appointment->fresh()->status)->toBe('Confirmed');

    Mail::assertSent(AppointmentConfirmedPatientMail::class, function ($mail) {
        return $mail->hasTo('portal.user@example.com');
    });
});
