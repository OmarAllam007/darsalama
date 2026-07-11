<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\CallbackRequestController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PublicDoctorController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'site/home')->name('home');
Route::inertia('about', 'site/about')->name('about');
Route::get('doctors', [PublicDoctorController::class, 'index'])->name('doctors');
Route::get('doctors/{doctor}', [PublicDoctorController::class, 'show'])->name('doctors.show');
Route::post('doctors/{doctor}/callback-requests', [CallbackRequestController::class, 'store'])->name('doctors.callback-requests.store');
Route::inertia('services', 'site/services')->name('services');
Route::inertia('contact', 'site/contact')->name('contact');
Route::inertia('feedback', 'site/feedback')->name('feedback');
Route::inertia('offers', 'site/offers')->name('offers');

Route::get('book/{doctor}', [BookingController::class, 'show'])->name('booking.show');
Route::get('book/{doctor}/slots', [BookingController::class, 'slots'])->name('booking.slots');
Route::post('book/{doctor}', [BookingController::class, 'store'])->name('booking.store');
Route::get('appointments/{appointment}', [BookingController::class, 'confirmation'])->name('appointments.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
