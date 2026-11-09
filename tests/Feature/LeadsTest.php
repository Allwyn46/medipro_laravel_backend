<?php

use App\Models\Lead;
use App\Models\User;
use Database\Seeders\LeadSeeder;

beforeEach(function () {
    (new LeadSeeder)->run();
});

test('unauthenticated users are redirected to login', function () {
    $this->get(route('leads.index'))->assertRedirect(route('login'));
    $this->get(route('pipeline'))->assertRedirect(route('login'));
    $this->get(route('leads.show', ['id' => 1]))->assertRedirect(route('login'));
});

test('authenticated users can view leads index page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('leads.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('leads/index')
        ->has('leads')
    );
});

test('authenticated users can view single lead page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('leads.show', ['id' => 1]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('leads/show')
        ->has('lead')
        ->where('lead.id', 1)
    );
});

test('authenticated users receive 404 for non-existent lead', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('leads.show', ['id' => 9999]))->assertNotFound();
});

test('authenticated users can view leads index and pipeline when database is completely empty', function () {
    Lead::query()->delete();

    $user = User::factory()->create();

    $this->actingAs($user)->get(route('leads.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('leads/index')->has('leads', 0));

    $this->actingAs($user)->get(route('pipeline'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('pipeline')->has('leads', 0));
});

test('authenticated users can view pipeline page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('pipeline'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('pipeline')
        ->has('leads')
    );
});

test('database has Michael Chen lead with activities', function () {
    $lead = Lead::with('activities')->find(2);

    expect($lead)->not->toBeNull()
        ->and($lead->name)->toBe('Michael Chen')
        ->and($lead->email)->toBe('michael.chen@example.com')
        ->and($lead->phone)->toBe('+1 (555) 345-6789')
        ->and($lead->service)->toBe('Orthodontics & Aligners')
        ->and($lead->status)->toBe('Consultation Scheduled')
        ->and($lead->priority)->toBe('High')
        ->and((int) $lead->value)->toBe(4500)
        ->and($lead->doctor)->toBe('Dr. Jamik Tashpulatov')
        ->and($lead->activities)->toHaveCount(2);

    expect($lead->activities->first()->title)->toBe('Consultation Booking Call');
});
