<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Lead;
use App\Models\User;
use Database\Seeders\AppointmentSeeder;
use Database\Seeders\DoctorSeeder;
use Database\Seeders\LeadSeeder;

beforeEach(function () {
    (new LeadSeeder)->run();
    (new AppointmentSeeder)->run();
    (new DoctorSeeder)->run();
});

test('admin can view clinic-wide dashboard and see total clinic revenue', function () {
    $admin = User::where('role', 'admin')->first();

    $response = $this->actingAs($admin)->get(route('dashboard'));

    $response->assertOk();
    $metrics = $response->viewData('page')['props']['metrics'];

    expect($metrics[0]['title'])->toBe('Total Clinic Revenue');
});

test('doctor sees scoped dashboard with only their assigned revenue and appointments', function () {
    $doctorUser = User::where('email', 'eddie.lake@medipro.com')->first();
    $doctor = $doctorUser->doctor;

    $response = $this->actingAs($doctorUser)->get(route('dashboard'));

    $response->assertOk();
    $metrics = $response->viewData('page')['props']['metrics'];

    expect($metrics[0]['title'])->toBe('My Consultation Revenue')
        ->and($metrics[2]['title'])->toBe('My Patient Leads');

    $appointments = $response->viewData('page')['props']['appointments'];
    foreach ($appointments as $apt) {
        expect($apt['doctor_id'] ?? null)->toBe($doctor->id);
    }
});

test('doctor sees only their assigned leads on leads index', function () {
    $doctorUser = User::where('email', 'eddie.lake@medipro.com')->first();
    $doctor = $doctorUser->doctor;

    $response = $this->actingAs($doctorUser)->get(route('leads.index'));

    $response->assertOk();
    $leads = $response->viewData('page')['props']['leads'];

    foreach ($leads as $lead) {
        expect($lead['doctor_id'] ?? null)->toBe($doctor->id);
    }
});

test('doctor attempting to view another doctors lead receives 403', function () {
    $eddieUser = User::where('email', 'eddie.lake@medipro.com')->first();
    $otherDoctor = Doctor::where('id', '!=', $eddieUser->doctor->id)->first();

    $otherLead = Lead::create([
        'name' => 'Secret Patient',
        'phone' => '+91 99999 11111',
        'email' => 'secret@patient.com',
        'service' => 'Cardiology Checkup & ECG',
        'doctor' => $otherDoctor->name,
        'doctor_id' => $otherDoctor->id,
        'status' => 'New',
        'priority' => 'High',
        'value' => 5000,
        'source' => 'Staff Booking',
    ]);

    $response = $this->actingAs($eddieUser)->get(route('leads.show', ['id' => $otherLead->id]));
    $response->assertForbidden();
});

test('doctor attempting to update another doctors lead receives 403', function () {
    $eddieUser = User::where('email', 'eddie.lake@medipro.com')->first();
    $otherDoctor = Doctor::where('id', '!=', $eddieUser->doctor->id)->first();

    $otherLead = Lead::create([
        'name' => 'Secret Patient 2',
        'phone' => '+91 99999 22222',
        'email' => 'secret2@patient.com',
        'service' => 'Cardiology Checkup & ECG',
        'doctor' => $otherDoctor->name,
        'doctor_id' => $otherDoctor->id,
        'status' => 'New',
        'priority' => 'High',
        'value' => 3000,
    ]);

    $response = $this->actingAs($eddieUser)->patchJson(route('leads.update-status', ['id' => $otherLead->id]), [
        'status' => 'Won',
        'value' => 3000,
        'payment_status' => 'Paid',
    ]);
    $response->assertForbidden();
});

