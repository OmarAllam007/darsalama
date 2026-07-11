<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['doctor_id', 'name', 'phone', 'package_of_interest', 'best_time', 'preferred_contact', 'notes', 'status'])]
class CallbackRequest extends Model
{
    /** @use HasFactory<\Database\Factories\CallbackRequestFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Doctor, $this>
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }
}
