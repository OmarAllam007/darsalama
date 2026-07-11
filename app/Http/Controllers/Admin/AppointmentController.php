<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    /**
     * Display a filterable listing of appointments.
     */
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'range' => ['nullable', Rule::in(['all', 'today', 'tomorrow', 'week', 'custom'])],
            'doctor_id' => ['nullable', 'integer', 'exists:doctors,id'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $range = $validated['range'] ?? 'all';

        $query = Appointment::with('doctor.department')
            ->orderBy('date')
            ->orderBy('time');

        if (! empty($validated['doctor_id'])) {
            $query->where('doctor_id', $validated['doctor_id']);
        }

        [$from, $to] = match ($range) {
            'today' => [today(), today()],
            'tomorrow' => [today()->addDay(), today()->addDay()],
            'week' => [today()->startOfWeek(), today()->endOfWeek()],
            'custom' => [
                isset($validated['from']) ? Carbon::parse($validated['from']) : null,
                isset($validated['to']) ? Carbon::parse($validated['to']) : null,
            ],
            default => [null, null],
        };

        if ($from) {
            $query->whereDate('date', '>=', $from->toDateString());
        }

        if ($to) {
            $query->whereDate('date', '<=', $to->toDateString());
        }

        return Inertia::render('admin/appointments/index', [
            'appointments' => $query->paginate(20)->withQueryString(),
            'doctors' => Doctor::orderBy('name')->get(['id', 'name']),
            'filters' => [
                'range' => $range,
                'doctor_id' => $validated['doctor_id'] ?? null,
                'from' => $validated['from'] ?? null,
                'to' => $validated['to'] ?? null,
            ],
        ]);
    }
}
