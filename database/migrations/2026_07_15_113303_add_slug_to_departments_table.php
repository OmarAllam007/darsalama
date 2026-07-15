<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('departments', function (Blueprint $table): void {
            $table->string('slug')->nullable()->unique()->after('id');
        });

        foreach (DB::table('departments')->get() as $department) {
            DB::table('departments')
                ->where('id', $department->id)
                ->update(['slug' => Str::slug($department->name)]);
        }
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table): void {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
