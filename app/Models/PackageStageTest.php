<?php

namespace App\Models;

use Database\Factories\PackageStageTestFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['package_stage_id', 'name', 'code', 'sort_order'])]
class PackageStageTest extends Model
{
    /** @use HasFactory<PackageStageTestFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<PackageStage, $this>
     */
    public function stage(): BelongsTo
    {
        return $this->belongsTo(PackageStage::class, 'package_stage_id');
    }
}
