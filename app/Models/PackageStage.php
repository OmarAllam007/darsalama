<?php

namespace App\Models;

use Database\Factories\PackageStageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'package_id',
    'name_en', 'name_ar', 'name_ur', 'name_tl',
    'subtitle_en', 'subtitle_ar', 'subtitle_ur', 'subtitle_tl',
    'free_consultations', 'sort_order',
])]
class PackageStage extends Model
{
    /** @use HasFactory<PackageStageFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Package, $this>
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    /**
     * @return HasMany<PackageStageTest, $this>
     */
    public function tests(): HasMany
    {
        return $this->hasMany(PackageStageTest::class)->orderBy('sort_order');
    }
}
