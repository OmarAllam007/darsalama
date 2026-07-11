<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Nationality;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NationalityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('admin/nationalities/index', [
            'nationalities' => Nationality::orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/nationalities/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        Nationality::create($this->validated($request));

        return to_route('admin.nationalities.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Nationality $nationality): Response
    {
        return Inertia::render('admin/nationalities/edit', [
            'nationality' => $nationality,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Nationality $nationality): RedirectResponse
    {
        $nationality->update($this->validated($request));

        return to_route('admin.nationalities.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Nationality $nationality): RedirectResponse
    {
        $nationality->delete();

        return to_route('admin.nationalities.index');
    }

    /**
     * @return array{name: string, name_ar: string, flag: ?string}
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'name_ar' => ['required', 'string', 'max:255'],
            'flag' => ['nullable', 'string', 'max:8'],
        ]);
    }
}
