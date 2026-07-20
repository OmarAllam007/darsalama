<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Support\BookingSlots;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function __construct(private BookingSlots $slots) {}

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

    /**
     * Show the manual booking form (pick doctor + date, then a slot).
     */
    public function create(): Response
    {
        return Inertia::render('admin/appointments/create', [
            'doctors' => Doctor::where('is_active', true)
                ->with('department:id,name,slot_minutes')
                ->orderBy('name')
                ->get(['id', 'name', 'department_id']),
        ]);
    }

    /**
     * Return the bookable slots for a doctor on a date (department-duration aware).
     */
    public function slots(Request $request, Doctor $doctor): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
        ]);

        return response()->json([
            'slots' => $this->slots->available($doctor, $validated['date'], enforceLeadTime: false),
        ]);
    }

    /**
     * Store a manually booked appointment.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'doctor_id' => ['required', 'integer', 'exists:doctors,id'],
            'date' => ['required', 'date'],
            'time' => ['required', 'date_format:H:i'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:32'],
        ]);

        $doctor = Doctor::findOrFail($validated['doctor_id']);

        if (! in_array($validated['time'], $this->slots->available($doctor, $validated['date'], enforceLeadTime: false), true)) {
            return back()->withErrors(['time' => 'This time slot is not available.'])->withInput();
        }

        try {
            $doctor->appointments()->create($validated);
        } catch (QueryException) {
            return back()->withErrors(['time' => 'This time slot was just booked. Please choose another.'])->withInput();
        }

        return to_route('admin.appointments.index');
    }
}
