<?php

use App\Models\LeadFormField;
use App\Models\User;

test('unauthenticated users cannot access settings or lead fields API', function () {
    $this->get(route('settings.leads'))->assertRedirect(route('login'));
    $this->getJson(route('lead-fields.index'))->assertUnauthorized();
    $this->postJson(route('lead-fields.store'), [
        'label' => 'Insurance Carrier',
        'type' => 'text',
    ])->assertUnauthorized();
    $this->deleteJson(route('lead-fields.destroy', ['id' => 1]))->assertUnauthorized();
});

test('authenticated admin can view settings page with fields', function () {
    $user = User::factory()->admin()->create();

    LeadFormField::create([
        'label' => 'Insurance Carrier',
        'name' => 'insurance_carrier',
        'type' => 'text',
        'is_required' => false,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->get(route('settings.leads'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('settings/leads')
        ->has('fields')
    );
});

test('doctors cannot access lead settings or lead fields API', function () {
    $doctorUser = User::factory()->doctor()->create();

    $this->actingAs($doctorUser)->get(route('settings.leads'))->assertForbidden();
    $this->actingAs($doctorUser)->getJson(route('lead-fields.index'))->assertForbidden();
    $this->actingAs($doctorUser)->postJson(route('lead-fields.store'), [
        'label' => 'Specialty Field',
        'type' => 'text',
    ])->assertForbidden();
});

test('authenticated admin can list active lead form fields', function () {
    $user = User::factory()->admin()->create();

    LeadFormField::create([
        'label' => 'Active Text Field',
        'name' => 'active_text',
        'type' => 'text',
        'is_active' => true,
    ]);

    LeadFormField::create([
        'label' => 'Inactive Field',
        'name' => 'inactive_field',
        'type' => 'text',
        'is_active' => false,
    ]);

    $response = $this->actingAs($user)->getJson(route('lead-fields.index'));

    $response->assertOk();
    $response->assertJson([
        'success' => true,
    ]);
    expect($response->json('fields'))->toHaveCount(1)
        ->and($response->json('fields.0.name'))->toBe('active_text');
});

test('authenticated admin can create a text custom field', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->postJson(route('lead-fields.store'), [
        'label' => 'Chief Complaint',
        'type' => 'text',
        'is_required' => true,
    ]);

    $response->assertCreated();
    $response->assertJson([
        'success' => true,
        'field' => [
            'label' => 'Chief Complaint',
            'name' => 'chief_complaint',
            'type' => 'text',
            'is_required' => true,
            'is_active' => true,
        ],
    ]);

    $this->assertDatabaseHas('lead_form_fields', [
        'name' => 'chief_complaint',
        'type' => 'text',
        'is_required' => 1,
    ]);
});

test('authenticated admin can create a dropdown custom field with options', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->postJson(route('lead-fields.store'), [
        'label' => 'Insurance Provider',
        'type' => 'dropdown',
        'options' => ['Star Health', 'Care Health', 'Self-Pay'],
        'is_required' => false,
    ]);

    $response->assertCreated();
    $response->assertJson([
        'success' => true,
        'field' => [
            'label' => 'Insurance Provider',
            'name' => 'insurance_provider',
            'type' => 'dropdown',
            'options' => ['Star Health', 'Care Health', 'Self-Pay'],
            'is_required' => false,
            'is_active' => true,
        ],
    ]);

    $this->assertDatabaseHas('lead_form_fields', [
        'name' => 'insurance_provider',
        'type' => 'dropdown',
    ]);
});

test('validation rejects dropdown field without options', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->postJson(route('lead-fields.store'), [
        'label' => 'Insurance Provider',
        'type' => 'dropdown',
        'options' => [],
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['options']);
});

test('authenticated admin can deactivate a custom field', function () {
    $user = User::factory()->admin()->create();

    $field = LeadFormField::create([
        'label' => 'Deprecated Field',
        'name' => 'deprecated_field',
        'type' => 'text',
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->deleteJson(route('lead-fields.destroy', ['id' => $field->id]));

    $response->assertOk();
    $response->assertJson([
        'success' => true,
    ]);

    expect($field->fresh()->is_active)->toBeFalse();
});
