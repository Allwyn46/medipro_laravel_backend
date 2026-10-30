<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Response;

class LoginController extends Controller
{
    public function showLoginForm(): Response
    {
        return inertia('Auth/Login');
    }

    public function login(Request $request): JsonResponse
    {
        // Validation failures automatically return 422 JSON for Axios requests
        $validated = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        try {
            $user = User::where('user_mail', $validated['email'])->first();

            if (! $user || ! Hash::check($validated['password'], $user->password)) {
                Log::warning('Login failed: invalid credentials', [
                    'email' => $validated['email'],
                    'ip'    => $request->ip(),
                ]);

                return response()->json([
                    'status'  => 'error',
                    'message' => 'Invalid credentials',
                ], 401);
            }

            Auth::login($user);
            $request->session()->regenerate();

            return response()->json([
                'status'   => 'success',
                'message'  => 'User logged in successfully',
                'redirect' => route('dashboard'),
            ]);
        } catch (\Throwable $e) {
            Log::error('Login error: ' . $e->getMessage());

            return response()->json([
                'status'  => 'error',
                'message' => 'Something went wrong. Please try again.',
            ], 500);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'status'   => 'success',
                'message'  => 'Logged out successfully',
                'redirect' => route('login'),
            ]);
        } catch (\Throwable $e) {
            Log::error('Logout error: ' . $e->getMessage());

            return response()->json([
                'status'  => 'error',
                'message' => 'An error occurred while logging out.',
            ], 500);
        }
    }
}