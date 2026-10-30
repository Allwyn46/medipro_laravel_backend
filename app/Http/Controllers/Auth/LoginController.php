<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        try {
            return inertia('Auth/Login');
        } catch (\Exception $e) {
            // return response()->json(['error' => 'An error occurred while showing the login form.'], 500);
            return inertia('ErrorPages/wentWrong', ['message' => 'An error occurred while showing the login form.']);
        }
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        try {
            $user = User::where('user_mail', $validated['email'])->first();

            if (!$user || !Hash::check($validated['password'], $user->password)) {
                Log::warning('Login failed: invalid credentials', [
                    'email' => $validated['email'],
                ]);

                return response()->json([
                    'status'  => 'error',
                    'message' => 'Invalid Credentials',
                ], 401);
            }

            Auth::login($user);
            $request->session()->regenerate();

            return inertia('dashboard', ['message' => 'User login successfully']);
            
        } catch (\Throwable $e) {
            Log::error('Login error: ' . $e->getMessage());

            return inertia('ErrorPages/wentWrong', ['message' => 'An error occurred while showing the login form.']);
        }
    }

    public function logout(Request $request)
    {
        try {
            // Logout logic here
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while logging out.'], 500);
        }
    }
}
