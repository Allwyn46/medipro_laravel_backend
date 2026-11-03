<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\PipelineController;
use Illuminate\Support\Facades\Route;

Route::inertia('/error', 'ErrorPages/wentWrong')->name('error');

// AUTH ROUTES
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:5,1');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
    Route::get('/dashboard', fn () => inertia('dashboard'))->name('dashboard');
    Route::get('/pipeline', [PipelineController::class, 'index'])->name('pipeline');
    Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');
    Route::get('/leads/{id}', [LeadController::class, 'show'])->name('leads.show');
});
