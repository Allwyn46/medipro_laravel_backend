<?php

namespace Tests\Feature;

use App\Models\Lead;
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
    $user = User::factory()->create();

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
    $user = User::factory()->create();

    $totalRevenue = Lead::sum('value');
    $activeLeadsCount = Lead::whereNotIn('status', ['Won', 'Lost'])->count();

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();
    $metrics = $response->viewData('page')['props']['metrics'];

    expect($metrics[0]['title'])->toBe('Total Clinic Revenue')
        ->and($metrics[0]['value'])->toBe('$'.number_format($totalRevenue, 2))
        ->and($metrics[2]['title'])->toBe('Active Patient Leads')
        ->and($metrics[2]['value'])->toBe((string) $activeLeadsCount);
});
