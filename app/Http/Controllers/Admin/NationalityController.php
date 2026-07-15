<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Nationality;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        $validated = $this->validated($request);
        $validated['flag'] = $this->storeFlag($request);

        Nationality::create($validated);

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
        $validated = $this->validated($request);
        unset($validated['flag']);
        $flag = $this->storeFlag($request);

        if ($flag !== null) {
            $this->deleteFlag($nationality->flag);
            $validated['flag'] = $flag;
        }

        $nationality->update($validated);

        return to_route('admin.nationalities.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Nationality $nationality): RedirectResponse
    {
        $this->deleteFlag($nationality->flag);
        $nationality->delete();

        return to_route('admin.nationalities.index');
    }

    /**
     * @return array{name: string, name_ar: string}
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'name_ar' => ['required', 'string', 'max:255'],
            'flag' => ['nullable', 'image', 'max:2048'],
        ]);
    }

    /**
     * Store an uploaded flag image and return its public path, or null when no file was sent.
     */
    private function storeFlag(Request $request): ?string
    {
        if (! $request->hasFile('flag')) {
            return null;
        }

        $path = $request->file('flag')->store('nationality-flags', 'public');

        return $path === false ? null : '/storage/'.$path;
    }

    /**
     * Remove a previously uploaded flag image (bundled /flags assets are left untouched).
     */
    private function deleteFlag(?string $flag): void
    {
        if ($flag !== null && str_starts_with($flag, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $flag));
        }
    }
}
