<?php

use App\Models\Department;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Display order for the public site, matching darassalama.com/departments.html.
     * Departments the site does not list sort after the ones it does.
     *
     * @var list<string>
     */
    private const DEPARTMENT_ORDER = [
        'gynecology',
        'obgyn',
        'obgynecology',
        'pediatrics',
        'internal-medicine',
        'endocrinology',
        'pulmonology',
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
        'family-medicine',
        'general-practice',
        'physiotherapy',
        'anesthesia',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('departments', function (Blueprint $table): void {
            $table->unsignedInteger('sort_order')->default(0)->after('slot_minutes');
        });

        Schema::table('doctors', function (Blueprint $table): void {
            $table->unsignedInteger('sort_order')->default(0)->after('is_active');
        });

        foreach (self::DEPARTMENT_ORDER as $index => $slug) {
            Department::where('slug', $slug)->update(['sort_order' => $index + 1]);
        }

        Department::where('sort_order', 0)->update(['sort_order' => count(self::DEPARTMENT_ORDER) + 1]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table): void {
            $table->dropColumn('sort_order');
        });

        Schema::table('doctors', function (Blueprint $table): void {
            $table->dropColumn('sort_order');
        });
    }
};
