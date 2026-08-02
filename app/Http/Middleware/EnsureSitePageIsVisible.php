<?php

namespace App\Http\Middleware;

use App\Models\SitePage;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSitePageIsVisible
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $slug): Response
    {
        abort_unless(
            array_key_exists($slug, SitePage::definitions())
                && SitePage::query()->where('slug', $slug)->value('is_visible') !== false,
            404,
        );

        return $next($request);
    }
}
