<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Package;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('admin/packages/index', [
            'packages' => Package::with('department')->orderBy('sort_order')->orderBy('name_en')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/packages/create', [
            'departments' => Department::orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        $package = Package::create([
            ...Arr::except($validated, ['features', 'price_tiers', 'stages', 'image']),
            'image' => $this->storeImage($request),
        ]);

        $this->syncChildren($package, $validated);

        return to_route('admin.packages.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Package $package): Response
    {
        $package->load(['features', 'priceTiers', 'stages.tests']);

        return Inertia::render('admin/packages/edit', [
            'package' => $package,
            'departments' => Department::orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Package $package): RedirectResponse
    {
        $validated = $this->validated($request);
        $image = $this->storeImage($request);

        $attributes = Arr::except($validated, ['features', 'price_tiers', 'stages', 'image']);

        if ($image) {
            if ($package->image) {
                Storage::disk('public')->delete($package->image);
            }

            $attributes['image'] = $image;
        }

        $package->update($attributes);

        $package->features()->delete();
        $package->priceTiers()->delete();
        $package->stages()->delete();

        $this->syncChildren($package, $validated);

        return to_route('admin.packages.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Package $package): RedirectResponse
    {
        if ($package->image) {
            Storage::disk('public')->delete($package->image);
        }

        $package->delete();

        return to_route('admin.packages.index');
    }

    /**
     * Persist the nested features, price tiers, stages and stage tests.
     *
     * @param  array<string, mixed>  $validated
     */
    private function syncChildren(Package $package, array $validated): void
    {
        foreach (array_values($validated['features'] ?? []) as $index => $feature) {
            $package->features()->create([...$feature, 'sort_order' => $index]);
        }

        foreach (array_values($validated['price_tiers'] ?? []) as $index => $tier) {
            $package->priceTiers()->create([...$tier, 'sort_order' => $index]);
        }

        foreach (array_values($validated['stages'] ?? []) as $stageIndex => $stage) {
            $tests = $stage['tests'] ?? [];
            $created = $package->stages()->create([...Arr::except($stage, 'tests'), 'sort_order' => $stageIndex]);

            foreach (array_values($tests) as $testIndex => $test) {
                $created->tests()->create([...$test, 'sort_order' => $testIndex]);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'department_id' => ['required', 'exists:departments,id'],
            'slug' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'in:delivery,care,transport'],
            'name_en' => ['required', 'string', 'max:255'],
            'name_ar' => ['required', 'string', 'max:255'],
            'name_ur' => ['nullable', 'string', 'max:255'],
            'name_tl' => ['nullable', 'string', 'max:255'],
            'category_label_en' => ['nullable', 'string', 'max:255'],
            'category_label_ar' => ['nullable', 'string', 'max:255'],
            'category_label_ur' => ['nullable', 'string', 'max:255'],
            'category_label_tl' => ['nullable', 'string', 'max:255'],
            'subtitle_en' => ['nullable', 'string', 'max:255'],
            'subtitle_ar' => ['nullable', 'string', 'max:255'],
            'subtitle_ur' => ['nullable', 'string', 'max:255'],
            'subtitle_tl' => ['nullable', 'string', 'max:255'],
            'description_en' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'description_ur' => ['nullable', 'string'],
            'description_tl' => ['nullable', 'string'],
            'tagline_en' => ['nullable', 'string', 'max:255'],
            'tagline_ar' => ['nullable', 'string', 'max:255'],
            'tagline_ur' => ['nullable', 'string', 'max:255'],
            'tagline_tl' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'max:4096'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'original_price' => ['nullable', 'numeric', 'min:0'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],

            'features' => ['array'],
            'features.*.is_highlighted' => ['boolean'],
            'features.*.label_en' => ['required', 'string', 'max:255'],
            'features.*.label_ar' => ['required', 'string', 'max:255'],
            'features.*.label_ur' => ['nullable', 'string', 'max:255'],
            'features.*.label_tl' => ['nullable', 'string', 'max:255'],

            'price_tiers' => ['array'],
            'price_tiers.*.label_en' => ['required', 'string', 'max:255'],
            'price_tiers.*.label_ar' => ['required', 'string', 'max:255'],
            'price_tiers.*.label_ur' => ['nullable', 'string', 'max:255'],
            'price_tiers.*.label_tl' => ['nullable', 'string', 'max:255'],
            'price_tiers.*.amount' => ['required', 'numeric', 'min:0'],

            'stages' => ['array'],
            'stages.*.name_en' => ['required', 'string', 'max:255'],
            'stages.*.name_ar' => ['required', 'string', 'max:255'],
            'stages.*.name_ur' => ['nullable', 'string', 'max:255'],
            'stages.*.name_tl' => ['nullable', 'string', 'max:255'],
            'stages.*.subtitle_en' => ['nullable', 'string', 'max:255'],
            'stages.*.subtitle_ar' => ['nullable', 'string', 'max:255'],
            'stages.*.subtitle_ur' => ['nullable', 'string', 'max:255'],
            'stages.*.subtitle_tl' => ['nullable', 'string', 'max:255'],
            'stages.*.free_consultations' => ['nullable', 'integer', 'min:0'],
            'stages.*.tests' => ['array'],
            'stages.*.tests.*.name' => ['required', 'string', 'max:255'],
            'stages.*.tests.*.code' => ['nullable', 'string', 'max:255'],
        ]);
    }

    private function storeImage(Request $request): ?string
    {
        if (! $request->hasFile('image')) {
            return null;
        }

        $path = $request->file('image')->store('packages', 'public');

        return $path === false ? null : $path;
    }
}
