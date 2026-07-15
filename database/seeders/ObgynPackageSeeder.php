<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Package;
use Illuminate\Database\Seeder;

class ObgynPackageSeeder extends Seeder
{
    public function run(): void
    {
        $department = Department::firstOrCreate(
            ['name' => 'Gynecology'],
            ['name_ar' => 'أمراض النساء والولادة', 'slug' => 'gynecology'],
        );

        if (! $department->slug) {
            $department->update(['slug' => 'gynecology']);
        }

        foreach ($this->packages() as $data) {
            $features = $data['features'] ?? [];
            $tiers = $data['price_tiers'] ?? [];
            $stages = $data['stages'] ?? [];
            unset($data['features'], $data['price_tiers'], $data['stages']);

            $package = Package::updateOrCreate(
                ['department_id' => $department->id, 'slug' => $data['slug']],
                [...$data, 'department_id' => $department->id],
            );

            $package->features()->delete();
            $package->priceTiers()->delete();
            $package->stages()->delete();

            foreach (array_values($features) as $index => $feature) {
                $package->features()->create([...$feature, 'sort_order' => $index]);
            }

            foreach (array_values($tiers) as $index => $tier) {
                $package->priceTiers()->create([...$tier, 'sort_order' => $index]);
            }

            foreach (array_values($stages) as $stageIndex => $stage) {
                $tests = $stage['tests'] ?? [];
                unset($stage['tests']);

                $created = $package->stages()->create([...$stage, 'sort_order' => $stageIndex]);

                foreach (array_values($tests) as $testIndex => $test) {
                    $created->tests()->create([...$test, 'sort_order' => $testIndex]);
                }
            }
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function packages(): array
    {
        $deliveryFeatures = [
            [
                'is_highlighted' => true,
                'label_en' => 'Free Circumcision & Ear Piercing',
                'label_ar' => 'ختان وتخريم الأذن مجاناً',
                'label_ur' => 'مفت ختنہ اور کان چھیدنا',
                'label_tl' => 'Libreng Tuli at Pagbutas ng Tenga',
            ],
            [
                'is_highlighted' => false,
                'label_en' => 'Private Room & Hospitality',
                'label_ar' => 'غرفة خاصة وضيافة فندقية',
                'label_ur' => 'پرائیویٹ کمرہ اور مہمان نوازی',
                'label_tl' => 'Pribadong Silid at Hospitality',
            ],
        ];

        return [
            [
                'slug' => 'normal-delivery',
                'type' => 'delivery',
                'sort_order' => 1,
                'name_en' => 'Normal Delivery',
                'name_ar' => 'الولادة الطبيعية',
                'name_ur' => 'نارمل ڈیلیوری',
                'name_tl' => 'Normal na Panganganak',
                'category_label_en' => 'Package · 01',
                'category_label_ar' => 'باقة الولادة',
                'price' => 2500,
                'original_price' => 3250,
                'tagline_en' => 'Prices excl. VAT · T&C apply',
                'tagline_ar' => 'لأن سلامتك تهمنا',
                'features' => $deliveryFeatures,
            ],
            [
                'slug' => 'cesarean-first',
                'type' => 'delivery',
                'sort_order' => 2,
                'name_en' => 'Cesarean — First Time',
                'name_ar' => 'الولادة القيصرية — لأول مرة',
                'name_ur' => 'سیزیرین — پہلی بار',
                'name_tl' => 'Cesarean — Unang Beses',
                'category_label_en' => 'Package · 02',
                'category_label_ar' => 'باقة الولادة',
                'price' => 5600,
                'original_price' => 8000,
                'tagline_en' => 'Prices excl. VAT · T&C apply',
                'tagline_ar' => 'لأن سلامتك تهمنا',
                'features' => $deliveryFeatures,
            ],
            [
                'slug' => 'cesarean-repeat',
                'type' => 'delivery',
                'sort_order' => 3,
                'name_en' => 'Cesarean — Repeat',
                'name_ar' => 'الولادة القيصرية — متكررة',
                'name_ur' => 'سیزیرین — دوبارہ',
                'name_tl' => 'Cesarean — Paulit-ulit',
                'category_label_en' => 'Package · 03',
                'category_label_ar' => 'باقة الولادة',
                'price' => 6900,
                'original_price' => 8500,
                'tagline_en' => 'Prices excl. VAT · T&C apply',
                'tagline_ar' => 'لأن سلامتك تهمنا',
                'features' => $deliveryFeatures,
            ],
            [
                'slug' => 'maternity-care',
                'type' => 'care',
                'sort_order' => 4,
                'name_en' => 'Maternity Care Package',
                'name_ar' => 'باقة متابعة الحمل',
                'name_ur' => 'زچگی نگہداشت پیکج',
                'name_tl' => 'Pakete ng Pangangalaga sa Pagbubuntis',
                'category_label_en' => 'Follow-up · 3 Months',
                'category_label_ar' => 'باقة المتابعة',
                'description_en' => 'A complete prenatal journey across 3 months — labs, scans, CTG and two free consultations per stage. Reserving any follow-up package also reserves the discounted delivery prices.',
                'description_ar' => 'رحلة متكاملة خلال 3 أشهر — تحاليل، أشعة، CTG واستشارتان مجانيتان لكل مرحلة. حجز أي باقة متابعة يتيح لك أسعار الولادة المخفضة.',
                'description_ur' => '3 ماہ میں مکمل قبل از پیدائش سفر — لیبز، اسکینز، CTG اور ہر مرحلے میں دو مفت مشاورتیں۔',
                'description_tl' => 'Isang kumpletong paglalakbay sa buong 3 buwan — mga lab, scan, CTG at dalawang libreng konsultasyon bawat yugto.',
                'price' => null,
                'tagline_en' => 'Reserves the discounted delivery prices · Prices excl. VAT',
                'tagline_ar' => 'هدية خاصة عند المتابعة الكاملة',
                'features' => [
                    [
                        'is_highlighted' => true,
                        'label_en' => 'Free Circumcision & Ear Piercing',
                        'label_ar' => 'ختان وتخريم الأذن مجاناً',
                        'label_ur' => 'مفت ختنہ اور کان چھیدنا',
                        'label_tl' => 'Libreng Tuli at Pagbutas ng Tenga',
                    ],
                    [
                        'is_highlighted' => false,
                        'label_en' => 'Special Gift Included',
                        'label_ar' => 'هدية خاصة',
                        'label_ur' => 'خصوصی تحفہ شامل ہے',
                        'label_tl' => 'May kasamang Espesyal na Regalo',
                    ],
                ],
                'price_tiers' => [
                    [
                        'label_en' => 'Specialist',
                        'label_ar' => 'أخصائي',
                        'label_ur' => 'ماہر',
                        'label_tl' => 'Espesyalista',
                        'amount' => 400,
                    ],
                    [
                        'label_en' => 'Consultant',
                        'label_ar' => 'استشاري',
                        'label_ur' => 'مشیر',
                        'label_tl' => 'Konsultant',
                        'amount' => 650,
                    ],
                ],
                'stages' => [
                    [
                        'name_en' => 'First Trimester',
                        'name_ar' => 'الثلث الأول',
                        'subtitle_en' => 'Months 1 – 3',
                        'subtitle_ar' => 'الأشهر 1 – 3',
                        'free_consultations' => 2,
                        'tests' => [
                            ['name' => 'Blood Group', 'code' => 'Lb1391'],
                            ['name' => 'RBS', 'code' => 'LB1002'],
                            ['name' => 'Urine', 'code' => 'Lb1107'],
                            ['name' => 'HBSAG', 'code' => 'Lb1248'],
                            ['name' => 'HIV Screen', 'code' => 'Lb1143'],
                            ['name' => 'Ultrasound', 'code' => 'Xr1115'],
                            ['name' => 'VDRL', 'code' => 'LB1139'],
                            ['name' => 'CBC', 'code' => 'LB1052'],
                            ['name' => 'Rubella IgG', 'code' => 'LB1134'],
                        ],
                    ],
                    [
                        'name_en' => 'Second Trimester',
                        'name_ar' => 'الثلث الثاني',
                        'subtitle_en' => 'Months 4 – 6',
                        'subtitle_ar' => 'الأشهر 4 – 6',
                        'free_consultations' => 2,
                        'tests' => [
                            ['name' => 'CBC', 'code' => 'LB1052'],
                            ['name' => 'Oral Glucose Tolerance Test (GCT)', 'code' => 'LB1528'],
                            ['name' => 'Urine', 'code' => 'Lb1107'],
                            ['name' => 'Ultrasound', 'code' => 'Xr1115'],
                        ],
                    ],
                    [
                        'name_en' => 'Third Trimester',
                        'name_ar' => 'الثلث الثالث',
                        'subtitle_en' => 'Months 7 – 9',
                        'subtitle_ar' => 'الأشهر 7 – 9',
                        'free_consultations' => 2,
                        'tests' => [
                            ['name' => 'CBC', 'code' => 'LB1052'],
                            ['name' => 'RBS', 'code' => 'LB1002'],
                            ['name' => 'CTG', 'code' => 'OP2007'],
                            ['name' => 'Urine', 'code' => 'Lb1107'],
                            ['name' => 'Ultrasound', 'code' => 'Xr1115'],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'transport-after-delivery',
                'type' => 'transport',
                'sort_order' => 5,
                'name_en' => 'Transport After Delivery',
                'name_ar' => 'خدمة نقل ما بعد الولادة',
                'name_ur' => 'ڈیلیوری کے بعد سفری خدمت',
                'name_tl' => 'Transportasyon pagkatapos manganak',
                'category_label_en' => 'Premium Transport',
                'category_label_ar' => 'خدمة فاخرة',
                'price' => 250,
                'tagline_en' => 'Service available within Khobar area',
                'tagline_ar' => 'لأن سلامتك تهمنا',
                'features' => [
                    [
                        'is_highlighted' => false,
                        'label_en' => 'Khobar Area',
                        'label_ar' => 'منطقة الخبر',
                        'label_ur' => 'خبر علاقہ',
                        'label_tl' => 'Lugar ng Khobar',
                    ],
                    [
                        'is_highlighted' => true,
                        'label_en' => 'Chauffeur · Door to Door',
                        'label_ar' => 'سائق خاص · من باب لباب',
                        'label_ur' => 'چوفر · دروازے سے دروازے تک',
                        'label_tl' => 'Chauffeur · Pinto hanggang Pinto',
                    ],
                ],
            ],
        ];
    }
}
