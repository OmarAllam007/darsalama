<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['doctor_id', 'weekday', 'start_time', 'end_time', 'slot_minutes'])]
class DoctorAvailability extends Model
{
    /** @use HasFactory<\Database\Factories\DoctorAvailabilityFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Doctor, $this>
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }
}
