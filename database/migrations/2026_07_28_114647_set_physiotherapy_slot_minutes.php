<?php

use App\Models\Department;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Appointment length is a department property: physiotherapy runs 30 minutes,
     * dental 40, everything else the 15-minute default. Dental was already set;
     * this adds physiotherapy, matching by slug so it applies whenever that
     * department is created.
     */
    public function up(): void
    {
        Department::whereIn('slug', ['physiotherapy', 'physical-therapy'])
            ->update(['slot_minutes' => 30]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Department::whereIn('slug', ['physiotherapy', 'physical-therapy'])
            ->update(['slot_minutes' => 15]);
    }
};
