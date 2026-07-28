<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One row per confirmed workbook import: who applied which file to which
     * month, and what it changed.
     */
    public function up(): void
    {
        Schema::create('schedule_imports', function (Blueprint $table) {
            $table->id();
            $table->date('month');
            $table->string('original_filename');
            $table->foreignId('imported_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('summary');
            $table->timestamps();

            $table->index('month');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_imports');
    }
};
