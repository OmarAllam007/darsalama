<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
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
    /**
     * Show the date/time and details wizard for booking a doctor.
     */
    public function show(Doctor $doctor): Response
    {
        abort_unless($doctor->is_active, 404);

        return Inertia::render('site/booking/show', [
            'doctor' => $doctor->load('offers'),
            'availableWeekdays' => $doctor->availabilities()->distinct()->pluck('weekday'),
        ]);
    }

    /**
     * Return the bookable time slots for the doctor on a given date.
     */
    public function slots(Request $request, Doctor $doctor): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
        ]);

        return response()->json([
            'slots' => $this->availableSlotsFor($doctor, $validated['date']),
        ]);
    }

    /**
     * Store a new public appointment for the doctor.
     */
    public function store(Request $request, Doctor $doctor): RedirectResponse
    {
        abort_unless($doctor->is_active, 404);

        $validated = $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
            'time' => ['required', 'date_format:H:i'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:32'],
        ]);

        if (! in_array($validated['time'], $this->availableSlotsFor($doctor, $validated['date']), true)) {
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

        $qrCode = new Builder(
            writer: new PngWriter,
            data: route('appointments.show', $appointment),
            size: 220,
            margin: 8,
        );

        return Inertia::render('site/booking/confirmation', [
            'appointment' => $appointment,
            'qrCodeDataUri' => $qrCode->build()->getDataUri(),
        ]);
    }

    /**
     * @return array<int, string>
     */
    private function availableSlotsFor(Doctor $doctor, string $date): array
    {
        $weekday = Carbon::parse($date)->dayOfWeekIso - 1;

        $booked = $doctor->appointments()
            ->whereDate('date', $date)
            ->pluck('time')
            ->map(fn ($time) => Carbon::parse($time)->format('H:i'))
            ->all();

        $now = Carbon::now();
        $slots = [];

        foreach ($doctor->availabilities()->where('weekday', $weekday)->get() as $availability) {
            $cursor = Carbon::parse($date.' '.$availability->start_time);
            $end = Carbon::parse($date.' '.$availability->end_time);

            while ($cursor->copy()->addMinutes($availability->slot_minutes)->lte($end)) {
                if ($cursor->gt($now)) {
                    $slots[] = $cursor->format('H:i');
                }

                $cursor->addMinutes($availability->slot_minutes);
            }
        }

        $slots = array_values(array_diff(array_unique($slots), $booked));
        sort($slots);

        return $slots;
    }
}
