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
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

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

        $patientToken = Str::random(40);
        $doctorToken = Str::random(40);

        $isStaffScheduling = in_array($validated['source'] ?? '', ['Staff Booking', 'Staff Scheduling']);
        $initialStatus = $isStaffScheduling ? 'Awaiting Confirmation' : 'Pending';

        $appointment = Appointment::create([
            'patient_name' => $validated['patientName'],
            'patient_email' => $validated['patientEmail'],
            'patient_phone' => $validated['patientPhone'],
            'service' => $validated['service'],
            'doctor' => $validated['doctor'],
            'doctor_id' => $doctorId,
            'date' => $validated['date'],
            'time' => $validated['time'],
            'status' => $initialStatus,
            'type' => $validated['type'] ?? 'Initial Consultation',
            'room' => $validated['room'] ?? 'Consultation Suite 1',
            'duration' => $validated['duration'] ?? '45 mins',
            'lead_id' => $lead->id,
            'notes' => $validated['notes'] ?? null,
            'source' => $validated['source'] ?? 'Website Booking',
            'requested_at' => 'Just now',
            'patient_token' => $patientToken,
            'doctor_token' => $doctorToken,
        ]);

        // Send 1-week reminder email with confirmation button to both patient and doctor
        if ($appointment->shouldSendReminder()) {
            $appointment->sendConfirmationReminders();
        }

        $activityTitle = $isStaffScheduling ? 'Appointment Scheduled' : 'Appointment Booked';
        $activityDescription = $isStaffScheduling
            ? "Scheduled consultation for {$validated['date']} at {$validated['time']} with {$validated['doctor']}. Confirmation reminder sent via email."
            : "Scheduled consultation for {$validated['date']} at {$validated['time']} with {$validated['doctor']}.";

        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'Consultation',
            'title' => $activityTitle,
            'description' => $activityDescription,
            'doctor' => $validated['doctor'],
            'date' => now()->format('Y-m-d H:i'),
        ]);

        return response()->json([
            'success' => true,
            'message' => $isStaffScheduling
                ? 'Appointment scheduled successfully. Confirmation reminders have been sent to both patient and doctor.'
                : 'Appointment booked successfully. Awaiting clinic confirmation.',
            'appointment' => $appointment->fresh(),
        ], 201);
    }

    /**
     * Confirm an appointment via email button link (Patient or Doctor).
     */
    public function confirmViaEmail(Request $request, string $token): Response
    {
        $appointment = Appointment::where('patient_token', $token)
            ->orWhere('doctor_token', $token)
            ->firstOrFail();

        $isPatient = $appointment->patient_token === $token;
        $role = $isPatient ? 'patient' : 'doctor';

        $alreadyConfirmed = $isPatient
            ? ($appointment->patient_confirmed_at !== null)
            : ($appointment->doctor_confirmed_at !== null);

        if (! $alreadyConfirmed) {
            if ($isPatient) {
                $appointment->update(['patient_confirmed_at' => now()]);
                if ($appointment->lead_id) {
                    LeadActivity::create([
                        'lead_id' => $appointment->lead_id,
                        'type' => 'Consultation',
                        'title' => 'Patient Confirmed Appointment',
                        'description' => "Patient ({$appointment->patient_name}) confirmed upcoming consultation via email.",
                        'doctor' => $appointment->doctor,
                        'date' => now()->format('Y-m-d H:i'),
                    ]);
                }
            } else {
                $appointment->update(['doctor_confirmed_at' => now()]);
                if ($appointment->lead_id) {
                    LeadActivity::create([
                        'lead_id' => $appointment->lead_id,
                        'type' => 'Consultation',
                        'title' => 'Doctor Confirmed Appointment',
                        'description' => "Doctor ({$appointment->doctor}) confirmed upcoming consultation availability via email.",
                        'doctor' => $appointment->doctor,
                        'date' => now()->format('Y-m-d H:i'),
                    ]);
                }
            }
        }

        $fresh = $appointment->fresh();
        $bothConfirmed = $fresh->patient_confirmed_at !== null && $fresh->doctor_confirmed_at !== null;

        if ($bothConfirmed && $fresh->status !== 'Confirmed') {
            $fresh->update([
                'status' => 'Confirmed',
                'room' => $fresh->room ?: 'Consultation Suite 1',
                'duration' => $fresh->duration ?: '45 mins',
            ]);

            if ($fresh->lead_id) {
                Lead::where('id', $fresh->lead_id)->update(['status' => 'Consultation Scheduled']);
                LeadActivity::create([
                    'lead_id' => $fresh->lead_id,
                    'type' => 'Consultation',
                    'title' => 'Appointment Booked & Confirmed',
                    'description' => "Both patient and doctor confirmed. Appointment officially booked for {$fresh->date} at {$fresh->time}.",
                    'doctor' => $fresh->doctor,
                    'date' => now()->format('Y-m-d H:i'),
                ]);
            }
        }

        return Inertia::render('appointments/confirmed', [
            'appointment' => $fresh,
            'role' => $role,
            'bothConfirmed' => $bothConfirmed,
            'alreadyConfirmed' => $alreadyConfirmed,
            'patientConfirmed' => (bool) $fresh->patient_confirmed_at,
            'doctorConfirmed' => (bool) $fresh->doctor_confirmed_at,
        ]);
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
