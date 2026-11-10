<?php

namespace App\Http\Middleware;

use App\Models\Doctor;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $doctor = $user?->doctor;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'doctor',
                ] : null,
                'doctor' => $doctor ? [
                    'id' => $doctor->id,
                    'name' => $doctor->name,
                    'specialty' => $doctor->specialty,
                    'phone' => $doctor->phone,
                    'consultation_fee' => $doctor->consultation_fee,
                    'room' => $doctor->room,
                ] : null,
                'role' => $user?->role ?? 'doctor',
            ],
            'clinicDoctors' => Doctor::active()->get(['id', 'name', 'specialty', 'consultation_fee', 'room']),
        ];
    }
}
