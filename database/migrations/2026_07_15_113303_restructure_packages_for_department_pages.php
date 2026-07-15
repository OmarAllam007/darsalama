<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table): void {
            $table->string('slug')->nullable()->after('department_id');
            $table->string('type')->default('delivery')->after('slug');

            $table->string('name_en')->nullable()->after('type');
            $table->string('name_ur')->nullable()->after('name_ar');
            $table->string('name_tl')->nullable()->after('name_ur');

            $table->string('category_label_en')->nullable()->after('name_tl');
            $table->string('category_label_ar')->nullable()->after('category_label_en');
            $table->string('category_label_ur')->nullable()->after('category_label_ar');
            $table->string('category_label_tl')->nullable()->after('category_label_ur');

            $table->string('subtitle_en')->nullable()->after('category_label_tl');
            $table->string('subtitle_ar')->nullable()->after('subtitle_en');
            $table->string('subtitle_ur')->nullable()->after('subtitle_ar');
            $table->string('subtitle_tl')->nullable()->after('subtitle_ur');

            $table->text('description_en')->nullable()->after('subtitle_tl');
            $table->text('description_ar')->nullable()->after('description_en');
            $table->text('description_ur')->nullable()->after('description_ar');
            $table->text('description_tl')->nullable()->after('description_ur');

            $table->string('tagline_en')->nullable()->after('description_tl');
            $table->string('tagline_ar')->nullable()->after('tagline_en');
            $table->string('tagline_ur')->nullable()->after('tagline_ar');
            $table->string('tagline_tl')->nullable()->after('tagline_ur');

            $table->string('image')->nullable()->after('tagline_tl');
            $table->decimal('original_price', 10, 2)->nullable()->after('price');
            $table->unsignedInteger('sort_order')->default(0)->after('original_price');
            $table->boolean('is_active')->default(true)->after('sort_order');
        });

        foreach (DB::table('packages')->get() as $package) {
            DB::table('packages')->where('id', $package->id)->update([
                'name_en' => $package->name,
                'description_en' => $package->description,
                'slug' => Str::slug($package->name).'-'.$package->id,
            ]);
        }

        Schema::table('packages', function (Blueprint $table): void {
            $table->string('name_en')->nullable(false)->change();
            $table->decimal('price', 10, 2)->nullable()->change();
            $table->dropColumn(['name', 'description']);
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table): void {
            $table->string('name')->nullable();
            $table->text('description')->nullable();
        });

        foreach (DB::table('packages')->get() as $package) {
            DB::table('packages')->where('id', $package->id)->update([
                'name' => $package->name_en,
                'description' => $package->description_en,
            ]);
        }

        Schema::table('packages', function (Blueprint $table): void {
            $table->dropColumn([
                'slug', 'type', 'name_en', 'name_ur', 'name_tl',
                'category_label_en', 'category_label_ar', 'category_label_ur', 'category_label_tl',
                'subtitle_en', 'subtitle_ar', 'subtitle_ur', 'subtitle_tl',
                'description_en', 'description_ar', 'description_ur', 'description_tl',
                'tagline_en', 'tagline_ar', 'tagline_ur', 'tagline_tl',
                'image', 'original_price', 'sort_order', 'is_active',
            ]);
        });
    }
};
