<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\PipelineController;
use App\Models\Appointment;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $bookedSlots = Appointment::whereIn('status', ['Confirmed', 'Scheduled', 'In Progress'])
        ->select(['id', 'doctor', 'date', 'time', 'status'])
        ->get();

    return inertia('welcome', [
        'bookedSlots' => $bookedSlots,
    ]);
})->name('home');

Route::get('/staff', fn () => auth()->check() ? redirect()->route('dashboard') : redirect()->route('login'))->name('staff.portal');
Route::inertia('/error', 'ErrorPages/wentWrong')->name('error');

// PUBLIC APPOINTMENT APIS
Route::post('/api/appointments', [AppointmentController::class, 'store'])->name('appointments.store');
Route::get('/api/appointments/booked-slots', [AppointmentController::class, 'bookedSlots'])->name('appointments.booked-slots');

// AUTH ROUTES
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:5,1');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/pipeline', [PipelineController::class, 'index'])->name('pipeline');
    Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');
    Route::get('/leads/{id}', [LeadController::class, 'show'])->name('leads.show');

    // APPOINTMENT MANAGEMENT APIS
    Route::get('/api/patients', [AppointmentController::class, 'patients'])->name('patients.index');
    Route::post('/api/appointments/{id}/confirm', [AppointmentController::class, 'confirm'])->name('appointments.confirm');
    Route::post('/api/appointments/{id}/decline', [AppointmentController::class, 'decline'])->name('appointments.decline');
    Route::post('/api/appointments/reset-demo', [AppointmentController::class, 'resetDemo'])->name('appointments.reset-demo');

    // LEAD MANAGEMENT APIS
    Route::patch('/api/leads/{id}/status', [LeadController::class, 'updateStatus'])->name('leads.update-status');
    Route::post('/api/leads/{id}/notes', [LeadController::class, 'addNote'])->name('leads.add-note');
});
