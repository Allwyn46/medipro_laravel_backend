<?php

use App\Models\Lead;
use App\Models\LeadFormField;
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
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->get(route('leads.show', ['id' => 1]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('leads/show')
        ->has('lead')
        ->where('lead.id', 1)
    );
});

test('authenticated users receive 404 for non-existent lead', function () {
    $user = User::factory()->admin()->create();

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

test('authenticated users can update lead status to Won with total amount and payment status', function () {
    $user = User::factory()->admin()->create();
    $lead = Lead::find(1);

    $response = $this->actingAs($user)->patchJson(route('leads.update-status', ['id' => $lead->id]), [
        'status' => 'Won',
        'value' => 7500,
        'payment_status' => 'Paid',
        'notes' => 'Treatment approved, full payment made via card.',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    $freshLead = $lead->fresh(['activities']);
    expect($freshLead->status)->toBe('Won')
        ->and((float) $freshLead->value)->toBe(7500.0)
        ->and($freshLead->payment_status)->toBe('Paid');

    $latestActivity = $freshLead->activities->last();
    expect($latestActivity->type)->toBe('Consultation')
        ->and($latestActivity->title)->toBe('Consultation Completed - Won')
        ->and($latestActivity->description)->toContain('7,500.00')
        ->and($latestActivity->description)->toContain('Paid');
});

test('authenticated users can add clinical notes to lead', function () {
    $user = User::factory()->admin()->create();
    $lead = Lead::find(1);

    $response = $this->actingAs($user)->postJson(route('leads.add-note', ['id' => $lead->id]), [
        'note' => 'Patient called to confirm follow-up schedule.',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    $freshLead = $lead->fresh(['activities']);
    $latestActivity = $freshLead->activities->last();
    expect($latestActivity->type)->toBe('Note')
        ->and($latestActivity->description)->toBe('Patient called to confirm follow-up schedule.');
});

test('authenticated users can create a new patient lead with custom attributes', function () {
    $user = User::factory()->create();

    LeadFormField::create([
        'label' => 'Insurance Provider',
        'name' => 'insurance_provider',
        'type' => 'dropdown',
        'options' => ['Star Health', 'Care Health', 'Self-Pay'],
        'is_required' => false,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->postJson(route('leads.store'), [
        'name' => 'Rahul Sharma',
        'phone' => '+91 98765 43210',
        'email' => 'rahul@example.com',
        'service' => 'Dental Implants & Cosmetic',
        'doctor' => 'Dr. Eddie Lake',
        'status' => 'New',
        'priority' => 'High',
        'value' => 2500,
        'source' => 'Staff Booking',
        'notes' => 'Patient inquired about dental implants financing.',
        'custom_fields' => [
            'insurance_provider' => 'Care Health',
        ],
    ]);

    $response->assertCreated();
    $response->assertJson([
        'success' => true,
        'lead' => [
            'name' => 'Rahul Sharma',
            'phone' => '+91 98765 43210',
            'service' => 'Dental Implants & Cosmetic',
            'doctor' => 'Dr. Eddie Lake',
            'status' => 'New',
            'priority' => 'High',
            'value' => 2500,
            'custom_fields' => [
                'insurance_provider' => 'Care Health',
            ],
        ],
    ]);

    $this->assertDatabaseHas('leads', [
        'name' => 'Rahul Sharma',
        'phone' => '+91 98765 43210',
    ]);

    $createdLead = Lead::where('name', 'Rahul Sharma')->first();
    expect($createdLead->custom_fields['insurance_provider'])->toBe('Care Health')
        ->and($createdLead->activities)->toHaveCount(1)
        ->and($createdLead->activities->first()->title)->toBe('Lead Created Manually');
});

test('lead creation enforces dynamic custom field validation rules', function () {
    $user = User::factory()->create();

    LeadFormField::create([
        'label' => 'Required Insurance',
        'name' => 'required_insurance',
        'type' => 'dropdown',
        'options' => ['Option A', 'Option B'],
        'is_required' => true,
        'is_active' => true,
    ]);

    // Omit required custom field
    $response = $this->actingAs($user)->postJson(route('leads.store'), [
        'name' => 'Amit Patel',
        'phone' => '+91 98765 11111',
        'service' => 'Dental Implants & Cosmetic',
        'doctor' => 'Dr. Eddie Lake',
        'status' => 'New',
        'priority' => 'Medium',
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['custom_fields.required_insurance']);

    // Pass invalid option to dropdown
    $response2 = $this->actingAs($user)->postJson(route('leads.store'), [
        'name' => 'Amit Patel',
        'phone' => '+91 98765 11111',
        'service' => 'Dental Implants & Cosmetic',
        'doctor' => 'Dr. Eddie Lake',
        'status' => 'New',
        'priority' => 'Medium',
        'custom_fields' => [
            'required_insurance' => 'Invalid Option',
        ],
    ]);

    $response2->assertUnprocessable();
    $response2->assertJsonValidationErrors(['custom_fields.required_insurance']);
});
