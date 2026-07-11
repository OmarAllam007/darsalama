<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Doctor;
use Inertia\Inertia;
use Inertia\Response;

class PublicDoctorController extends Controller
{
    /**
     * Display the public list of active doctors, grouped by department.
     */
    public function index(): Response
    {
        return Inertia::render('site/doctors', [
            'departments' => Department::with([
                'doctors' => fn ($query) => $query->where('is_active', true)->with(['nationality', 'services', 'availabilities:id,doctor_id,weekday']),
                'offers',
            ])
                ->withCount('offers')
                ->get(),
        ]);
    }

    /**
     * Display the public profile for a single doctor.
     */
    public function show(Doctor $doctor): Response
    {
        abort_unless($doctor->is_active, 404);

        $doctor->load([
            'department.offers',
            'department.packages',
            'nationality',
            'qualifications',
            'services',
            'availabilities',
        ]);

        return Inertia::render('site/doctors/show', [
            'doctor' => $doctor,
        ]);
    }
}
