<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'dashboard')->name('home');
Route::inertia('/error', 'ErrorPages/wentWrong')->name('error');


// AUTH ROUTES
Route::get('/login', [\App\Http\Controllers\Auth\LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [\App\Http\Controllers\Auth\LoginController::class, 'login']);
Route::post('/logout', [\App\Http\Controllers\Auth\LoginController::class, 'logout'])->name('logout');
