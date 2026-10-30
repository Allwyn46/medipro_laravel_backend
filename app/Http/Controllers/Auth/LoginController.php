<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        try {
            return inertia('Auth/Login');
        } catch (\Exception $e) {
            // return response()->json(['error' => 'An error occurred while showing the login form.'], 500);
            return inertia('ErrorPages/WentWrong', ['message' => 'An error occurred while showing the login form.']);
        }
    }

    public function login(Request $request)
    {
        try {
            // Login logic here
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while logging in.'], 500);
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
