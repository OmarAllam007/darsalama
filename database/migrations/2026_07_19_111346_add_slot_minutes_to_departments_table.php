<?php

use App\Models\Department;
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
        Schema::table('departments', function (Blueprint $table) {
            $table->unsignedSmallInteger('slot_minutes')->default(15)->after('name_ar');
        });

        // Dental visits run longer; every other department keeps the 15-minute default.
        Department::where('slug', 'dental')->update(['slot_minutes' => 40]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropColumn('slot_minutes');
        });
    }
};
