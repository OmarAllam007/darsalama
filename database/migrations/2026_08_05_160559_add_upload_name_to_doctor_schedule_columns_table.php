<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The OPD import now matches on the sheet's doctor column title rather than
     * a hardcoded Excel letter, so each doctor needs a dedicated upload name.
     */
    public function up(): void
    {
        Schema::table('doctor_schedule_columns', function (Blueprint $table) {
            $table->string('upload_name')->nullable()->after('column');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctor_schedule_columns', function (Blueprint $table) {
            $table->dropColumn('upload_name');
        });
    }
};
