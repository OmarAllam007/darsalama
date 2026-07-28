<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Support\BookingSlots;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct(private BookingSlots $slots) {}

    /**
     * Show the date/time and details wizard for booking a doctor.
     */
    public function show(Doctor $doctor): Response
    {
        abort_unless($doctor->is_active, 404);

        return Inertia::render('site/booking/show', [
            'doctor' => $doctor->load('offers', 'department'),
            'hasOnlineBooking' => $this->slots->hasFutureAvailability($doctor),
            // The doctor's own profile is the page worth ranking; this one is a form.
            'seo' => ['title' => "Book {$doctor->name}", 'noindex' => true],
        ]);
    }

    /**
     * Return the bookable time slots for the doctor on a given date.
     */
    public function slots(Request $request, Doctor $doctor): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date', 'after:today'],
        ]);

        return response()->json([
            'slots' => $this->slots->available($doctor, $validated['date']),
        ]);
    }

    /**
     * Return the dates in a month the doctor is open for booking.
     */
    public function days(Request $request, Doctor $doctor): JsonResponse
    {
        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ]);

        return response()->json([
            'days' => $this->slots->bookableDays($doctor, $validated['month']),
        ]);
    }

    /**
     * Store a new public appointment for the doctor.
     */
    public function store(Request $request, Doctor $doctor): RedirectResponse
    {
        abort_unless($doctor->is_active, 404);

        $validated = $request->validate([
            'date' => ['required', 'date', 'after:today'],
            'time' => ['required', 'date_format:H:i'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:32'],
        ]);

        if (! in_array($validated['time'], $this->slots->available($doctor, $validated['date']), true)) {
            return back()->withErrors(['time' => 'This time slot is no longer available.'])->withInput();
        }

        try {
            $appointment = $doctor->appointments()->create($validated);
        } catch (QueryException) {
            return back()->withErrors(['time' => 'This time slot was just booked. Please choose another.'])->withInput();
        }

        return to_route('appointments.show', $appointment);
    }

    /**
     * Show the confirmation page for a booked appointment.
     */
    public function confirmation(Appointment $appointment): Response
    {
        $appointment->load('doctor.department');

        // The QR code is a check-in pass: once the appointment has passed, it is dead weight.
        $startsAt = Carbon::parse("{$appointment->date->toDateString()} {$appointment->time}", config('booking.timezone'));

        $qrCode = $startsAt->isFuture() ? new Builder(
            writer: new PngWriter,
            data: route('appointments.show', $appointment),
            size: 220,
            margin: 8,
        ) : null;

        return Inertia::render('site/booking/confirmation', [
            'seo' => ['title' => 'Appointment Confirmed', 'noindex' => true],
            'appointment' => $appointment,
            'qrCodeDataUri' => $qrCode?->build()->getDataUri(),
        ]);
    }
}
