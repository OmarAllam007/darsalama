<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Doctor;
use App\Support\BookingSlots;
use Inertia\Inertia;
use Inertia\Response;

class PublicDepartmentController extends Controller
{
    public function __construct(private BookingSlots $slots) {}

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
                    ->with(['department', 'nationality', 'qualifications', 'services']),
            ])
            ->firstOrFail();

        $availability = $this->slots->futureAvailabilityFor($department->doctors);

        $department->doctors->each(
            fn (Doctor $doctor) => $doctor->setAttribute(
                'has_online_booking',
                $availability[$doctor->id],
            ),
        );

        return Inertia::render('site/departments/obgyn', [
            'department' => $department,
            'seo' => [
                'title' => 'Obstetrics & Gynaecology',
                'description' => 'Obstetrics and gynaecology at Dar As Salama Medical Hospital, Al Khobar — '
                    .'antenatal care, delivery packages and women\'s health with female consultants. '
                    .'Caring for mothers in Khobar since 1976.',
                'schema' => [
                    '@context' => 'https://schema.org',
                    '@type' => 'MedicalClinic',
                    'name' => 'Obstetrics & Gynaecology — '.config('seo.organisation.name'),
                    'medicalSpecialty' => 'Obstetric',
                    'url' => route('obgyn'),
                    'telephone' => config('seo.organisation.telephone'),
                    'parentOrganization' => [
                        '@type' => 'Hospital',
                        'name' => config('seo.organisation.name'),
                        'url' => config('app.url'),
                    ],
                ],
            ],
        ]);
    }
}
