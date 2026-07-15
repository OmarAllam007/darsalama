<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Inertia\Inertia;
use Inertia\Response;

class PublicDepartmentController extends Controller
{
    /**
     * Display the dynamic OB/GYN department landing page.
     */
    public function obgyn(): Response
    {
        $department = Department::query()
            ->where('slug', 'gynecology')
            ->orWhere('name', 'Gynecology')
            ->with([
                'packages' => fn ($query) => $query
                    ->where('is_active', true)
                    ->orderBy('sort_order')
                    ->with(['features', 'priceTiers', 'stages.tests']),
                'doctors' => fn ($query) => $query
                    ->where('is_active', true)
                    ->with(['nationality', 'qualifications', 'services', 'availabilities:id,doctor_id,weekday']),
            ])
            ->firstOrFail();

        return Inertia::render('site/departments/obgyn', [
            'department' => $department,
        ]);
    }
}
