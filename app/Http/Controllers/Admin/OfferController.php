<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Offer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class OfferController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('admin/offers/index', [
            'offers' => Offer::with('department')->orderBy('title')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/offers/create', [
            'departments' => Department::orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        Offer::create([
            ...$validated,
            'image' => $this->storeImage($request),
        ]);

        return to_route('admin.offers.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Offer $offer): Response
    {
        return Inertia::render('admin/offers/edit', [
            'offer' => $offer,
            'departments' => Department::orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Offer $offer): RedirectResponse
    {
        $validated = $this->validated($request);

        $image = $this->storeImage($request);

        if ($image) {
            if ($offer->image) {
                Storage::disk('public')->delete($offer->image);
            }

            $validated['image'] = $image;
        }

        $offer->update($validated);

        return to_route('admin.offers.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Offer $offer): RedirectResponse
    {
        if ($offer->image) {
            Storage::disk('public')->delete($offer->image);
        }

        $offer->delete();

        return to_route('admin.offers.index');
    }

    /**
     * @return array{department_id: int, title: string, description: string}
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'department_id' => ['required', 'exists:departments,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);
    }

    private function storeImage(Request $request): ?string
    {
        if (! $request->hasFile('image')) {
            return null;
        }

        $path = $request->file('image')->store('offers', 'public');

        return $path === false ? null : $path;
    }
}
