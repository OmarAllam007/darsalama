<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctors', function (Blueprint $table): void {
            $table->string('code')->nullable()->unique()->after('id');
        });

        DB::table('doctors')->orderBy('id')->select('id')->each(function ($doctor): void {
            DB::table('doctors')
                ->where('id', $doctor->id)
                ->update(['code' => 'DOC-'.str_pad((string) $doctor->id, 4, '0', STR_PAD_LEFT)]);
        });
    }

    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table): void {
            $table->dropUnique(['code']);
            $table->dropColumn('code');
        });
    }
};
