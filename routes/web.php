<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\LeadDocumentController;
use App\Http\Controllers\LeadFormFieldController;
use App\Http\Controllers\PipelineController;
use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $bookedSlots = Appointment::whereIn('status', ['Confirmed', 'Scheduled', 'In Progress', 'Awaiting Confirmation'])
        ->select(['id', 'doctor', 'date', 'time', 'status'])
        ->get();

    $doctors = Doctor::active()
        ->orderBy('id')
        ->get(['id', 'name', 'specialty', 'consultation_fee', 'room', 'email', 'phone', 'is_active']);

    return inertia('welcome', [
        'bookedSlots' => $bookedSlots,
        'doctors' => $doctors,
    ]);
})->name('home');

Route::get('/staff', fn () => auth()->check() ? redirect()->route('dashboard') : redirect()->route('login'))->name('staff.portal');
Route::inertia('/error', 'ErrorPages/wentWrong')->name('error');

// PUBLIC APPOINTMENT & DOCTOR APIS
Route::post('/api/appointments', [AppointmentController::class, 'store'])->name('appointments.store');
Route::get('/api/appointments/booked-slots', [AppointmentController::class, 'bookedSlots'])->name('appointments.booked-slots');
Route::get('/api/doctors', [DoctorController::class, 'index'])->name('doctors.index');
Route::get('/appointments/confirm-email/{token}', [AppointmentController::class, 'confirmViaEmail'])->name('appointments.email-confirm');

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
    Route::get('/appointments', [AppointmentController::class, 'registry'])->name('appointments.index');

    // APPOINTMENT MANAGEMENT APIS
    Route::get('/api/patients', [AppointmentController::class, 'patients'])->name('patients.index');
    Route::patch('/api/appointments/{id}', [AppointmentController::class, 'update'])->name('appointments.update');
    Route::patch('/appointments/{id}', [AppointmentController::class, 'update']);
    Route::post('/api/appointments/{id}/confirm', [AppointmentController::class, 'confirm'])->name('appointments.confirm');
    Route::post('/api/appointments/{id}/decline', [AppointmentController::class, 'decline'])->name('appointments.decline');

    // LEAD MANAGEMENT APIS
    Route::post('/api/leads', [LeadController::class, 'store'])->name('leads.store');
    Route::patch('/api/leads/{id}/status', [LeadController::class, 'updateStatus'])->name('leads.update-status');
    Route::post('/api/leads/{id}/notes', [LeadController::class, 'addNote'])->name('leads.add-note');

    // LEAD PRESCRIPTION & DIAGNOSTIC DOCUMENTS
    Route::post('/api/leads/{id}/documents', [LeadDocumentController::class, 'store'])->name('leads.documents.store');
    Route::get('/api/leads/{id}/documents/{documentId}/stream', [LeadDocumentController::class, 'stream'])->name('leads.documents.stream');
    Route::get('/api/leads/{id}/documents/{documentId}/download', [LeadDocumentController::class, 'download'])->name('leads.documents.download');
    Route::post('/api/leads/{id}/documents/{documentId}/void', [LeadDocumentController::class, 'void'])->name('leads.documents.void');

    // ADMIN ONLY ROUTES
    Route::middleware('admin')->group(function () {
        Route::post('/api/appointments/reset-demo', [AppointmentController::class, 'resetDemo'])->name('appointments.reset-demo');

        // SETTINGS & LEAD FORM FIELDS
        Route::get('/settings/leads', [LeadController::class, 'settings'])->name('settings.leads');
        Route::get('/api/settings/lead-fields', [LeadFormFieldController::class, 'index'])->name('lead-fields.index');
        Route::post('/api/settings/lead-fields', [LeadFormFieldController::class, 'store'])->name('lead-fields.store');
        Route::patch('/api/settings/lead-fields/{id}/status', [LeadFormFieldController::class, 'updateStatus'])->name('lead-fields.update-status');
        Route::delete('/api/settings/lead-fields/{id}', [LeadFormFieldController::class, 'destroy'])->name('lead-fields.destroy');

        // DOCTOR MANAGEMENT
        Route::get('/settings/doctors', [DoctorController::class, 'settings'])->name('settings.doctors');
        Route::post('/api/doctors', [DoctorController::class, 'store'])->name('doctors.store');
        Route::patch('/api/doctors/{id}', [DoctorController::class, 'update'])->name('doctors.update');
        Route::delete('/api/doctors/{id}', [DoctorController::class, 'destroy'])->name('doctors.destroy');
    });
});