test('doctor attempting to confirm another doctors appointment receives 403', function () {
    $eddieUser = User::where('email', 'eddie.lake@medipro.com')->first();
    $otherDoctor = Doctor::where('id', '!=', $eddieUser->doctor->id)->first();

    $otherAppointment = Appointment::create([
        'doctor_id' => $otherDoctor->id,
        'doctor' => $otherDoctor->name,
        'patient_name' => 'Confidential Patient',
        'patient_phone' => '+91 88888 77777',
        'patient_email' => 'confidential@patient.com',
        'service' => 'Cardiology Consultation',
        'date' => '2026-11-20',
        'time' => '10:00 AM',
        'status' => 'Pending',
        'type' => 'Consultation',
        'room' => 'Room 201',
        'duration' => '30 min',
    ]);

    $response = $this->actingAs($eddieUser)->postJson(route('appointments.confirm', ['id' => $otherAppointment->id]));
    $response->assertForbidden();
});

test('doctor can confirm their own assigned appointment', function () {
    $eddieUser = User::where('email', 'eddie.lake@medipro.com')->first();
    $eddieDoctor = $eddieUser->doctor;

    $myAppointment = Appointment::create([
        'doctor_id' => $eddieDoctor->id,
        'doctor' => $eddieDoctor->name,
        'patient_name' => 'My Patient',
        'patient_phone' => '+91 77777 66666',
        'patient_email' => 'mypatient@test.com',
        'service' => 'Dental Checkup',
        'date' => '2026-11-20',
        'time' => '11:00 AM',
        'status' => 'Pending',
        'type' => 'Consultation',
        'room' => 'Room 101',
        'duration' => '30 min',
    ]);

    $response = $this->actingAs($eddieUser)->postJson(route('appointments.confirm', ['id' => $myAppointment->id]));
    $response->assertOk()->assertJson(['success' => true]);

    expect($myAppointment->fresh()->status)->toBe('Confirmed');
});

test('doctor calling patients api receives only their own patients', function () {
    $eddieUser = User::where('email', 'eddie.lake@medipro.com')->first();
    $otherDoctor = Doctor::where('id', '!=', $eddieUser->doctor->id)->first();

    Appointment::create([
        'doctor_id' => $otherDoctor->id,
        'doctor' => $otherDoctor->name,
        'patient_name' => 'Foreign Patient',
        'patient_phone' => '+91 12345 67890',
        'patient_email' => 'foreign@patient.com',
        'service' => 'Cardiology',
        'date' => '2026-11-20',
        'time' => '02:00 PM',
        'status' => 'Confirmed',
        'type' => 'Consultation',
        'room' => 'Room 301',
        'duration' => '30 min',
    ]);

    $response = $this->actingAs($eddieUser)->getJson(route('patients.index'));
    $response->assertOk();

    $patients = $response->json('patients');
    $patientNames = array_column($patients, 'name');

    expect($patientNames)->not->toContain('Foreign Patient');
});

test('admin can manage doctors and create a new doctor profile', function () {
    $admin = User::where('role', 'admin')->first();

    $response = $this->actingAs($admin)->postJson(route('doctors.store'), [
        'name' => 'Dr. Robert Martinez',
        'email' => 'robert.martinez@medipro.com',
        'specialty' => 'Neurologist & Brain Specialist',
        'phone' => '+91 91234 56789',
        'consultation_fee' => 2000,
        'room' => 'Suite 305',
        'password' => 'secret123',
    ]);

    $response->assertCreated()->assertJson(['success' => true]);

    $this->assertDatabaseHas('doctors', [
        'email' => 'robert.martinez@medipro.com',
        'name' => 'Dr. Robert Martinez',
    ]);

    $this->assertDatabaseHas('users', [
        'email' => 'robert.martinez@medipro.com',
        'role' => 'doctor',
    ]);
});

test('doctors cannot access doctor management settings', function () {
    $doctorUser = User::where('email', 'eddie.lake@medipro.com')->first();

    $this->actingAs($doctorUser)->get(route('settings.doctors'))->assertForbidden();
    $this->actingAs($doctorUser)->postJson(route('doctors.store'), [
        'name' => 'Dr. Intruder',
        'email' => 'intruder@medipro.com',
    ])->assertForbidden();
});
