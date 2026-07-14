<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\Nationality;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DoctorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('admin/doctors/index', [
            'doctors' => Doctor::with('department')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/doctors/create', [
            'departments' => Department::orderBy('name')->get(),
            'nationalities' => Nationality::orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        $doctor = Doctor::create([
            ...$validated,
            'image' => $this->storeImage($request),
        ]);

        $doctor->availabilities()->createMany($validated['availabilities']);
        $doctor->qualifications()->createMany($validated['qualifications']);
        $doctor->services()->createMany($validated['services']);

        return to_route('admin.doctors.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Doctor $doctor): Response
    {
        $doctor->load('availabilities', 'qualifications', 'services');

        $doctor->availabilities->each(function ($availability): void {
            $availability->start_time = substr($availability->start_time, 0, 5);
            $availability->end_time = substr($availability->end_time, 0, 5);
        });

        return Inertia::render('admin/doctors/edit', [
            'doctor' => $doctor,
            'departments' => Department::orderBy('name')->get(),
            'nationalities' => Nationality::orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Doctor $doctor): RedirectResponse
    {
        $validated = $this->validated($request);
        $image = $this->storeImage($request);

        if ($image) {
            if ($doctor->image) {
                Storage::disk('public')->delete($doctor->image);
            }

            $validated['image'] = $image;
        }

        $doctor->update($validated);

        $doctor->availabilities()->delete();
        $doctor->availabilities()->createMany($validated['availabilities']);

        $doctor->qualifications()->delete();
        $doctor->qualifications()->createMany($validated['qualifications']);

        $doctor->services()->delete();
        $doctor->services()->createMany($validated['services']);

        return to_route('admin.doctors.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Doctor $doctor): RedirectResponse
    {
        if ($doctor->image) {
            Storage::disk('public')->delete($doctor->image);
        }

        $doctor->delete();

        return to_route('admin.doctors.index');
    }

    /**
     * @return array{department_id: int, nationality_id: ?int, name: string, name_ar: string, job: string, job_ar: string, is_active: bool, availabilities: array<int, array{weekday: int, start_time: string, end_time: string, slot_minutes: int}>, qualifications: array<int, array{name: string, name_ar: string}>, services: array<int, array{name: string, name_ar: string}>}
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'department_id' => ['required', 'exists:departments,id'],
            'nationality_id' => ['nullable', 'exists:nationalities,id'],
            'name' => ['required', 'string', 'max:255'],
            'name_ar' => ['required', 'string', 'max:255'],
            'job' => ['required', 'string', 'max:255'],
            'job_ar' => ['required', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'image' => ['nullable', 'image', 'max:4096'],
            'availabilities' => ['array'],
            'availabilities.*.weekday' => ['required', 'integer', 'between:0,6'],
            'availabilities.*.start_time' => ['required', 'date_format:H:i'],
            'availabilities.*.end_time' => ['required', 'date_format:H:i', 'after:availabilities.*.start_time'],
            'availabilities.*.slot_minutes' => ['required', 'integer', 'min:5', 'max:240'],
            'qualifications' => ['array'],
            'qualifications.*.name' => ['required', 'string', 'max:255'],
            'qualifications.*.name_ar' => ['required', 'string', 'max:255'],
            'services' => ['array'],
            'services.*.name' => ['required', 'string', 'max:255'],
            'services.*.name_ar' => ['required', 'string', 'max:255'],
        ]);
    }

    private function storeImage(Request $request): ?string
    {
        if (! $request->hasFile('image')) {
            return null;
        }

        $path = $request->file('image')->store('doctors', 'public');

        return $path === false ? null : $path;
    }
}
