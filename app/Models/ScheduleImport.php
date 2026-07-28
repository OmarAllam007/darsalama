<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Audit trail of confirmed workbook imports.
 *
 * @property int $id
 * @property Carbon $month
 * @property string $original_filename
 * @property int|null $imported_by
 * @property array<string, int> $summary
 * @property-read User|null $importedBy
 */
#[Fillable(['month', 'original_filename', 'imported_by', 'summary'])]
class ScheduleImport extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'month' => 'date:Y-m-d',
            'summary' => 'array',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function importedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by');
    }
}
