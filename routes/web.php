<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\CallbackRequestController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\PublicDepartmentController;
use App\Http\Controllers\PublicDoctorController;
use Illuminate\Support\Facades\Route;

// Each public page carries its own `seo` prop; resources/views/app.blade.php
// renders it into the head, falling back to config/seo.php.
Route::inertia('/', 'site/home')->name('home');
Route::inertia('about', 'site/about', [
    'seo' => [
        'title' => 'About Us',
        'description' => 'Dar As Salama has cared for families in Al Khobar since 1976, growing from a small '
            .'maternity clinic into a full medical hospital serving the Eastern Province.',
    ],
])->middleware('site-page:about')->name('about');
Route::get('doctors', [PublicDoctorController::class, 'index'])->middleware('site-page:doctors')->name('doctors');
Route::get('doctors/{doctor}', [PublicDoctorController::class, 'show'])->middleware('site-page:doctors')->name('doctors.show');
Route::post('doctors/{doctor}/callback-requests', [CallbackRequestController::class, 'store'])->name('doctors.callback-requests.store');
Route::inertia('services', 'site/services', [
    'seo' => [
        'title' => 'Medical Services',
        'description' => 'Specialised departments under one roof in Al Khobar — obstetrics and gynaecology, '
            .'paediatrics, general surgery, internal medicine, cardiology, orthopaedics, dental and more.',
    ],
])->middleware('site-page:services')->name('services');
Route::get('obgyn', [PublicDepartmentController::class, 'obgyn'])->middleware('site-page:obgyn')->name('obgyn');
Route::post('departments/{department:slug}/callback-requests', [CallbackRequestController::class, 'storeForDepartment'])->name('departments.callback-requests.store');
Route::inertia('contact', 'site/contact', [
    'googleReviewUrl' => config('services.google.review_url'),
    'seo' => [
        'title' => 'Contact & Directions',
        'description' => 'Visit Dar As Salama Medical Hospital in Al Khobar Al Shamalia, Khobar. '
            .'Call 920023552, message us on WhatsApp, or get directions.',
    ],
])->middleware('site-page:contact')->name('contact');
Route::redirect('feedback', 'contact')->name('feedback');
Route::post('feedback', [FeedbackController::class, 'store'])->name('feedback.store');
Route::post('contact-messages', ContactMessageController::class)
    ->middleware(['site-page:contact', 'throttle:5,1'])
    ->name('contact-messages.store');
Route::inertia('offers', 'site/offers', [
    'seo' => [
        'title' => 'Offers & Packages',
        'description' => 'Current health packages and offers at Dar As Salama Medical Hospital, Al Khobar.',
    ],
])->middleware('site-page:offers')->name('offers');

Route::get('book/{doctor}', [BookingController::class, 'show'])->name('booking.show');
Route::get('book/{doctor}/slots', [BookingController::class, 'slots'])->name('booking.slots');
Route::get('book/{doctor}/days', [BookingController::class, 'days'])->name('booking.days');
Route::post('book/{doctor}', [BookingController::class, 'store'])->name('booking.store');
Route::get('appointments/{appointment}', [BookingController::class, 'confirmation'])->name('appointments.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
