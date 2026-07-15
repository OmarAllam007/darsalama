<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_stage_tests', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('package_stage_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_stage_tests');
    }
};
