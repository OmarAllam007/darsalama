<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Doctor;
use App\Support\BookingSlots;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PublicDepartmentController extends Controller
{
    /** Gynaecology keeps its own hand-built landing page. */
    private const BESPOKE_PAGES = [
        'gynecology' => 'obgyn',
    ];

    public function __construct(private BookingSlots $slots) {}

    /**
     * Display a department with its roster and live booking availability.
     */
    public function show(Department $department): RedirectResponse|Response
    {
        if (isset(self::BESPOKE_PAGES[$department->slug])) {
            return redirect()->route(self::BESPOKE_PAGES[$department->slug]);
        }

        $department->load([
            'doctors' => fn ($query) => $query
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->with(['department', 'nationality', 'qualifications', 'services']),
        ]);

        $this->markOnlineBooking($department);

        return Inertia::render('site/departments/show', [
            'department' => $department,
            'seo' => [
                'title' => $department->name,
                'description' => $department->name.' at Dar As Salama Medical Hospital, Al Khobar — '
                    .'meet the consultants and specialists and book an appointment online.',
                'schema' => [
                    '@context' => 'https://schema.org',
                    '@type' => 'MedicalClinic',
                    'name' => $department->name.' — '.config('seo.organisation.name'),
                    'medicalSpecialty' => $department->name,
                    'url' => route('departments.show', $department->slug),
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

        $this->markOnlineBooking($department);

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

    /**
     * Flag which of the department's doctors can be booked online right now.
     */
    private function markOnlineBooking(Department $department): void
    {
        $availability = $this->slots->futureAvailabilityFor($department->doctors);

        $department->doctors->each(
            fn (Doctor $doctor) => $doctor->setAttribute(
                'has_online_booking',
                $availability[$doctor->id],
            ),
        );
    }
}
