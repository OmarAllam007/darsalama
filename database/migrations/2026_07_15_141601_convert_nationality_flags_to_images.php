<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Map nationality name => bundled flag image path (served from /public).
     *
     * @var array<string, string>
     */
    private array $flagImages = [
        'Egyptian' => '/flags/eg.svg',
        'Jordanian' => '/flags/jo.svg',
        'Lebanese' => '/flags/lb.svg',
        'Libyan' => '/flags/ly.svg',
        'Pakistani' => '/flags/pk.svg',
        'Saudi' => '/flags/sa.svg',
        'Sudanese' => '/flags/sd.svg',
        'Syrian' => '/flags/sy.svg',
    ];

    /**
     * Map nationality name => original flag emoji (used to reverse the migration).
     *
     * @var array<string, string>
     */
    private array $flagEmojis = [
        'Egyptian' => '🇪🇬',
        'Jordanian' => '🇯🇴',
        'Lebanese' => '🇱🇧',
        'Libyan' => '🇱🇾',
        'Pakistani' => '🇵🇰',
        'Saudi' => '🇸🇦',
        'Sudanese' => '🇸🇩',
        'Syrian' => '🇸🇾',
    ];

    public function up(): void
    {
        foreach ($this->flagImages as $name => $path) {
            DB::table('nationalities')->where('name', $name)->update(['flag' => $path]);
        }
    }

    public function down(): void
    {
        foreach ($this->flagEmojis as $name => $emoji) {
            DB::table('nationalities')->where('name', $name)->update(['flag' => $emoji]);
        }
    }
};
