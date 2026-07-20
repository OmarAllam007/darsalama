<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Doctor;
use App\Models\Offer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

/**
 * Seeds the offer posters shown in the doctor offers modal on darassalama.com/departments.html.
 *
 * The site's openOffers() renders DEPT_OFFERS[department] and discards the per-doctor
 * offers array, so every doctor in a department shows that department's full poster set.
 * This seeder reproduces that: each department's offers are fanned out to all its doctors.
 *
 * Existing offers are left untouched so manually curated prices and artwork survive a re-run.
 */
class DepartmentOfferSeeder extends Seeder
{
    private const IMAGE_SOURCE = __DIR__.'/offer-images';

    private const IMAGE_DIRECTORY = 'offers';

    public function run(): void
    {
        foreach ($this->offersByDepartmentSlug() as $slug => $offers) {
            $department = Department::where('slug', $slug)->first();

            if (! $department) {
                $this->command?->warn("Department [{$slug}] not found, skipping.");

                continue;
            }

            $doctorIds = Doctor::where('department_id', $department->id)->pluck('id');

            foreach ($offers as $offer) {
                $imagePath = $this->storeImage($offer['image']);

                foreach ($doctorIds as $doctorId) {
                    Offer::firstOrCreate(
                        ['doctor_id' => $doctorId, 'title' => $offer['title']],
                        [
                            'description' => $offer['title_ar'],
                            'image' => $imagePath,
                        ],
                    );
                }
            }
        }
    }

    /**
     * Copies a poster onto the public disk once and returns its stored path.
     */
    private function storeImage(string $filename): ?string
    {
        $path = self::IMAGE_DIRECTORY.'/'.$filename;
        $source = self::IMAGE_SOURCE.'/'.$filename;

        if (! is_file($source)) {
            $this->command?->warn("Offer image [{$filename}] not found, storing offer without artwork.");

            return null;
        }

        if (! Storage::disk('public')->exists($path)) {
            Storage::disk('public')->put($path, (string) file_get_contents($source));
        }

        return $path;
    }

    /**
     * @return array<string, list<array{title: string, title_ar: string, image: string}>>
     */
    private function offersByDepartmentSlug(): array
    {
        return [
            'dermatology' => [
                ['title' => 'Acne Care Package', 'title_ar' => 'باقة علاج حب الشباب', 'image' => 'acne-care-package.jpg'],
                ['title' => 'Hair Fall Program', 'title_ar' => 'برنامج علاج تساقط الشعر', 'image' => 'hair-fall-program.jpg'],
            ],
            'urology' => [
                ['title' => "Men's Health Package", 'title_ar' => 'باقة صحة الرجل', 'image' => 'men-s-health-package.jpg'],
            ],
            'internal-medicine' => [
                ['title' => 'Diabetes & Obesity Pathway', 'title_ar' => 'مسار السكري والسمنة', 'image' => 'diabetes-obesity-pathway.jpg'],
            ],
            'cardiology' => [
                ['title' => 'Cardiovascular Pathway', 'title_ar' => 'مسار صحة القلب', 'image' => 'cardiovascular-pathway.jpg'],
            ],
            'gynecology' => [
                ['title' => "Women's Health Pathway", 'title_ar' => 'مسار صحة المرأة', 'image' => 'women-s-health-pathway.jpg'],
                ['title' => 'Normal Delivery Package', 'title_ar' => 'باقة الولادة الطبيعية', 'image' => 'normal-delivery-package.jpg'],
                ['title' => 'First C-Section Package', 'title_ar' => 'باقة الولادة القيصرية الأولى', 'image' => 'first-c-section-package.jpg'],
                ['title' => 'Repeat C-Section Package', 'title_ar' => 'باقة الولادة القيصرية المتكررة', 'image' => 'repeat-c-section-package.jpg'],
                ['title' => 'Pregnancy Follow-up Package', 'title_ar' => 'باقة متابعة الحمل', 'image' => 'pregnancy-follow-up-package.jpg'],
                ['title' => 'Delivery + Transport Package', 'title_ar' => 'باقة الولادة مع النقل', 'image' => 'delivery-transport-package.jpg'],
            ],
        ];
    }
}
