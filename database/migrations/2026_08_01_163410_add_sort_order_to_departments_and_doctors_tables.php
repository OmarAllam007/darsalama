<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
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
