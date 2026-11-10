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

test('unauthenticated users cannot view dashboard', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can view dashboard with database metrics and appointments', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('metrics', 4)
        ->has('appointments')
        ->has('pendingAppointments')
    );
});

test('dashboard metrics match database totals', function () {
    $user = User::factory()->admin()->create();

    $wonRevenue = Lead::where('status', 'Won')->sum('value');
    $totalRevenue = $wonRevenue > 0 ? $wonRevenue : Lead::sum('value');
    $activeLeadsCount = Lead::whereNotIn('status', ['Won', 'Lost'])->count();

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();
    $metrics = $response->viewData('page')['props']['metrics'];

    expect($metrics[0]['title'])->toBe('Total Clinic Revenue')
        ->and($metrics[0]['value'])->toBe('₹'.number_format($totalRevenue, 2))
        ->and($metrics[2]['title'])->toBe('Active Patient Leads')
        ->and($metrics[2]['value'])->toBe((string) $activeLeadsCount);
});

test('authenticated users can view dashboard when database is completely empty', function () {
    Appointment::query()->delete();
    LeadActivity::query()->delete();
    Lead::query()->delete();

    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('metrics', 4)
        ->has('appointments', 0)
        ->has('pendingAppointments', 0)
        ->where('metrics.0.value', '₹0.00')
        ->where('metrics.1.value', '0')
        ->where('metrics.2.value', '0')
    );
});
