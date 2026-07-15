<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_price_tiers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();
            $table->string('label_en');
            $table->string('label_ar');
            $table->string('label_ur')->nullable();
            $table->string('label_tl')->nullable();
            $table->decimal('amount', 10, 2);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_price_tiers');
    }
};
