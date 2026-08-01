<?php

use App\Models\Department;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Names as darassalama.com/departments.html shows them. The slugs stay put:
     * they are in the public department URLs.
     *
     * @var array<string, array{0: string, 1: string}>
     */
    private const NAMES = [
        'spine-surgery-neurology' => ['Neuroscience', 'عيادة علوم الأعصاب'],
        'gynecology' => ['Gynecology', 'عيادة النساء والولادة'],
    ];

    /**
     * Display order, matching the same page. Departments it does not list — and
     * the ones whose doctors it folds into another clinic — sort after those it
     * does, where the public listing drops them for having no doctors.
     *
     * @var list<string>
     */
    private const ORDER = [
        'gynecology',
        'pediatrics',
        'internal-medicine',
        'general-surgery',
        'orthopedics',
        'dermatology',
        'cardiology',
        'ent',
        'ophthalmology',
        'urology',
        'dental',
        'spine-surgery-neurology',
        'rheumatology',
        'psychiatry',
        'general-practice',
        'physiotherapy',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach (self::NAMES as $slug => [$name, $nameAr]) {
            Department::where('slug', $slug)->update(['name' => $name, 'name_ar' => $nameAr]);
        }

        foreach (self::ORDER as $index => $slug) {
            Department::where('slug', $slug)->update(['sort_order' => $index + 1]);
        }

        Department::whereNotIn('slug', self::ORDER)->update(['sort_order' => count(self::ORDER) + 1]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Department::where('slug', 'spine-surgery-neurology')
            ->update(['name' => 'Spine Surgery & Neurology', 'name_ar' => 'عيادة جراحة العمود الفقري والمخ والأعصاب']);

        Department::where('slug', 'gynecology')
            ->update(['name' => 'Gynecology', 'name_ar' => 'أمراض النساء والولادة']);

        Department::query()->update(['sort_order' => 0]);
    }
};
