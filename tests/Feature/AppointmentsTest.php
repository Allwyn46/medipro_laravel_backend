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

test('authenticated staff can confirm pending appointment in database', function () {
    $user = User::factory()->create();
    $pending = Appointment::where('status', 'Pending')->first();

    $response = $this->actingAs($user)->postJson(route('appointments.confirm', ['id' => $pending->id]));

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    expect($pending->fresh()->status)->toBe('Confirmed');
});

test('authenticated staff can decline appointment in database', function () {
    $user = User::factory()->create();
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
