<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_features', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_highlighted')->default(false);
            $table->string('label_en');
            $table->string('label_ar');
            $table->string('label_ur')->nullable();
            $table->string('label_tl')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_features');
    }
};
