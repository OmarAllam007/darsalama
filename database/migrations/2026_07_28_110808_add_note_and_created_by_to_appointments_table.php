<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Reception books on a patient's behalf, so an appointment now records who
     * took it and anything they were told. Public bookings leave both null.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('note')->nullable()->after('status');
            $table->foreignId('created_by')->nullable()->after('note')->constrained('users')->nullOnDelete();
        });

        // Reception filters the calendar by doctor and day on every page load.
        Schema::table('appointments', function (Blueprint $table) {
            $table->index(['doctor_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['doctor_id', 'date']);
            $table->dropConstrainedForeignId('created_by');
            $table->dropColumn('note');
        });
    }
};
