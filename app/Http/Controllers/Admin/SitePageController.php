<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSitePagesRequest;
use App\Models\SitePage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SitePageController extends Controller
{
    public function index(): Response
    {
        $settings = SitePage::query()->pluck('is_visible', 'slug');

        return Inertia::render('admin/site-pages/index', [
            'pages' => collect(SitePage::definitions())
                ->map(fn (string $name, string $slug): array => [
                    'slug' => $slug,
                    'name' => $name,
                    'is_visible' => (bool) $settings->get($slug, true),
                ])->values(),
        ]);
    }

    public function update(UpdateSitePagesRequest $request): RedirectResponse
    {
        $visiblePages = collect($request->validated('visible_pages'));

        DB::transaction(function () use ($visiblePages): void {
            foreach (array_keys(SitePage::definitions()) as $slug) {
                SitePage::query()->updateOrCreate(
                    ['slug' => $slug],
                    ['is_visible' => $visiblePages->contains($slug)],
                );
            }
        });

        return back()->with('success', 'Site page visibility updated.');
    }
}
