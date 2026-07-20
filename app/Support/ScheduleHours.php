<?php

namespace App\Support;

use App\Enums\DoctorScheduleStatus;
use App\Models\DoctorSchedule;
use InvalidArgumentException;

/**
 * Translates the human schedule cell (`8:00-12:00; 16:00-20:00`, `8:00-15:00 (OR)`,
 * `OFF`, `V`, `NO CLINIC`) to/from a status + list of windows.
 */
class ScheduleHours
{
    /**
     * @var array<string, DoctorScheduleStatus>
     */
    private const KEYWORDS = [
        'OFF' => DoctorScheduleStatus::Off,
        'V' => DoctorScheduleStatus::Vacation,
        'NO CLINIC' => DoctorScheduleStatus::NoClinic,
    ];

    /**
     * Parse a cell into status + windows. Blank cells return null (unscheduled).
     *
     * @return array{status: DoctorScheduleStatus, windows: list<array{start: string, end: string, bookable: bool}>}|null
     *
     * @throws InvalidArgumentException when the cell is non-empty but unrecognised.
     */
    public static function parse(?string $cell): ?array
    {
        $cell = trim((string) $cell);

        if ($cell === '') {
            return null;
        }

        $keyword = self::KEYWORDS[mb_strtoupper($cell)] ?? null;

        if ($keyword !== null) {
            return ['status' => $keyword, 'windows' => []];
        }

        $windows = [];

        foreach (explode(';', $cell) as $token) {
            $token = trim($token);

            if ($token === '') {
                continue;
            }

            if (! preg_match('/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})(\s*\(OR\))?$/i', $token, $m)) {
                throw new InvalidArgumentException("Unrecognised schedule cell: \"{$cell}\"");
            }

            $windows[] = [
                'start' => sprintf('%02d:%02d', $m[1], $m[2]),
                'end' => sprintf('%02d:%02d', $m[3], $m[4]),
                'bookable' => empty($m[5]),
            ];
        }

        if ($windows === []) {
            throw new InvalidArgumentException("Unrecognised schedule cell: \"{$cell}\"");
        }

        return ['status' => DoctorScheduleStatus::Work, 'windows' => $windows];
    }

    /**
     * Format a schedule row back into the compact cell string.
     */
    public static function format(DoctorSchedule $schedule): string
    {
        if ($schedule->status !== DoctorScheduleStatus::Work) {
            return array_search($schedule->status, self::KEYWORDS, true) ?: '';
        }

        return implode('; ', array_map(
            fn (array $window): string => self::formatWindow($window),
            $schedule->windows ?? [],
        ));
    }

    /**
     * @param  array{start: string, end: string, bookable: bool}  $window
     */
    private static function formatWindow(array $window): string
    {
        $range = self::trimHour($window['start']).'-'.self::trimHour($window['end']);

        return ($window['bookable'] ?? true) ? $range : $range.' (OR)';
    }

    /**
     * Render a stored `HH:MM` time as `H:MM`, matching the sheet's style (`8:00`).
     */
    private static function trimHour(string $time): string
    {
        [$hour, $minute] = explode(':', $time);

        return (int) $hour.':'.$minute;
    }
}
