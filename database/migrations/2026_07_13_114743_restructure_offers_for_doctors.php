<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Offers move from belonging to a department to belonging to a
        // doctor; existing rows can't be mapped to a doctor automatically.
        DB::table('offers')->delete();

        Schema::table('offers', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropColumn('department_id');
        });

        Schema::table('offers', function (Blueprint $table) {
            $table->foreignId('doctor_id')->after('id')->constrained()->cascadeOnDelete();
            $table->decimal('price', 10, 2)->nullable()->after('description');
            $table->decimal('original_price', 10, 2)->nullable()->after('price');
            $table->boolean('is_expired')->default(false)->after('original_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('offers')->delete();

        Schema::table('offers', function (Blueprint $table) {
            $table->dropForeign(['doctor_id']);
            $table->dropColumn(['doctor_id', 'price', 'original_price', 'is_expired']);
        });

        Schema::table('offers', function (Blueprint $table) {
            $table->foreignId('department_id')->after('id')->constrained()->cascadeOnDelete();
        });
    }
};
