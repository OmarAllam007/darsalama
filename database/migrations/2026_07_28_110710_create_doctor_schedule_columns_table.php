<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Maps a doctor to their fixed column in the hospital's monthly OPD workbook.
     * The hospital guarantees the position; the name printed in the sheet is never
     * used for matching and may legitimately differ from the database.
     */
    public function up(): void
    {
        Schema::create('doctor_schedule_columns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('column', 4)->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_schedule_columns');
    }
};
