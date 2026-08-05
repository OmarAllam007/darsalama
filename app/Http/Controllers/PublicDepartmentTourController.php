<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Doctor;
use App\Support\BookingSlots;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PublicDepartmentTourController extends Controller
{
    public function __construct(private BookingSlots $slots) {}

    private const SOURCE_BASE = 'https://darassalama.com/';

    private const SOURCES = [
        'obgyn' => [
            'url' => 'https://darassalama.com/obgyn.html',
            'department' => 'gynecology',
            'kind' => 'obgyn',
        ],
        'pediatrics' => [
            'url' => 'https://darassalama.com/pediatrics.html',
            'department' => 'pediatrics',
            'kind' => 'team',
        ],
        'dental' => [
            'url' => 'https://darassalama.com/dental.html',
            'department' => 'dental',
            'kind' => 'team',
        ],
        'psych' => [
            'url' => 'https://darassalama.com/psychiatry.html',
            'department' => 'psychiatry',
            'kind' => 'team',
        ],
    ];

    public function show(string $tour): Response
    {
        $source = self::SOURCES[$tour] ?? abort(404);
        $department = Department::query()
            ->where('slug', $source['department'])
            ->with([
                'doctors' => fn ($query) => $query
                    ->where('is_active', true)
                    ->orderBy('sort_order')
                    ->orderBy('name')
                    ->with(['department', 'qualifications', 'services', 'nationality']),
            ])
            ->firstOrFail();
        $this->markOnlineBooking($department->doctors);

        $template = $this->rewriteAssetSources(
            $this->template($tour, $source['url']),
        );
        $html = $source['kind'] === 'obgyn'
            ? $this->injectObgynDoctors($template, $department->doctors)
            : $this->injectTeamDoctors($template, $department->doctors);

        $html = $this->rewriteLegacyLinks($html, $department->doctors, $tour);
        $html = $this->injectBookingBridgeScript($html);

        return response($html)
            ->header('Content-Type', 'text/html; charset=UTF-8');
    }

    private function template(string $tour, string $url): string
    {
        $localTemplate = resource_path("tours/{$tour}.html");
        if (is_file($localTemplate)) {
            return file_get_contents($localTemplate) ?: abort(502);
        }

        $cacheKey = "department-tour-template:{$tour}";
        $cached = Cache::get($cacheKey);

        try {
            $html = Http::connectTimeout(5)
                ->timeout(15)
                ->retry(2, 250)
                ->get($url)
                ->throw()
                ->body();

            Cache::put($cacheKey, $html, now()->addMinutes(30));

            return $html;
        } catch (\Throwable) {
            if (is_string($cached) && $cached !== '') {
                return $cached;
            }

            abort(502);
        }
    }

    private function injectTeamDoctors(string $html, Collection $doctors): string
    {
        $grid = $this->teamDoctorsGrid($doctors);

        $html = preg_replace(
            '~(<section id="team">.*?<div class="docs-grid[^"]*"[^>]*>)(.*?)(</div>\s*</section>)~si',
            '$1'.$grid.'$3',
            $html,
            1,
        ) ?? $html;

        $summary = [
            'en' => $doctors->count().' doctors from our live roster and appointment system.',
            'ar' => 'عدد الأطباء الظاهر هنا محدث مباشرة من النظام الداخلي للمستشفى.',
            'ur' => 'یہ فہرست اسپتال کے لائیو سسٹم سے براہِ راست اپ ڈیٹ ہوتی ہے۔',
            'tl' => 'Ang listahang ito ay awtomatikong ina-update mula sa live na sistema ng ospital.',
        ];

        $summaryHtml = '<p class="s-sub">'
            .'<span class="t-en">'.e($summary['en']).'</span>'
            .'<span class="t-ar ar">'.e($summary['ar']).'</span>'
            .'<span class="t-ur">'.e($summary['ur']).'</span>'
            .'<span class="t-tl">'.e($summary['tl']).'</span>'
            .'</p>';

        return preg_replace(
            '~<p class="s-sub">.*?</p>~si',
            $summaryHtml,
            $html,
            1,
        ) ?? $html;
    }

    private function injectObgynDoctors(string $html, Collection $doctors): string
    {
        $grid = $this->obgynDoctorsGrid($doctors);

        return preg_replace(
            '~(<section class="snap bg-cream short" id="doctors"[^>]*>.*?<div class="docs-grid">)(.*?)(</div>\s*</div>\s*</section>)~si',
            '$1'.$grid.'$3',
            $html,
            1,
        ) ?? $html;
    }

    private function teamDoctorsGrid(Collection $doctors): string
    {
        return $doctors
            ->map(function (Doctor $doctor): string {
                $bookHref = route('booking.show', $doctor);
                $first = Str::of($doctor->name)->after('Dr. ')->before(' ')->value() ?: 'Doctor';

                $quals = $doctor->qualifications
                    ->map(function ($qualification): string {
                        $en = e($qualification->name);
                        $ar = e($qualification->name_ar ?: $qualification->name);

                        return '<li><i data-lucide="check"></i><span>'
                            .'<span class="t-en">'.$en.'</span>'
                            .'<span class="t-ar ar">'.$ar.'</span>'
                            .'<span class="t-ur">'.$en.'</span>'
                            .'<span class="t-tl">'.$en.'</span>'
                            .'</span></li>';
                    })
                    ->implode('');

                return '<div class="docr">'
                    .'<img src="'.e($this->doctorImageUrl($doctor)).'" alt="'.e($doctor->name).'" loading="lazy" onerror="this.style.display=\'none\'">'
                    .'<div>'
                    .'<div class="dr-ar">'.e($doctor->name_ar).'</div>'
                    .'<div class="dr-en">'.e($doctor->name).'</div>'
                    .'<div class="dr-title">'
                    .'<span class="t-en">'.e($doctor->job ?: 'Specialist').'</span>'
                    .'<span class="t-ar ar">'.e($doctor->job_ar ?: ($doctor->job ?: 'اختصاصي')).'</span>'
                    .'<span class="t-ur">'.e($doctor->job ?: 'Specialist').'</span>'
                    .'<span class="t-tl">'.e($doctor->job ?: 'Specialist').'</span>'
                    .'</div>'
                    .'<ul class="dr-quals">'.$quals.'</ul>'
                    .'<a class="btn-gold js-tour-book" style="margin-top:16px;display:inline-flex" href="'.e($bookHref).'"'
                    .' data-booking-doctor="'.e((string) $doctor->id).'"'
                    .' data-booking-name-en="'.e($doctor->name).'"'
                    .' data-booking-name-ar="'.e($doctor->name_ar).'"'
                    .' data-booking-department-en="'.e($doctor->department?->name ?? '').'"'
                    .' data-booking-department-ar="'.e($doctor->department?->name_ar ?? '').'"'
                    .' data-booking-online="'.($doctor->has_online_booking ? '1' : '0').'"'
                    .'>'
                    .'<i data-lucide="calendar-check"></i>'
                    .'<span class="t-en">Book with '.e($first).'</span>'
                    .'<span class="t-ar">احجز موعداً</span>'
                    .'<span class="t-ur">اپائنٹمنٹ بک کریں</span>'
                    .'<span class="t-tl">Mag-book</span>'
                    .'</a>'
                    .'</div>'
                    .'</div>';
            })
            ->implode('');
    }

    private function obgynDoctorsGrid(Collection $doctors): string
    {
        return $doctors
            ->values()
            ->map(function (Doctor $doctor, int $index): string {
                $delay = min($index + 2, 4);
                $nameplate = $index === 0 ? 'doc-nameplate' : 'doc-nameplate pink';
                $bookHref = route('booking.show', $doctor);

                $qualifications = $doctor->qualifications
                    ->map(fn ($qualification) => '<li>'.e($qualification->name_ar ?: $qualification->name).'</li>')
                    ->implode('');

                $services = $doctor->services
                    ->map(fn ($service) => '<li>'.e($service->name_ar ?: $service->name).'</li>')
                    ->implode('');

                return '<article class="doc reveal d'.$delay.'">'
                    .'<div class="doc-portrait">'
                    .'<img loading="lazy" src="'.e($this->doctorImageUrl($doctor)).'" alt="'.e($doctor->name).'" onerror="this.style.display=\'none\'">'
                    .'</div>'
                    .'<div class="'.e($nameplate).'">'
                    .($doctor->nationality?->flag
                        ? '<img class="doc-flag" src="'.e($doctor->nationality->flag).'" alt="'.e($doctor->nationality->name).'" onerror="this.remove()" loading="lazy" decoding="async">'
                        : '')
                    .'<div class="ar-name">'.e($doctor->name_ar).'</div>'
                    .'<div class="en-name">'.e($doctor->name).'</div>'
                    .'<div class="role">'.e($doctor->job_ar ?: '').'<span class="role-en">'.e($doctor->job ?: '').'</span></div>'
                    .'</div>'
                    .'<div class="doc-body">'
                    .'<h4>Credentials · الشهادات</h4>'
                    .'<ul class="doc-list ar-list">'.$qualifications.'</ul>'
                    .'<h4>Services · الخدمات</h4>'
                    .'<ul class="doc-list ar-list">'.$services.'</ul>'
                    .'<div class="doc-cta">'
                    .'<a class="book js-tour-book" href="'.e($bookHref).'"'
                    .' data-booking-doctor="'.e((string) $doctor->id).'"'
                    .' data-booking-name-en="'.e($doctor->name).'"'
                    .' data-booking-name-ar="'.e($doctor->name_ar).'"'
                    .' data-booking-department-en="'.e($doctor->department?->name ?? '').'"'
                    .' data-booking-department-ar="'.e($doctor->department?->name_ar ?? '').'"'
                    .' data-booking-online="'.($doctor->has_online_booking ? '1' : '0').'"'
                    .'>'
                    .'<span class="t-en">Book Appointment</span>'
                    .'<span class="t-ar">احجز موعداً</span>'
                    .'<span class="t-ur">اپوائنٹمنٹ بک کریں</span>'
                    .'<span class="t-tl">Mag-Book ng Appointment</span>'
                    .'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 5l7 7-7 7"/></svg>'
                    .'</a>'
                    .'<a class="wa" href="https://wa.me/966505848298" target="_blank" rel="noopener">WhatsApp</a>'
                    .'</div>'
                    .'</div>'
                    .'</article>';
            })
            ->implode('');
    }

    private function rewriteLegacyLinks(string $html, Collection $doctors, string $tour): string
    {
        $fallback = $doctors->first() ? route('booking.show', $doctors->first()) : route('services');
        $byLegacyKey = [];

        foreach ($doctors as $doctor) {
            foreach ($this->doctorKeys($doctor) as $key) {
                $byLegacyKey[$key] = route('booking.show', $doctor);
            }
        }

        $html = preg_replace_callback(
            '~href="departments\.html\?book=([^"&]+)[^"]*"~i',
            function (array $match) use ($byLegacyKey, $fallback): string {
                $key = Str::lower($match[1]);

                return 'href="'.e($byLegacyKey[$key] ?? $fallback).'"';
            },
            $html,
        ) ?? $html;

        $tourRoutes = [
            'obgyn.html' => route('departments.tour', 'obgyn'),
            'pediatrics.html' => route('departments.tour', 'pediatrics'),
            'dental.html' => route('departments.tour', 'dental'),
            'psychiatry.html' => route('departments.tour', 'psych'),
            'psych.html' => route('departments.tour', 'psych'),
            'services.html' => route('services'),
            'departments.html' => route('doctors'),
            'offers.html' => route('offers'),
            'index.html' => route('home'),
            'contact-us.html' => route('contact'),
        ];

        foreach ($tourRoutes as $from => $to) {
            $html = str_replace('href="'.$from.'"', 'href="'.$to.'"', $html);
        }

        if ($tour === 'psych') {
            $html = str_replace('psychiatry.html', route('departments.tour', 'psych'), $html);
        }

        return $html;
    }

    private function rewriteAssetSources(string $html): string
    {
        // Source templates use local-relative media paths. Mirror them to the
        // canonical host so the identical design still resolves all assets.
        $base = self::SOURCE_BASE;
        $replace = [
            'src="./assets/' => 'src="'.$base.'assets/',
            "src='./assets/" => "src='".$base.'assets/',
            'href="./assets/' => 'href="'.$base.'assets/',
            "href='./assets/" => "href='".$base.'assets/',
            "url('./assets/" => "url('".$base.'assets/',
            'url("./assets/' => 'url("'.$base.'assets/',
            'url(./assets/' => 'url('.$base.'assets/',
            'src="/obgyn-media/' => 'src="'.$base.'obgyn-media/',
            "src='/obgyn-media/" => "src='".$base.'obgyn-media/',
            "url('/obgyn-media/" => "url('".$base.'obgyn-media/',
            'url("/obgyn-media/' => 'url("'.$base.'obgyn-media/',
            'url(/obgyn-media/' => 'url('.$base.'obgyn-media/',
        ];

        return strtr($html, $replace);
    }

    private function doctorImageUrl(Doctor $doctor): string
    {
        if (! $doctor->image) {
            return '';
        }

        if (Str::startsWith($doctor->image, ['http://', 'https://', '/'])) {
            return $doctor->image;
        }

        if (Str::startsWith($doctor->image, 'storage/')) {
            return '/'.$doctor->image;
        }

        return '/storage/'.$doctor->image;
    }

    private function doctorKeys(Doctor $doctor): array
    {
        $full = Str::of($doctor->name)
            ->replaceMatches('/^dr\.?\s+/i', '')
            ->ascii()
            ->lower()
            ->replaceMatches('/[^a-z0-9]+/', '-')
            ->trim('-')
            ->value();

        $parts = array_values(array_filter(explode('-', $full)));
        $firstLast = count($parts) >= 2 ? $parts[0].'-'.$parts[1] : $full;

        return array_unique(array_filter([$full, $firstLast]));
    }

    /**
     * @param  Collection<int, Doctor>  $doctors
     */
    private function markOnlineBooking(Collection $doctors): void
    {
        $availability = $this->slots->futureAvailabilityFor($doctors);

        $doctors->each(
            fn (Doctor $doctor) => $doctor->setAttribute(
                'has_online_booking',
                $availability[$doctor->id] ?? false,
            ),
        );
    }

    private function injectBookingBridgeScript(string $html): string
    {
        $script = <<<'HTML'
<script>
(() => {
    const postBooking = (link) => {
        const doctorId = Number(link.dataset.bookingDoctor || 0);

        if (!doctorId || !window.parent || window.parent === window) {
            return false;
        }

        window.parent.postMessage({
            type: 'tour:book',
            doctor: {
                id: doctorId,
                name: link.dataset.bookingNameEn || '',
                name_ar: link.dataset.bookingNameAr || link.dataset.bookingNameEn || '',
                has_online_booking: link.dataset.bookingOnline === '1',
                department: {
                    name: link.dataset.bookingDepartmentEn || '',
                    name_ar: link.dataset.bookingDepartmentAr || link.dataset.bookingDepartmentEn || '',
                },
            },
        }, '*');

        return true;
    };

    document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const link = target?.closest('a[data-booking-doctor]');

        if (!link) {
            return;
        }

        event.preventDefault();

        if (!postBooking(link)) {
            window.location.href = link.getAttribute('href') || '/services';
        }
    });
})();
</script>
HTML;

        if (str_contains($html, '</body>')) {
            return str_replace('</body>', $script.'</body>', $html);
        }

        return $html.$script;
    }
}
