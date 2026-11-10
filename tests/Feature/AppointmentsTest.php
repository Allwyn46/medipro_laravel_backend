<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\User;
use Database\Seeders\AppointmentSeeder;
use Database\Seeders\LeadSeeder;

beforeEach(function () {
    (new LeadSeeder)->run();
    (new AppointmentSeeder)->run();
});

test('public can get booked slots', function () {
    $response = $this->getJson(route('appointments.booked-slots'));

    $response->assertOk()
        ->assertJsonStructure(['slots']);
});

test('client can book an appointment and save to database', function () {
    $payload = [
        'patientName' => 'John Doe',
        'patientEmail' => 'john.doe@example.com',
        'patientPhone' => '+1 (555) 999-0000',
        'service' => 'Dental Implants',
        'doctor' => 'Dr. Eddie Lake',
        'date' => '2026-11-10',
        'time' => '10:00 AM',
        'notes' => 'Looking for consultation.',
    ];

    $response = $this->postJson(route('appointments.store'), $payload);

    $response->assertCreated()
        ->assertJson([
            'success' => true,
        ]);

    $this->assertDatabaseHas('appointments', [
        'patient_email' => 'john.doe@example.com',
        'status' => 'Pending',
        'doctor' => 'Dr. Eddie Lake',
    ]);

    $this->assertDatabaseHas('leads', [
        'email' => 'john.doe@example.com',
        'name' => 'John Doe',
    ]);
});

test('booking an appointment with custom total value saves value and pending payment status to lead', function () {
    $payload = [
        'patientName' => 'Alice Wonder',
        'patientEmail' => 'alice@example.com',
        'patientPhone' => '+1 (555) 777-8888',
        'service' => 'Orthodontics & Clear Aligners',
        'doctor' => 'Dr. Jamik Tashpulatov',
        'date' => '2026-11-20',
        'time' => '11:00 AM',
        'value' => 3800,
    ];

    $response = $this->postJson(route('appointments.store'), $payload);

    $response->assertCreated();

    $this->assertDatabaseHas('leads', [
        'email' => 'alice@example.com',
        'name' => 'Alice Wonder',
        'value' => 3800,
        'payment_status' => 'Pending',
    ]);
});

test('authenticated staff can search and fetch existing patients list', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson(route('patients.index'));

    $response->assertOk()
        ->assertJsonStructure([
            'patients' => [
                '*' => ['id', 'name', 'email', 'phone', 'service', 'doctor'],
            ],
        ]);

    // Search by name
    $searchResponse = $this->actingAs($user)->getJson(route('patients.index', ['q' => 'Sarah']));
    $searchResponse->assertOk();
    $patients = $searchResponse->json('patients');
    expect(count($patients))->toBeGreaterThan(0)
        ->and($patients[0]['name'])->toContain('Sarah');
});

test('booking an appointment for an existing patient links lead_id and creates activity', function () {
    $existingLead = Lead::first();
    expect($existingLead)->not->toBeNull();

    $payload = [
        'patientName' => $existingLead->name,
        'patientEmail' => $existingLead->email,
        'patientPhone' => $existingLead->phone,
        'service' => 'Cardiology Checkup & ECG',
        'doctor' => 'Dr. Emily Whalen',
        'date' => '2026-11-25',
        'time' => '02:30 PM',
        'leadId' => $existingLead->id,
        'value' => 2500,
    ];

    $response = $this->postJson(route('appointments.store'), $payload);

    $response->assertCreated();

    $appointment = Appointment::where('date', '2026-11-25')->where('time', '02:30 PM')->first();
    expect($appointment)->not->toBeNull()
        ->and($appointment->lead_id)->toBe($existingLead->id);

    $this->assertDatabaseHas('lead_activities', [
        'lead_id' => $existingLead->id,
        'type' => 'Consultation',
        'title' => 'Appointment Booked',
    ]);
});

test('cannot double book an already booked slot for same doctor and date', function () {
    $payload = [
        'patientName' => 'Second Patient',
        'patientEmail' => 'second@example.com',
        'patientPhone' => '+1 (555) 111-2222',
        'service' => 'Dental Implants',
        'doctor' => 'Dr. Eddie Lake',
        'date' => 'Today',
        'time' => '09:30 AM',
    ];

    $response = $this->postJson(route('appointments.store'), $payload);

    $response->assertStatus(422)
        ->assertJsonStructure(['message']);
});

test('authenticated staff can confirm pending appointment in database', function () {
    $user = User::factory()->admin()->create();
    $pending = Appointment::where('status', 'Pending')->first();

    $response = $this->actingAs($user)->postJson(route('appointments.confirm', ['id' => $pending->id]));

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    expect($pending->fresh()->status)->toBe('Confirmed');
});

test('authenticated staff can decline appointment in database', function () {
    $user = User::factory()->admin()->create();
    $pending = Appointment::where('status', 'Pending')->first();

    $response = $this->actingAs($user)->postJson(route('appointments.decline', ['id' => $pending->id]));

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    expect($pending->fresh()->status)->toBe('Cancelled');
});

test('home welcome page loads cleanly when database is completely empty', function () {
    Appointment::query()->delete();
    LeadActivity::query()->delete();
    Lead::query()->delete();

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('welcome')
        ->has('bookedSlots', 0)
    );
});
