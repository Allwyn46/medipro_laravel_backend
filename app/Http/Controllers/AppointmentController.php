<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Lead;
use App\Models\LeadActivity;
use Database\Seeders\AppointmentSeeder;
use Database\Seeders\LeadSeeder;
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
     * Get a list of existing patients/leads for appointment booking search.
     */
    public function patients(Request $request): JsonResponse
    {
        $query = Lead::query();
        $user = $request->user();

        if ($user && $user->isDoctor() && $user->doctor) {
            $query->where('doctor_id', $user->doctor->id);
        }

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $patients = $query->orderBy('name')
            ->select(['id', 'name', 'email', 'phone', 'service', 'doctor', 'doctor_id', 'status', 'value', 'notes'])
            ->get();

        return response()->json([
            'patients' => $patients,
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
            'value' => ['nullable', 'numeric', 'min:0'],
            'leadId' => ['nullable', 'integer', 'exists:leads,id'],
        ]);

        $alreadyBooked = Appointment::where('doctor', $validated['doctor'])
            ->where('date', $validated['date'])
            ->where('time', $validated['time'])
            ->whereIn('status', ['Confirmed', 'Scheduled', 'In Progress', 'Pending'])
            ->exists();

        if ($alreadyBooked) {
            return response()->json([
                'message' => "The time slot {$validated['time']} is already booked for {$validated['doctor']} on this date.",
            ], 422);
        }

        $leadValue = isset($validated['value']) ? (float) $validated['value'] : 1500;
        $doctorId = Doctor::where('name', $validated['doctor'])->value('id');

        // Find or create matching clinical lead
        $lead = null;
        if (! empty($validated['leadId'])) {
            $lead = Lead::find($validated['leadId']);
            if ($lead) {
                $leadUpdate = ['last_contact_date' => now()->format('Y-m-d')];
                if (! $lead->doctor_id && $doctorId) {
                    $leadUpdate['doctor_id'] = $doctorId;
                }
                $lead->update($leadUpdate);
            }
        }

        if (! $lead) {
            $lead = Lead::firstOrCreate(
                ['email' => $validated['patientEmail']],
                [
                    'name' => $validated['patientName'],
                    'phone' => $validated['patientPhone'],
                    'service' => $validated['service'],
                    'doctor' => $validated['doctor'],
                    'doctor_id' => $doctorId,
                    'status' => 'New',
                    'priority' => 'High',
                    'value' => $leadValue,
                    'payment_status' => 'Pending',
                    'source' => $validated['source'] ?? 'Website Booking',
                    'last_contact_date' => now()->format('Y-m-d'),
                    'notes' => $validated['notes'] ?? 'Booked via client appointment portal.',
                ]
            );
        }

        $appointment = Appointment::create([
            'patient_name' => $validated['patientName'],
            'patient_email' => $validated['patientEmail'],
            'patient_phone' => $validated['patientPhone'],
            'service' => $validated['service'],
            'doctor' => $validated['doctor'],
            'doctor_id' => $doctorId,
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

        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'Consultation',
            'title' => 'Appointment Booked',
            'description' => "Scheduled consultation for {$validated['date']} at {$validated['time']} with {$validated['doctor']}.",
            'doctor' => $validated['doctor'],
            'date' => now()->format('Y-m-d H:i'),
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
    public function confirm(Request $request, int $id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);

        if ($request->user() && $request->user()->cannot('update', $appointment)) {
            abort(403, 'Unauthorized. You cannot confirm an appointment assigned to another specialist.');
        }

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
    public function decline(Request $request, int $id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);

        if ($request->user() && $request->user()->cannot('update', $appointment)) {
            abort(403, 'Unauthorized. You cannot decline an appointment assigned to another specialist.');
        }

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
    public function resetDemo(Request $request): JsonResponse
    {
        if ($request->user() && ! $request->user()->isAdmin()) {
            abort(403, 'Unauthorized. Only administrators can reset demo data.');
        }

        if (Lead::count() === 0) {
            (new LeadSeeder)->run();
        }

        (new AppointmentSeeder)->run();

        return response()->json([
            'success' => true,
            'message' => 'Demo appointments re-seeded from database.',
        ]);
    }
}
