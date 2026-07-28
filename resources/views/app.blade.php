@php
    // The site renders on the client, so anything a crawler or link preview needs
    // has to be in this server-rendered head. Pages override the defaults by
    // passing an `seo` prop; everything else falls back to config/seo.php.
    $seo = array_merge(
        [
            'title' => null,
            'description' => config('seo.description'),
            'image' => config('seo.image'),
            'noindex' => false,
            'schema' => null,
        ],
        $page['props']['seo'] ?? [],
    );

    $appName = config('app.name', 'Laravel');
    $documentTitle = $seo['title'] ? $seo['title'].' - '.$appName : config('seo.title');
    $canonical = url()->current();
    $imageUrl = str_starts_with((string) $seo['image'], 'http') ? $seo['image'] : url($seo['image']);

    // Staff-only and transactional areas must never reach an index.
    $noindex = $seo['noindex'] || request()->is('admin', 'admin/*', 'settings/*', 'dashboard', 'login', 'register', 'forgot-password', 'reset-password/*');

    $organisation = config('seo.organisation');
    $structuredData = [
        '@context' => 'https://schema.org',
        '@type' => 'Hospital',
        'name' => $organisation['name'],
        'alternateName' => $organisation['name_ar'],
        'description' => config('seo.description'),
        'url' => config('app.url'),
        'logo' => url('/apple-touch-icon.png'),
        'image' => url(config('seo.image')),
        'telephone' => $organisation['telephone'],
        'foundingDate' => $organisation['founded'],
        'address' => [
            '@type' => 'PostalAddress',
            'streetAddress' => $organisation['street_address'],
            'addressLocality' => $organisation['locality'],
            'addressRegion' => $organisation['region'],
            'addressCountry' => $organisation['country'],
        ],
        'geo' => [
            '@type' => 'GeoCoordinates',
            'latitude' => $organisation['latitude'],
            'longitude' => $organisation['longitude'],
        ],
        'sameAs' => $organisation['same_as'],
    ];
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <meta name="description" content="{{ $seo['description'] }}">
        <link rel="canonical" href="{{ $canonical }}">
        <meta name="robots" content="{{ $noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1' }}">
        <meta name="theme-color" content="{{ config('seo.theme_color') }}">

        {{-- Open Graph: what WhatsApp, Facebook and LinkedIn show when the link is shared --}}
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ $organisation['name'] }}">
        <meta property="og:title" content="{{ $documentTitle }}">
        <meta property="og:description" content="{{ $seo['description'] }}">
        <meta property="og:url" content="{{ $canonical }}">
        <meta property="og:image" content="{{ $imageUrl }}">
        @if ($seo['image'] === config('seo.image'))
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="630">
        @endif
        <meta property="og:locale" content="{{ config('seo.locale') }}">
        @foreach (config('seo.alternate_locales') as $alternateLocale)
            <meta property="og:locale:alternate" content="{{ $alternateLocale }}">
        @endforeach

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $documentTitle }}">
        <meta name="twitter:description" content="{{ $seo['description'] }}">
        <meta name="twitter:image" content="{{ $imageUrl }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon_dar.ico" sizes="any">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        {{-- Tells Google the hospital's name, location, phone and coordinates for local search and maps --}}
        <script type="application/ld+json">
            @json($structuredData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        </script>

        @if ($seo['schema'])
            {{-- Extra structured data for this page (a doctor, a department, …) --}}
            <script type="application/ld+json">
                @json($seo['schema'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            </script>
        @endif

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ $documentTitle }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
