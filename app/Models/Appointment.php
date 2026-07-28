<?php

namespace App\Models;

use Database\Factories\AppointmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $uuid
 * @property int $doctor_id
 * @property Carbon $date
 * @property string $time
 * @property string $first_name
 * @property string $last_name
 * @property string|null $email
 * @property string|null $phone
 * @property string $status
 * @property string|null $note
 * @property int|null $created_by
 * @property-read string $reference
 * @property-read User|null $createdBy
 */
#[Fillable(['doctor_id', 'date', 'time', 'first_name', 'last_name', 'email', 'phone', 'status', 'note', 'created_by'])]
class Appointment extends Model
{
    /** @use HasFactory<AppointmentFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::creating(function (Appointment $appointment): void {
            $appointment->uuid ??= (string) Str::uuid();
        });
    }

    /**
     * @var list<string>
     */
    protected $appends = ['reference'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
        ];
    }

    /**
     * Human-readable booking reference (e.g. APT-X7M9KD), derived from the uuid
     * so it is stable and needs no extra column.
     *
     * @return Attribute<string, never>
     */
    protected function reference(): Attribute
    {
        return Attribute::get(function (): string {
            $number = hexdec(substr(str_replace('-', '', (string) $this->uuid), 0, 12)) % (36 ** 6);

            return 'APT-'.str_pad(strtoupper(base_convert((string) $number, 10, 36)), 6, '0', STR_PAD_LEFT);
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /**
     * @return BelongsTo<Doctor, $this>
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * The reception user who took the booking; null for public self-service.
     *
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
