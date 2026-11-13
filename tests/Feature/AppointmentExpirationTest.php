<?php

namespace Tests\Feature;

use App\Mail\AppointmentRescheduleNoticeMail;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\User;
use App\Services\AppointmentExpirationService;
use Carbon\Carbon;
use Database\Seeders\DoctorSeeder;
use Database\Seeders\LeadSeeder;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    (new DoctorSeeder)->run();
    (new LeadSeeder)->run();
});

test('appointments within 15 minutes of start time are not expired', function () {
    Mail::fake();

    $doctor = Doctor::first();
    // 5 minutes ago -> within 15-min grace window
    $recentTime = Carbon::now()->subMinutes(5)->format('h:i A');

    $appointment = Appointment::create([
        'patient_name' => 'Active Patient',
        'patient_email' => 'active@example.com',
        'patient_phone' => '+1 (555) 123-4567',
        'service' => 'Dental Consultation',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'date' => Carbon::now()->format('Y-m-d'),
        'time' => $recentTime,
        'status' => 'Pending',
        'source' => 'Client Portal',
    ]);

    $futureAppointment = Appointment::create([
        'patient_name' => 'Future Patient',
        'patient_email' => 'future@example.com',
        'patient_phone' => '+1 (555) 765-4321',
        'service' => 'Cardiology Checkup',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'date' => Carbon::now()->addDays(2)->format('Y-m-d'),
        'time' => '10:00 AM',
        'status' => 'Awaiting Confirmation',
        'source' => 'Staff Booking',
    ]);

    $service = app(AppointmentExpirationService::class);
    $expiredCount = $service->expirePastDueAppointments(15);

    expect($expiredCount)->toBe(0)
        ->and($appointment->fresh()->status)->toBe('Pending')
        ->and($futureAppointment->fresh()->status)->toBe('Awaiting Confirmation');

    Mail::assertNothingQueued();
});

test('appointments past 15 minutes of start time are transitioned to Reschedule', function () {
    Mail::fake();

    $doctor = Doctor::first();
    // 25 minutes ago -> past 15-minute grace window
    $pastTime = Carbon::now()->subMinutes(25)->format('h:i A');

    $pendingApt = Appointment::create([
        'patient_name' => 'Pending Past Due',
        'patient_email' => 'pending@example.com',
        'patient_phone' => '+1 (555) 111-2222',
        'service' => 'Dental Checkup',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'date' => Carbon::now()->format('Y-m-d'),
        'time' => $pastTime,
        'status' => 'Pending',
        'source' => 'Client Portal',
    ]);

    $awaitingApt = Appointment::create([
        'patient_name' => 'Awaiting Past Due',
        'patient_email' => 'awaiting@example.com',
        'patient_phone' => '+1 (555) 333-4444',
        'service' => 'Orthodontics',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'date' => Carbon::now()->format('Y-m-d'),
        'time' => $pastTime,
        'status' => 'Awaiting Confirmation',
        'source' => 'Staff Booking',
    ]);

    $service = app(AppointmentExpirationService::class);
    $expiredCount = $service->expirePastDueAppointments(15);

    expect($expiredCount)->toBe(2)
        ->and($pendingApt->fresh()->status)->toBe('Reschedule')
        ->and($awaitingApt->fresh()->status)->toBe('Reschedule');

    Mail::assertQueued(AppointmentRescheduleNoticeMail::class, 2);
});

test('linked lead status updates to Reschedule and logs activity if the expired appointment is the lead latest', function () {
    Mail::fake();

    $doctor = Doctor::first();
    $lead = Lead::create([
        'name' => 'Test Lead',
        'email' => 'lead@example.com',
        'phone' => '+1 (555) 987-6543',
        'service' => 'Dental Consultation',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'status' => 'New patients',
        'source' => 'Client Portal',
    ]);

    $pastTime = Carbon::now()->subMinutes(30)->format('h:i A');

    $appointment = Appointment::create([
        'patient_name' => $lead->name,
        'patient_email' => $lead->email,
        'patient_phone' => $lead->phone,
        'service' => $lead->service,
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'lead_id' => $lead->id,
        'date' => Carbon::now()->format('Y-m-d'),
        'time' => $pastTime,
        'status' => 'Pending',
        'source' => 'Client Portal',
    ]);

    $service = app(AppointmentExpirationService::class);
    $service->expirePastDueAppointments(15);

    $lead->refresh();
    expect($lead->status)->toBe('Reschedule');

    $activity = LeadActivity::where('lead_id', $lead->id)
        ->where('type', 'Status Change')
        ->first();

    expect($activity)->not->toBeNull()
        ->and($activity->title)->toBe('Appointment Expired - Moved to Reschedule')
        ->and($activity->description)->toContain('15-minute start cutoff');
});

