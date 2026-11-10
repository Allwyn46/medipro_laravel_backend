<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\LeadFormField;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    /**
     * Display a listing of all leads.
     */
    public function index(): Response
    {
        return Inertia::render('leads/index', [
            'leads' => self::getLeads(),
            'customFields' => LeadFormField::active()->get(),
        ]);
    }

    /**
     * Display the specified lead.
     */
    public function show(int $id): Response
    {
        $allLeads = self::getLeads();
        $lead = Lead::with('activities')->find($id);

        if (! $lead) {
            abort(404, 'Lead not found');
        }

        return Inertia::render('leads/show', [
            'lead' => $lead,
            'allLeads' => $allLeads,
            'customFields' => LeadFormField::active()->get(),
        ]);
    }

    /**
     * Display the lead custom fields settings page.
     */
    public function settings(): Response
    {
        return Inertia::render('settings/leads', [
            'fields' => LeadFormField::orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    /**
     * Store a newly created lead in the database.
     */
    public function store(Request $request): JsonResponse
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'service' => ['required', 'string', 'max:255'],
            'doctor' => ['required', 'string', 'max:255'],
            'status' => ['required', 'string', 'in:New,Contacted,Consultation Scheduled,Treatment Plan Sent,Won,Lost'],
            'priority' => ['required', 'string', 'in:High,Medium,Low'],
            'value' => ['nullable', 'numeric', 'min:0'],
            'source' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'custom_fields' => ['nullable', 'array'],
        ];

        $activeFields = LeadFormField::active()->get();
        foreach ($activeFields as $field) {
            $fieldRules = [];
            if ($field->is_required) {
                $fieldRules[] = 'required';
            } else {
                $fieldRules[] = 'nullable';
            }

            if ($field->type === 'dropdown') {
                $fieldRules[] = Rule::in($field->options ?? []);
            } else {
                $fieldRules[] = 'string';
                $fieldRules[] = 'max:1000';
            }

            $rules["custom_fields.{$field->name}"] = $fieldRules;
        }

        $validated = $request->validate($rules);

        $lead = Lead::create([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? '',
            'phone' => $validated['phone'],
            'service' => $validated['service'],
            'doctor' => $validated['doctor'],
            'status' => $validated['status'] ?? 'New',
            'priority' => $validated['priority'] ?? 'Medium',
            'value' => isset($validated['value']) ? (float) $validated['value'] : 1500.00,
            'source' => $validated['source'] ?? 'Manual Entry',
            'notes' => $validated['notes'] ?? null,
            'custom_fields' => $validated['custom_fields'] ?? [],
            'payment_status' => 'Pending',
            'last_contact_date' => now()->format('Y-m-d'),
        ]);

        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'Note',
            'title' => 'Lead Created Manually',
            'description' => 'Patient lead recorded via clinic staff portal.'.(! empty($validated['notes']) ? " Notes: {$validated['notes']}" : ''),
            'doctor' => $lead->doctor ?: (auth()->user()?->name ?? 'Clinical Staff'),
            'date' => now()->format('Y-m-d H:i'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lead created successfully.',
            'lead' => $lead->fresh(['activities']),
        ], 201);
    }

    /**
     * Get all clinical leads with activities from the database.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function getLeads(): array
    {
        return Lead::with('activities')->orderBy('id')->get()->toArray();
    }

    /**
     * Update lead status, amount/value, and payment status.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:New,Contacted,Consultation Scheduled,Treatment Plan Sent,Won,Lost'],
            'value' => ['nullable', 'numeric', 'min:0'],
            'payment_status' => ['nullable', 'string', 'in:Pending,Partially Paid,Paid'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $oldStatus = $lead->status;
        $newStatus = $validated['status'];

        $updateData = [
            'status' => $newStatus,
            'last_contact_date' => now()->format('Y-m-d'),
        ];

        if (isset($validated['value'])) {
            $updateData['value'] = (float) $validated['value'];
        }

        if (isset($validated['payment_status'])) {
            $updateData['payment_status'] = $validated['payment_status'];
        }

        $lead->update($updateData);

        // Record an activity in lead_activities
        $isWon = ($newStatus === 'Won');
        $activityType = $isWon ? 'Consultation' : 'Status Change';
        $activityTitle = $isWon ? 'Consultation Completed - Won' : "Status Changed to {$newStatus}";

        $activityDesc = $isWon
            ? 'Consultation marked as Won with Total Value of ₹'.number_format($lead->value, 2)." (Payment: {$lead->payment_status}).".(! empty($validated['notes']) ? " Note: {$validated['notes']}" : '')
            : "Lead status updated from {$oldStatus} to {$newStatus} in clinic CRM.".(! empty($validated['notes']) ? " Note: {$validated['notes']}" : '');

        $activity = LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => $activityType,
            'title' => $activityTitle,
            'description' => $activityDesc,
            'doctor' => $lead->doctor ?: (auth()->user()?->name ?? 'Clinical Staff'),
            'date' => now()->format('Y-m-d H:i'),
        ]);

        return response()->json([
            'success' => true,
            'message' => $isWon ? 'Consultation completed and marked as Won.' : 'Lead status updated successfully.',
            'lead' => $lead->fresh(['activities']),
            'activity' => $activity,
        ]);
    }

    /**
     * Add a clinical note to lead activity history.
     */
    public function addNote(Request $request, int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);

        $validated = $request->validate([
            'note' => ['required', 'string', 'max:2000'],
        ]);

        $activity = LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'Note',
            'title' => 'Staff Clinical Note',
            'description' => $validated['note'],
            'doctor' => auth()->user()?->name ?? ($lead->doctor ?: 'Clinic Staff'),
            'date' => now()->format('Y-m-d H:i'),
        ]);

        $lead->update([
            'last_contact_date' => now()->format('Y-m-d'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Clinical note saved.',
            'activity' => $activity,
        ]);
    }
}
