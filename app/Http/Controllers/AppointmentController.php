<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Lead;
use Database\Seeders\AppointmentSeeder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    /**
     * Get a listing of all appointments.
     */
    public function index(): JsonResponse
    {
        $appointments = Appointment::orderBy('id')->get();

        return response()->json([
            'appointments' => $appointments,
        ]);
    }

    /**
     * Get currently booked slots across doctors.
     */
    public function bookedSlots(): JsonResponse
    {
        $slots = Appointment::whereIn('status', ['Confirmed', 'Scheduled', 'In Progress'])
            ->select(['id', 'doctor', 'date', 'time', 'status'])
            ->get();

        return response()->json([
            'slots' => $slots,
        ]);
    }

    /**
     * Book a new appointment from client portal or dashboard.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patientName' => ['required', 'string', 'max:255'],
            'patientEmail' => ['required', 'email', 'max:255'],
            'patientPhone' => ['required', 'string', 'max:50'],
            'service' => ['required', 'string', 'max:255'],
            'doctor' => ['required', 'string', 'max:255'],
            'date' => ['required', 'string', 'max:50'],
            'time' => ['required', 'string', 'max:50'],
            'type' => ['nullable', 'string', 'max:100'],
            'room' => ['nullable', 'string', 'max:100'],
            'duration' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
            'source' => ['nullable', 'string', 'max:100'],
        ]);

        // Find or create matching clinical lead
        $lead = Lead::firstOrCreate(
            ['email' => $validated['patientEmail']],
            [
                'name' => $validated['patientName'],
                'phone' => $validated['patientPhone'],
                'service' => $validated['service'],
                'doctor' => $validated['doctor'],
                'status' => 'New',
                'priority' => 'High',
                'value' => 1500,
                'source' => $validated['source'] ?? 'Website Booking',
                'last_contact_date' => now()->format('Y-m-d'),
                'notes' => $validated['notes'] ?? 'Booked via client appointment portal.',
            ]
        );

        $appointment = Appointment::create([
            'patient_name' => $validated['patientName'],
            'patient_email' => $validated['patientEmail'],
            'patient_phone' => $validated['patientPhone'],
            'service' => $validated['service'],
            'doctor' => $validated['doctor'],
            'date' => $validated['date'],
            'time' => $validated['time'],
            'status' => 'Pending',
            'type' => $validated['type'] ?? 'Initial Consultation',
            'room' => $validated['room'] ?? 'Consultation Suite 1',
            'duration' => $validated['duration'] ?? '45 mins',
            'lead_id' => $lead->id,
            'notes' => $validated['notes'] ?? null,
            'source' => $validated['source'] ?? 'Website Booking',
            'requested_at' => 'Just now',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Appointment booked successfully.',
            'appointment' => $appointment,
        ], 201);
    }

    /**
     * Confirm a pending appointment and add to schedule.
     */
    public function confirm(int $id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->update([
            'status' => 'Confirmed',
            'room' => $appointment->room ?: 'Consultation Suite 1',
            'duration' => $appointment->duration ?: '45 mins',
        ]);

        // Update corresponding lead status if exists
        if ($appointment->lead_id) {
            Lead::where('id', $appointment->lead_id)->update([
                'status' => 'Consultation Scheduled',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Appointment confirmed successfully.',
            'appointment' => $appointment->fresh(),
        ]);
    }

    /**
     * Decline an appointment request.
     */
    public function decline(int $id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->update([
            'status' => 'Cancelled',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Appointment declined.',
        ]);
    }

    /**
     * Reset demo appointment requests to defaults.
     */
    public function resetDemo(): JsonResponse
    {
        (new AppointmentSeeder)->run();

        return response()->json([
            'success' => true,
            'message' => 'Demo appointments re-seeded from database.',
        ]);
    }
}
