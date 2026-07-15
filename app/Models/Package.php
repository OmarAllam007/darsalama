<?php

namespace App\Models;

use Database\Factories\PackageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'department_id', 'slug', 'type',
    'name_en', 'name_ar', 'name_ur', 'name_tl',
    'category_label_en', 'category_label_ar', 'category_label_ur', 'category_label_tl',
    'subtitle_en', 'subtitle_ar', 'subtitle_ur', 'subtitle_tl',
    'description_en', 'description_ar', 'description_ur', 'description_tl',
    'tagline_en', 'tagline_ar', 'tagline_ur', 'tagline_tl',
    'image', 'price', 'original_price', 'sort_order', 'is_active',
])]
class Package extends Model
{
    /** @use HasFactory<PackageFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'original_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * @return HasMany<PackageFeature, $this>
     */
    public function features(): HasMany
    {
        return $this->hasMany(PackageFeature::class)->orderBy('sort_order');
    }

    /**
     * @return HasMany<PackagePriceTier, $this>
     */
    public function priceTiers(): HasMany
    {
        return $this->hasMany(PackagePriceTier::class)->orderBy('sort_order');
    }

    /**
     * @return HasMany<PackageStage, $this>
     */
    public function stages(): HasMany
    {
        return $this->hasMany(PackageStage::class)->orderBy('sort_order');
    }
}
