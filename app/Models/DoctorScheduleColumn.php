<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A doctor's fixed column in the hospital's monthly OPD workbook.
 */
#[Fillable(['doctor_id', 'column', 'upload_name'])]
class DoctorScheduleColumn extends Model
{
    /**
     * @return BelongsTo<Doctor, $this>
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }
}