test('linked lead status is preserved if a newer appointment exists', function () {
    Mail::fake();

    $doctor = Doctor::first();
    $lead = Lead::create([
        'name' => 'Active Multi Lead',
        'email' => 'multilead@example.com',
        'phone' => '+1 (555) 444-5555',
        'service' => 'Dental Consultation',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'status' => 'Confirmed patients',
        'source' => 'Client Portal',
    ]);

    $pastTime = Carbon::now()->subMinutes(40)->format('h:i A');

    // Older unconfirmed appointment
    $expiredApt = Appointment::create([
        'patient_name' => $lead->name,
        'patient_email' => $lead->email,
        'patient_phone' => $lead->phone,
        'service' => $lead->service,
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'lead_id' => $lead->id,
        'date' => Carbon::now()->format('Y-m-d'),
        'time' => $pastTime,
        'status' => 'Pending',
        'source' => 'Client Portal',
    ]);

    // Newer confirmed future appointment
    $futureApt = Appointment::create([
        'patient_name' => $lead->name,
        'patient_email' => $lead->email,
        'patient_phone' => $lead->phone,
        'service' => $lead->service,
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'lead_id' => $lead->id,
        'date' => Carbon::now()->addDays(3)->format('Y-m-d'),
        'time' => '11:00 AM',
        'status' => 'Confirmed',
        'source' => 'Staff Booking',
    ]);

    $service = app(AppointmentExpirationService::class);
    $service->expirePastDueAppointments(15);

    expect($expiredApt->fresh()->status)->toBe('Reschedule')
        ->and($futureApt->fresh()->status)->toBe('Confirmed');

    // Lead status must NOT be downgraded to Reschedule because futureApt is newer
    $lead->refresh();
    expect($lead->status)->toBe('Confirmed patients');
});

test('visiting confirm-email endpoint for a Reschedule appointment renders expired Inertia page', function () {
    $doctor = Doctor::first();
    $token = Str::random(32);

    $appointment = Appointment::create([
        'patient_name' => 'Expired Link Patient',
        'patient_email' => 'expired-link@example.com',
        'patient_phone' => '+1 (555) 777-6666',
        'service' => 'Dental Checkup',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'date' => Carbon::now()->subDay()->format('Y-m-d'),
        'time' => '10:00 AM',
        'status' => 'Reschedule',
        'patient_token' => $token,
        'doctor_token' => Str::random(32),
        'source' => 'Staff Booking',
    ]);

    $response = $this->get(route('appointments.email-confirm', ['token' => $token]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('appointments/expired')
        ->where('appointment.id', $appointment->id)
        ->has('rebookUrl')
    );
});

test('artisan command appointments:expire-unconfirmed successfully expires past-due appointments', function () {
    Mail::fake();

    $doctor = Doctor::first();
    $pastTime = Carbon::now()->subMinutes(30)->format('h:i A');

    $appointment = Appointment::create([
        'patient_name' => 'Artisan Expiration Test',
        'patient_email' => 'artisan@example.com',
        'patient_phone' => '+1 (555) 888-9999',
        'service' => 'Dental Cleaning',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'date' => Carbon::now()->format('Y-m-d'),
        'time' => $pastTime,
        'status' => 'Pending',
        'source' => 'Client Portal',
    ]);

    $this->artisan('appointments:expire-unconfirmed --grace=15')
        ->expectsOutputToContain('Scanning unconfirmed appointments with 15-minute grace period...')
        ->expectsOutputToContain('Successfully expired 1 past-due appointment(s) to Reschedule status.')
        ->assertSuccessful();

    expect($appointment->fresh()->status)->toBe('Reschedule');
});

test('dashboard index expires past-due unconfirmed appointments on load', function () {
    Mail::fake();

    $admin = User::where('role', 'admin')->first();
    $doctor = Doctor::first();
    $pastTime = Carbon::now()->subMinutes(30)->format('h:i A');

    $appointment = Appointment::create([
        'patient_name' => 'Dashboard Load Expiration',
        'patient_email' => 'dashboard-load@example.com',
        'patient_phone' => '+1 (555) 000-1111',
        'service' => 'Dental Cleaning',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'date' => Carbon::now()->format('Y-m-d'),
        'time' => $pastTime,
        'status' => 'Pending',
        'source' => 'Client Portal',
    ]);

    $response = $this->actingAs($admin)->get(route('dashboard'));

    $response->assertOk();
    expect($appointment->fresh()->status)->toBe('Reschedule');
});

test('booked slots endpoint excludes appointments with Reschedule status', function () {
    $doctor = Doctor::first();

    $rescheduleApt = Appointment::create([
        'patient_name' => 'Free Slot Patient',
        'patient_email' => 'free-slot@example.com',
        'patient_phone' => '+1 (555) 321-4321',
        'service' => 'Dental Cleaning',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'date' => Carbon::now()->format('Y-m-d'),
        'time' => '10:00 AM',
        'status' => 'Reschedule',
        'source' => 'Client Portal',
    ]);

    $confirmedApt = Appointment::create([
        'patient_name' => 'Taken Slot Patient',
        'patient_email' => 'taken-slot@example.com',
        'patient_phone' => '+1 (555) 654-7890',
        'service' => 'Dental Cleaning',
        'doctor' => $doctor->name,
        'doctor_id' => $doctor->id,
        'date' => Carbon::now()->format('Y-m-d'),
        'time' => '11:00 AM',
        'status' => 'Confirmed',
        'source' => 'Client Portal',
    ]);

    $response = $this->getJson(route('appointments.booked-slots'));

    $response->assertOk();
    $slotIds = collect($response->json('slots'))->pluck('id')->all();

    expect($slotIds)->toContain($confirmedApt->id)
        ->and($slotIds)->not->toContain($rescheduleApt->id);
});
