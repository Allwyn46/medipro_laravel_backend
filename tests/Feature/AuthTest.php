<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DoctorSeeder;
use Database\Seeders\LeadSeeder;

beforeEach(function () {
    (new LeadSeeder)->run();
    (new DoctorSeeder)->run();
});

test('authenticated user can logout via inertia request and is redirected to login', function () {
    $user = User::first();

    $response = $this->actingAs($user)
        ->withHeaders(['X-Inertia' => 'true'])
        ->post(route('logout'));

    $response->assertRedirect(route('login'));
    $this->assertGuest();
});

test('authenticated user can logout via plain web post request and is redirected to login', function () {
    $user = User::first();

    $response = $this->actingAs($user)
        ->post(route('logout'));

    $response->assertRedirect(route('login'));
    $this->assertGuest();
});

test('api or non-inertia json logout returns json response', function () {
    $user = User::first();

    $response = $this->actingAs($user)
        ->postJson(route('logout'));

    $response->assertOk();
    $response->assertJson([
        'status' => 'success',
        'message' => 'Logged out successfully',
        'redirect' => route('login'),
    ]);
    $this->assertGuest();
});
