<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\User;
use Database\Seeders\AppointmentSeeder;
use Database\Seeders\DoctorSeeder;
use Database\Seeders\LeadSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    (new LeadSeeder)->run();
    (new AppointmentSeeder)->run();
    (new DoctorSeeder)->run();
});

test('guests are redirected to login when accessing appointments registry', function () {
    $response = $this->get(route('appointments.index'));

    $response->assertRedirect(route('login'));
});

test('doctors can view appointments registry strictly scoped to their own appointments', function () {
    $doctorUser = User::where('email', 'eddie.lake@medipro.com')->first();
    $doctor = $doctorUser->doctor;

    $response = $this->actingAs($doctorUser)->get(route('appointments.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('appointments/index')
        ->where('isAdmin', false)
        ->where('selectedDoctorId', $doctor->id)
        ->where('doctors', [])
        ->has('appointments')
    );

    $appointments = $response->viewData('page')['props']['appointments'];
    expect(count($appointments))->toBeGreaterThan(0);

    foreach ($appointments as $apt) {
        $aptDoctorId = $apt['doctor_id'] ?? null;
        $aptDoctorName = $apt['doctor'] ?? null;
        expect($aptDoctorId === $doctor->id || $aptDoctorName === $doctor->name)->toBeTrue();
    }
});

test('doctors cannot bypass scoping by supplying another doctor_id in the query string', function () {
    $doctorUser = User::where('email', 'eddie.lake@medipro.com')->first();
    $doctor = $doctorUser->doctor;

    $otherDoctor = Doctor::where('id', '!=', $doctor->id)->first();

    // Doctor attempts to tamper query params with another doctor's ID
    $response = $this->actingAs($doctorUser)->get(route('appointments.index', [
        'doctor_id' => $otherDoctor->id,
    ]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('appointments/index')
        ->where('selectedDoctorId', $doctor->id)
    );

    $appointments = $response->viewData('page')['props']['appointments'];
    foreach ($appointments as $apt) {
        $aptDoctorId = $apt['doctor_id'] ?? null;
        $aptDoctorName = $apt['doctor'] ?? null;
        expect($aptDoctorId === $doctor->id || $aptDoctorName === $doctor->name)->toBeTrue();
    }
});

test('administrators can view clinic-wide appointments on registry and receive active doctors directory', function () {
    $admin = User::where('role', 'admin')->first();

    $response = $this->actingAs($admin)->get(route('appointments.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('appointments/index')
        ->where('isAdmin', true)
        ->where('selectedDoctorId', null)
        ->has('doctors')
        ->has('appointments')
    );

    $appointments = $response->viewData('page')['props']['appointments'];
    $doctors = $response->viewData('page')['props']['doctors'];

    expect(count($appointments))->toBe(Appointment::count())
        ->and(count($doctors))->toBeGreaterThan(0);
});

test('administrators can filter appointments by specialist using doctor_id query param', function () {
    $admin = User::where('role', 'admin')->first();
    $targetDoctor = Doctor::first();

    $response = $this->actingAs($admin)->get(route('appointments.index', [
        'doctor_id' => $targetDoctor->id,
    ]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('appointments/index')
        ->where('isAdmin', true)
        ->where('selectedDoctorId', $targetDoctor->id)
    );

    $appointments = $response->viewData('page')['props']['appointments'];
    expect(count($appointments))->toBeGreaterThan(0);

    foreach ($appointments as $apt) {
        $aptDoctorId = $apt['doctor_id'] ?? null;
        $aptDoctorName = $apt['doctor'] ?? null;
        expect($aptDoctorId === $targetDoctor->id || $aptDoctorName === $targetDoctor->name)->toBeTrue();
    }
});

test('visiting appointments registry runs unconfirmed appointment expiration', function () {
    $admin = User::where('role', 'admin')->first();
    $doctor = Doctor::first();

    // Create an unconfirmed appointment past the 15-minute grace window
    $expiredAppointment = Appointment::create([
        'patient_name' => 'Auto Expire Patient',
        'patient_email' => 'auto-expire@example.com',
        'patient_phone' => '+1 (555) 345-6789',
        'service' => 'Dental Consultation',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'date' => now()->format('Y-m-d'),
        'time' => now()->subMinutes(30)->format('h:i A'),
        'status' => 'Pending',
        'source' => 'Client Portal',
    ]);

    $response = $this->actingAs($admin)->get(route('appointments.index'));

    $response->assertOk();
    expect($expiredAppointment->fresh()->status)->toBe('Reschedule');
});
