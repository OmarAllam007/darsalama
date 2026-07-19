<?php

namespace App\Models;

use Database\Factories\FeedbackFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['rating', 'mobile', 'notes', 'status'])]
class Feedback extends Model
{
    /** @use HasFactory<FeedbackFactory> */
    use HasFactory;

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'feedback';

    /**
     * Ratings that warrant an immediate follow-up alert.
     *
     * @var list<string>
     */
    public const NEGATIVE_RATINGS = ['terrible', 'bad'];

    /**
     * Whether this feedback should trigger a follow-up alert email.
     */
    public function isNegative(): bool
    {
        return in_array($this->rating, self::NEGATIVE_RATINGS, true);
    }
}
