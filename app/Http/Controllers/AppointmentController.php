<?php

namespace App\Http\Controllers;

use App\Mail\AppointmentConfirmedPatientMail;
use App\Mail\AppointmentUpdatedPatientMail;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\User;
use App\Services\AppointmentExpirationService;
use Database\Seeders\AppointmentSeeder;
use Database\Seeders\LeadSeeder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    /**
     * Display the dedicated appointments registry.
     */
    public function registry(Request $request): Response
    {
        // Expire any past-due unconfirmed appointments on-demand
        app(AppointmentExpirationService::class)->expirePastDueAppointments(15);

        $user = $request->user();
        $isDoctor = $user && $user->isDoctor();
        $isAdmin = $user && $user->isAdmin();

        // If doctor, strictly lock to their doctor profile; if admin, allow filtering by doctor_id query param
        $selectedDoctorId = $isDoctor
            ? $user->doctor?->id
            : ($request->filled('doctor_id') ? (int) $request->query('doctor_id') : null);

        $selectedDoctor = $selectedDoctorId ? Doctor::find($selectedDoctorId) : null;

        $appointmentsQuery = Appointment::with(['doctorProfile'])->orderByDesc('id');

        if ($selectedDoctorId) {
            $appointmentsQuery->where(function ($q) use ($selectedDoctorId, $selectedDoctor) {
                $q->where('doctor_id', $selectedDoctorId);
                if ($selectedDoctor?->name) {
                    $q->orWhere('doctor', $selectedDoctor->name);
                }
            });
        }

        $appointments = $appointmentsQuery->get();

        $doctors = $isAdmin
            ? Doctor::active()->orderBy('name')->get(['id', 'name', 'specialty', 'room', 'email', 'phone'])
            : [];

        return Inertia::render('appointments/index', [
            'appointments' => $appointments,
            'doctors' => $doctors,
            'isAdmin' => $isAdmin,
            'selectedDoctorId' => $selectedDoctorId,
        ]);
    }

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
                    'status' => 'New patients',
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

        // Send 1-week reminder email with confirmation button ONLY for staff-scheduled appointments
        if ($isStaffScheduling && $appointment->shouldSendReminder()) {
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

        if ($appointment->status === 'Reschedule') {
            return Inertia::render('appointments/expired', [
                'appointment' => $appointment,
                'rebookUrl' => route('home').'#booking',
            ]);
        }

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

        $wasAlreadyConfirmed = $appointment->status === 'Confirmed';

        $appointment->update([
            'status' => 'Confirmed',
            'doctor_confirmed_at' => $appointment->doctor_confirmed_at ?? now(),
            'room' => $appointment->room ?: 'Consultation Suite 1',
            'duration' => $appointment->duration ?: '45 mins',
        ]);

        $fresh = $appointment->fresh();

        // Update corresponding lead status if exists
        if ($fresh->lead_id) {
            Lead::where('id', $fresh->lead_id)->update([
                'status' => 'Consultation Scheduled',
            ]);
        }

        // Only send confirmation email if moving into Confirmed status
        if (! $wasAlreadyConfirmed) {
            $patientEmail = $fresh->patient_email;
            if (! empty($patientEmail) && filter_var($patientEmail, FILTER_VALIDATE_EMAIL)) {
                try {
                    Mail::to($patientEmail)->send(new AppointmentConfirmedPatientMail($fresh));

                    if ($fresh->lead_id) {
                        LeadActivity::create([
                            'lead_id' => $fresh->lead_id,
                            'type' => 'Email',
                            'title' => 'Appointment Confirmation Sent',
                            'description' => "Automated confirmation email with 1-click Google/Apple calendar invite dispatched to {$patientEmail}.",
                            'doctor' => $fresh->doctor,
                            'date' => now()->format('Y-m-d H:i'),
                        ]);
                    }
                } catch (\Throwable $e) {
                    Log::error("Failed to send appointment confirmation email to {$patientEmail}: ".$e->getMessage());
                }
            } elseif ($fresh->lead_id) {
                LeadActivity::create([
                    'lead_id' => $fresh->lead_id,
                    'type' => 'Consultation',
                    'title' => 'Appointment Confirmed',
                    'description' => "Appointment officially confirmed by doctor ({$fresh->doctor}). No patient email on file for calendar dispatch.",
                    'doctor' => $fresh->doctor,
                    'date' => now()->format('Y-m-d H:i'),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Appointment confirmed successfully.',
            'appointment' => $fresh,
        ]);
    }

    /**
     * Update appointment details (date, time, doctor, room, etc.).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $appointment = Appointment::findOrFail($id);

        if ($request->user() && $request->user()->cannot('update', $appointment)) {
            abort(403, 'Unauthorized. You cannot modify an appointment assigned to another specialist.');
        }

        $validated = $request->validate([
            'date' => ['sometimes', 'string'],
            'time' => ['sometimes', 'string'],
            'doctor_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'doctor' => ['sometimes', 'nullable', 'string'],
            'room' => ['sometimes', 'nullable', 'string'],
            'service' => ['sometimes', 'nullable', 'string'],
            'duration' => ['sometimes', 'nullable', 'string'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'string'],
        ]);

        // If doctor_id changed, sync doctor name
        if (isset($validated['doctor_id']) && ! empty($validated['doctor_id'])) {
            $docUser = User::find($validated['doctor_id']);
            if ($docUser) {
                $validated['doctor'] = $docUser->name;
            }
        }

        $watchedFields = [
            'date' => 'Date',
            'time' => 'Time',
            'doctor' => 'Specialist',
            'room' => 'Location / Room',
        ];

        $changes = [];
        $wasConfirmed = $appointment->status === 'Confirmed';

        foreach ($watchedFields as $field => $label) {
            if (array_key_exists($field, $validated) && $appointment->{$field} !== $validated[$field]) {
                $changes[$field] = [
                    'label' => $label,
                    'old' => (string) $appointment->{$field},
                    'new' => (string) $validated[$field],
                ];
            }
        }

        $appointment->update($validated);
        $fresh = $appointment->fresh();

        // If appointment was already Confirmed and key schedule attributes changed, send update email
        if ($wasConfirmed && ! empty($changes)) {
            $patientEmail = $fresh->patient_email;
            if (! empty($patientEmail) && filter_var($patientEmail, FILTER_VALIDATE_EMAIL)) {
                try {
                    Mail::to($patientEmail)->send(new AppointmentUpdatedPatientMail($fresh, $changes, 1));

                    if ($fresh->lead_id) {
                        $changeSummary = collect($changes)
                            ->map(fn ($c) => "{$c['label']}: {$c['old']} → {$c['new']}")
                            ->implode(', ');

                        LeadActivity::create([
                            'lead_id' => $fresh->lead_id,
                            'type' => 'Email',
                            'title' => 'Appointment Schedule Update Sent',
                            'description' => "Schedule revised ({$changeSummary}). Updated calendar invite dispatched to {$patientEmail}.",
                            'doctor' => $fresh->doctor,
                            'date' => now()->format('Y-m-d H:i'),
                        ]);
                    }
                } catch (\Throwable $e) {
                    Log::error("Failed to send appointment update email to {$patientEmail}: ".$e->getMessage());
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Appointment updated successfully.',
            'appointment' => $fresh,
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
