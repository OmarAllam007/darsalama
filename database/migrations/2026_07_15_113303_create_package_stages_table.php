<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_stages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();
            $table->string('name_en');
            $table->string('name_ar');
            $table->string('name_ur')->nullable();
            $table->string('name_tl')->nullable();
            $table->string('subtitle_en')->nullable();
            $table->string('subtitle_ar')->nullable();
            $table->string('subtitle_ur')->nullable();
            $table->string('subtitle_tl')->nullable();
            $table->unsignedInteger('free_consultations')->default(0);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_stages');
    }
};
