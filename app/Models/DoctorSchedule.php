<?php

namespace App\Models;

use App\Enums\DoctorScheduleStatus;
use Database\Factories\DoctorScheduleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $doctor_id
 * @property Carbon $date
 * @property DoctorScheduleStatus $status
 * @property list<array{start: string, end: string, code?: string|null, bookable?: bool, note?: string|null}> $windows
 * @property string|null $note
 */
#[Fillable(['doctor_id', 'date', 'status', 'windows', 'note'])]
class DoctorSchedule extends Model
{
    /** @use HasFactory<DoctorScheduleFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'status' => DoctorScheduleStatus::class,
            'windows' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Doctor, $this>
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }
}
