<?php

namespace App\Models;

use Database\Factories\PackageFeatureFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['package_id', 'is_highlighted', 'label_en', 'label_ar', 'label_ur', 'label_tl', 'sort_order'])]
class PackageFeature extends Model
{
    /** @use HasFactory<PackageFeatureFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_highlighted' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Package, $this>
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }
}
