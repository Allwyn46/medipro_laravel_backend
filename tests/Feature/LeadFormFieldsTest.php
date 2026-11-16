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

test('unauthenticated users cannot update custom field status', function () {
    $this->patchJson(route('lead-fields.update-status', ['id' => 1]), [
        'is_active' => false,
    ])->assertUnauthorized();
});

test('doctors cannot update custom field status', function () {
    $doctorUser = User::factory()->doctor()->create();

    $field = LeadFormField::create([
        'label' => 'Chief Complaint',
        'name' => 'chief_complaint',
        'type' => 'text',
        'is_active' => true,
    ]);

    $this->actingAs($doctorUser)->patchJson(route('lead-fields.update-status', ['id' => $field->id]), [
        'is_active' => false,
    ])->assertForbidden();
});

test('authenticated admin can toggle custom field status between active and inactive', function () {
    $user = User::factory()->admin()->create();

    $field = LeadFormField::create([
        'label' => 'Insurance Carrier',
        'name' => 'insurance_carrier',
        'type' => 'text',
        'is_active' => true,
    ]);

    // Deactivate
    $response = $this->actingAs($user)->patchJson(route('lead-fields.update-status', ['id' => $field->id]), [
        'is_active' => false,
    ]);

    $response->assertOk();
    $response->assertJson([
        'success' => true,
        'field' => [
            'id' => $field->id,
            'is_active' => false,
        ],
    ]);
    expect($field->fresh()->is_active)->toBeFalse();

    // Reactivate
    $response2 = $this->actingAs($user)->patchJson(route('lead-fields.update-status', ['id' => $field->id]), [
        'is_active' => true,
    ]);

    $response2->assertOk();
    $response2->assertJson([
        'success' => true,
        'field' => [
            'id' => $field->id,
            'is_active' => true,
        ],
    ]);
    expect($field->fresh()->is_active)->toBeTrue();
});

test('updateStatus requires boolean is_active', function () {
    $user = User::factory()->admin()->create();

    $field = LeadFormField::create([
        'label' => 'Referred Hospital',
        'name' => 'referred_hospital',
        'type' => 'text',
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->patchJson(route('lead-fields.update-status', ['id' => $field->id]), [
        'is_active' => 'invalid-boolean-value',
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['is_active']);
});
