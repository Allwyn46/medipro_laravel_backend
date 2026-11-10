<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class DoctorController extends Controller
{
    /**
     * Display the doctor management settings page (Admin only).
     */
    public function settings(): Response
    {
        return Inertia::render('settings/doctors', [
            'doctors' => Doctor::with('user')->orderBy('id')->get(),
        ]);
    }

    /**
     * Return active doctors for appointment booking and lead intake selectors.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'doctors' => Doctor::active()->get(['id', 'name', 'specialty', 'consultation_fee', 'room']),
        ]);
    }

    /**
     * Store a newly created doctor and underlying user login.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email', 'unique:doctors,email'],
            'password' => ['required', 'string', 'min:6'],
            'specialty' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
            'room' => ['nullable', 'string', 'max:50'],
        ]);

        $user = User::create([
            'name' => trim($validated['name']),
            'email' => trim(strtolower($validated['email'])),
            'password' => Hash::make($validated['password']),
            'role' => 'doctor',
        ]);

        $doctor = Doctor::create([
            'user_id' => $user->id,
            'name' => trim($validated['name']),
            'email' => trim(strtolower($validated['email'])),
            'specialty' => trim($validated['specialty']),
            'phone' => $validated['phone'] ?? null,
            'consultation_fee' => isset($validated['consultation_fee']) ? (float) $validated['consultation_fee'] : 1500.00,
            'room' => $validated['room'] ?? null,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Doctor provisioned successfully.',
            'doctor' => $doctor->load('user'),
        ], 201);
    }

    /**
     * Update an existing doctor profile.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $doctor = Doctor::with('user')->findOrFail($id);

        $validated = $request->validate([
            'specialty' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
            'room' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $updateData = [];
        if (isset($validated['specialty'])) {
            $updateData['specialty'] = $validated['specialty'];
        }
        if (isset($validated['phone'])) {
            $updateData['phone'] = $validated['phone'];
        }
        if (isset($validated['consultation_fee'])) {
            $updateData['consultation_fee'] = (float) $validated['consultation_fee'];
        }
        if (isset($validated['room'])) {
            $updateData['room'] = $validated['room'];
        }
        if (isset($validated['is_active'])) {
            $updateData['is_active'] = (bool) $validated['is_active'];
        }

        $doctor->update($updateData);

        if (! empty($validated['password']) && $doctor->user) {
            $doctor->user->update([
                'password' => Hash::make($validated['password']),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Doctor profile updated.',
            'doctor' => $doctor->fresh(['user']),
        ]);
    }

    /**
     * Toggle doctor active status / deactivate doctor.
     */
    public function destroy(int $id): JsonResponse
    {
        $doctor = Doctor::findOrFail($id);
        $doctor->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Doctor deactivated successfully.',
        ]);
    }
}
