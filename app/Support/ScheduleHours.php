<?php

namespace App\Support;

use App\Enums\DoctorScheduleStatus;
use App\Models\DoctorSchedule;
use InvalidArgumentException;

/**
 * Translates the human schedule cell (`8:00-12:00; 16:00-20:00`, `8:00-15:00 (OR)`,
 * `8:00-12:00 (OPD) 12:00-16:00 (LTC)`, `16:00-20:00 only`, `OFF`, `V`, `NO CLINIC`)
 * to/from a status + list of windows.
 *
 * A window carries the code the hospital wrote next to the range. Only an absent
 * code, `OPD` and `ONLY` mean patients may book; every other code (`OR`, `LTC`, …)
 * keeps the window on the calendar but closed, so reception can see *why*.
 *
 * @phpstan-type Window array{start: string, end: string, code: string|null, bookable: bool, note: string|null}
 */
class ScheduleHours
{
    /**
     * Codes that leave a window open for patient booking. Anything else closes it.
     *
     * @var list<string>
     */
    private const BOOKABLE_CODES = ['OPD', 'ONLY'];

    /**
     * Whole-cell keywords, longest first so `No clinic (V)` matches `NO CLINIC`
     * rather than the bare `V`.
     *
     * @var array<string, DoctorScheduleStatus>
     */
    private const KEYWORDS = [
        'NO CLINIC' => DoctorScheduleStatus::NoClinic,
        'N.A' => DoctorScheduleStatus::NoClinic,
        'OFF' => DoctorScheduleStatus::Off,
        'V' => DoctorScheduleStatus::Vacation,
    ];

    private const RANGE = '/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/';

    /**
     * Parse a cell into status + windows. Blank cells return null; the caller
     * decides what "the hospital wrote nothing" means.
     *
     * @return array{status: DoctorScheduleStatus, windows: list<Window>}|null
     *
     * @throws InvalidArgumentException when the cell is non-empty but unrecognised.
     */
    public static function parse(?string $cell): ?array
    {
        $cell = trim((string) preg_replace('/\s+/u', ' ', (string) $cell));

        if ($cell === '') {
            return null;
        }

        if (preg_match_all(self::RANGE, $cell, $matches, PREG_OFFSET_CAPTURE) === 0) {
            return ['status' => self::keyword($cell), 'windows' => []];
        }

        $windows = [];

        foreach ($matches[0] as $index => [$range, $offset]) {
            $trailerStart = $offset + strlen($range);
            $trailerEnd = $matches[0][$index + 1][1] ?? strlen($cell);

            $windows[] = self::window(
                start: sprintf('%02d:%02d', $matches[1][$index][0], $matches[2][$index][0]),
                end: sprintf('%02d:%02d', $matches[3][$index][0], $matches[4][$index][0]),
                trailer: substr($cell, $trailerStart, $trailerEnd - $trailerStart),
                cell: $cell,
            );
        }

        self::assertWindowsAreSane($windows, $cell);

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
     * Whether a window is open for patient booking, from its code alone. Public
     * so the importer and the calendar classify a code identically.
     */
    public static function isBookableCode(?string $code): bool
    {
        return $code === null || in_array($code, self::BOOKABLE_CODES, true);
    }

    /**
     * Build one window from its range and the free text that follows it, which
     * holds an optional code and an optional human note (`(OR) w/Neurosurgeon`).
     *
     * @return array{start: string, end: string, code: string|null, bookable: bool, note: string|null}
     */
    private static function window(string $start, string $end, string $trailer, string $cell): array
    {
        if ($start >= $end) {
            throw new InvalidArgumentException("Time range starts at or after it ends in \"{$cell}\".");
        }

        [$code, $note] = self::splitTrailer($trailer);

        return [
            'start' => $start,
            'end' => $end,
            'code' => $code,
            'bookable' => self::isBookableCode($code),
            'note' => $note,
        ];
    }

    /**
     * Split `(OR) w/Neurosurgeon` into a normalised code and the leftover note.
     * A bare trailing `only` is the sheet's unbracketed way of writing `(ONLY)`.
     *
     * @return array{0: string|null, 1: string|null}
     */
    private static function splitTrailer(string $trailer): array
    {
        $trailer = trim($trailer, " \t;,");

        if (preg_match('/^\(([^)]*)\)\s*(.*)$/u', $trailer, $m) === 1) {
            return [self::normaliseCode($m[1]), self::nullIfBlank($m[2])];
        }

        if (preg_match('/^only\b\s*(.*)$/iu', $trailer, $m) === 1) {
            return ['ONLY', self::nullIfBlank($m[1])];
        }

        return [null, self::nullIfBlank($trailer)];
    }

    /**
     * `O.R` and `OR` are the same code written two ways in the sheet.
     */
    private static function normaliseCode(string $code): ?string
    {
        $code = mb_strtoupper((string) preg_replace('/[^A-Za-z0-9]/', '', $code));

        return $code === '' ? null : $code;
    }

    /**
     * Reject ranges that overlap or repeat inside one cell — the hospital always
     * means consecutive shifts, so an overlap is a typo worth reporting.
     *
     * @param  list<array{start: string, end: string, code: string|null, bookable: bool, note: string|null}>  $windows
     */
    private static function assertWindowsAreSane(array $windows, string $cell): void
    {
        $sorted = $windows;
        usort($sorted, fn (array $a, array $b): int => $a['start'] <=> $b['start']);

        foreach ($sorted as $index => $window) {
            $previous = $sorted[$index - 1] ?? null;

            if ($previous === null) {
                continue;
            }

            if ($window['start'] === $previous['start'] && $window['end'] === $previous['end']) {
                throw new InvalidArgumentException("Duplicate time range in \"{$cell}\".");
            }

            if ($window['start'] < $previous['end']) {
                throw new InvalidArgumentException("Overlapping time ranges in \"{$cell}\".");
            }
        }
    }

    private static function keyword(string $cell): DoctorScheduleStatus
    {
        $normalised = mb_strtoupper($cell);

        foreach (self::KEYWORDS as $keyword => $status) {
            if (str_starts_with($normalised, $keyword)) {
                return $status;
            }
        }

        throw new InvalidArgumentException("Unrecognised schedule cell: \"{$cell}\"");
    }

    /**
     * @param  array{start: string, end: string, code?: string|null, bookable?: bool, note?: string|null}  $window
     */
    private static function formatWindow(array $window): string
    {
        $parts = [self::trimHour($window['start']).'-'.self::trimHour($window['end'])];

        if (($window['code'] ?? null) !== null) {
            $parts[] = "({$window['code']})";
        } elseif (! ($window['bookable'] ?? true)) {
            // Rows imported before codes existed stored a closed window with no code.
            $parts[] = '(OR)';
        }

        if (($window['note'] ?? null) !== null) {
            $parts[] = $window['note'];
        }

        return implode(' ', $parts);
    }

    /**
     * Render a stored `HH:MM` time as `H:MM`, matching the sheet's style (`8:00`).
     */
    private static function trimHour(string $time): string
    {
        [$hour, $minute] = explode(':', $time);

        return (int) $hour.':'.$minute;
    }

    private static function nullIfBlank(string $value): ?string
    {
        return trim($value) === '' ? null : trim($value);
    }
}
