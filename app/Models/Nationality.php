<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'name_ar', 'flag'])]
class Nationality extends Model
{
    /** @use HasFactory<\Database\Factories\NationalityFactory> */
    use HasFactory;

    /**
     * @return HasMany<Doctor, $this>
     */
    public function doctors(): HasMany
    {
        return $this->hasMany(Doctor::class);
    }
}
