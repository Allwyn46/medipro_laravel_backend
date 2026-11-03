<?php

use App\Models\User;

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

test('authenticated users can view pipeline page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('pipeline'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('pipeline')
        ->has('leads')
    );
});
