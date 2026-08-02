<?php

namespace App\Models;

use Database\Factories\SitePageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['slug', 'is_visible'])]
class SitePage extends Model
{
    /** @use HasFactory<SitePageFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    public static function definitions(): array
    {
        return [
            'about' => 'About us',
            'doctors' => 'Doctors',
            'services' => 'Medical services',
            'obgyn' => 'OB/GYN department',
            'contact' => 'Contact',
            'offers' => 'Offers',
        ];
    }

    protected function casts(): array
    {
        return ['is_visible' => 'boolean'];
    }
}
