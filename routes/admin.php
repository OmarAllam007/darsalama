<?php

use App\Http\Controllers\Admin\AppointmentController;
use App\Http\Controllers\Admin\CallbackRequestController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\DoctorController;
use App\Http\Controllers\Admin\DoctorScheduleController;
use App\Http\Controllers\Admin\FeedbackController;
use App\Http\Controllers\Admin\NationalityController;
use App\Http\Controllers\Admin\OfferController;
use App\Http\Controllers\Admin\PackageController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::middleware('guest:web')->get('admin/login', function (Request $request) {
    if (! $request->session()->has('url.intended')) {
        $request->session()->put('url.intended', route('admin.doctors.index'));
    }

    return Inertia::render('auth/login', [
        'canResetPassword' => Features::enabled(Features::resetPasswords()),
        'status' => $request->session()->get('status'),
    ]);
})->name('admin.login');

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('departments', DepartmentController::class)->except('show');
    Route::resource('doctors', DoctorController::class)->except('show');
    Route::resource('packages', PackageController::class)->except('show');
    Route::resource('offers', OfferController::class)->except('show');
    Route::patch('offers/{offer}/restore', [OfferController::class, 'restore'])->name('offers.restore');
    Route::resource('nationalities', NationalityController::class)->except('show');
    Route::get('doctor-schedules/export', [DoctorScheduleController::class, 'export'])->name('doctor-schedules.export');
    Route::post('doctor-schedules/import', [DoctorScheduleController::class, 'import'])->name('doctor-schedules.import');
    Route::get('doctor-schedules', [DoctorScheduleController::class, 'index'])->name('doctor-schedules.index');
    Route::put('doctor-schedules', [DoctorScheduleController::class, 'update'])->name('doctor-schedules.update');
    Route::get('appointments', [AppointmentController::class, 'index'])->name('appointments.index');
    Route::get('appointments/create', [AppointmentController::class, 'create'])->name('appointments.create');
    Route::post('appointments', [AppointmentController::class, 'store'])->name('appointments.store');
    Route::get('appointments/{doctor}/slots', [AppointmentController::class, 'slots'])->name('appointments.slots');
    Route::get('callback-requests', [CallbackRequestController::class, 'index'])->name('callback-requests.index');
    Route::get('feedback', [FeedbackController::class, 'index'])->name('feedback.index');
});
