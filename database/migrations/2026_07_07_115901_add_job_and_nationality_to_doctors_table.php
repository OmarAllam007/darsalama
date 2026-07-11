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
        Schema::table('doctors', function (Blueprint $table) {
            $table->string('job')->nullable()->after('name_ar');
            $table->string('job_ar')->nullable()->after('job');
            $table->foreignId('nationality_id')->nullable()->after('department_id')->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropConstrainedForeignId('nationality_id');
            $table->dropColumn(['job', 'job_ar']);
        });
    }
};
