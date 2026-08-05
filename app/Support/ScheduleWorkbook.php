<?php

namespace App\Support;

use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use InvalidArgumentException;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;

/**
 * Reads the hospital's monthly OPD workbook into `doctor_id + date => raw cell`.
 *
 * The sheet lays departments out side by side, each block being its own
 * `Days | Date | doctor | doctor …` group, so a doctor's day number comes from
 * the nearest `Date` column to their left. Doctors are matched by the doctor
 * name shown in the sheet header (upload name), not by fixed column position.
 *
 * @phpstan-type ParsedCell array{doctor_id: int, date: string, value: string|null}
 */
class ScheduleWorkbook
{
    /**
     * Read every mapped doctor's cell for the selected month.
     *
     * @param  array<int, string>  $uploadNamesByDoctor  doctor_id => expected sheet doctor column title
     * @return array{cells: list<ParsedCell>, warnings: list<string>}
     *
     * @throws InvalidArgumentException when the file is unreadable or the template
     *                                  does not look like a schedule at all.
     */
    public function read(string $path, Carbon $month, array $uploadNamesByDoctor): array
    {
        try {
            $sheet = IOFactory::load($path)->getSheet(0);
        } catch (\Throwable $e) {
            throw new InvalidArgumentException('The file could not be read as a spreadsheet: '.$e->getMessage());
        }

        /** @var array<int, array<string, string|null>> $rows */
        $rows = $sheet->toArray(null, false, false, true);

        $headerRow = $this->findHeaderRow($rows);
        $dateColumns = $this->dateColumns($rows[$headerRow]);

        if ($dateColumns === []) {
            throw new InvalidArgumentException('No "Date" column found — this does not look like the OPD schedule template.');
        }

        $doctorColumns = $this->doctorColumns($rows, $headerRow, $dateColumns);
        $daysByDateColumn = [];

        foreach ($dateColumns as $column) {
            $daysByDateColumn[$column] = $this->dayNumbers($rows, $headerRow, $column);
        }

        $cells = [];
        $warnings = [];
        $matchedColumns = [];

        foreach ($uploadNamesByDoctor as $doctorId => $uploadName) {
            $uploadName = trim((string) $uploadName);

            if ($uploadName === '') {
                continue;
            }

            $normalized = $this->normalizeName($uploadName);

            if ($normalized === '' || ! isset($doctorColumns[$normalized])) {
                $warnings[] = "No workbook column named '{$uploadName}' was found.";

                continue;
            }

            $match = $doctorColumns[$normalized];
            $column = $match['column'];
            $dateColumn = $match['date_column'];
            $matchedColumns[] = $column;

            if ($dateColumn === null) {
                $warnings[] = "Column {$column} sits before the first Date column, so its dates cannot be resolved.";

                continue;
            }

            foreach ($daysByDateColumn[$dateColumn] as $row => $day) {
                $date = $this->dateFor($month, $day);

                if ($date === null) {
                    $warnings[] = "Row {$row} is day {$day}, which does not exist in {$month->isoFormat('MMMM YYYY')}.";

                    continue;
                }

                $cells[] = [
                    'doctor_id' => (int) $doctorId,
                    'date' => $date,
                    'value' => $this->value($rows[$row][$column] ?? null),
                ];
            }
        }

        foreach ($doctorColumns as $doctorColumn) {
            if (! in_array($doctorColumn['column'], $matchedColumns, true)) {
                $warnings[] = "Workbook doctor '{$doctorColumn['upload_name']}' is not mapped to a doctor and was skipped.";
            }
        }

        return ['cells' => $cells, 'warnings' => array_values(array_unique($warnings))];
    }

    /**
     * @param  array<int, array<string, string|null>>  $rows
     * @param  list<string>  $dateColumns
     * @return array<string, array{upload_name: string, column: string, date_column: string|null}>
     */
    private function doctorColumns(array $rows, int $headerRow, array $dateColumns): array
    {
        $map = [];

        foreach (array_keys($rows[$headerRow] ?? []) as $column) {
            $label = $this->doctorLabelForColumn($rows[$headerRow] ?? [], $column);

            if ($label === null) {
                continue;
            }

            $normalized = $this->normalizeName($label);

            if ($normalized === '') {
                continue;
            }

            if (isset($map[$normalized])) {
                throw new InvalidArgumentException(
                    "The workbook contains duplicate doctor column names ('{$label}'). Please make each sheet doctor header unique.",
                );
            }

            $map[$normalized] = [
                'upload_name' => $label,
                'column' => $column,
                'date_column' => $this->dateColumnFor($column, $dateColumns),
            ];
        }

        return $map;
    }

    /**
     * The header row is the one naming the `Date` columns; everything below it is
     * a day. Scanning for it keeps the reader working if the hospital adds or
     * removes title rows above the grid.
     *
     * @param  array<int, array<string, string|null>>  $rows
     */
    private function findHeaderRow(array $rows): int
    {
        foreach ($rows as $index => $row) {
            if ($this->dateColumns($row) !== []) {
                return $index;
            }
        }

        throw new InvalidArgumentException('No "Date" column found — this does not look like the OPD schedule template.');
    }

    /**
     * @param  array<string, string|null>  $row
     * @return list<string>
     */
    private function dateColumns(array $row): array
    {
        $columns = [];

        foreach ($row as $column => $value) {
            if (mb_strtolower(trim((string) $value)) === 'date') {
                $columns[] = $column;
            }
        }

        return $columns;
    }

    /**
     * Doctor labels are taken strictly from the header row. Looking above the
     * header picks up department titles (e.g. "General Surgery - August 2026"),
     * which are not doctors and should never appear as import targets.
     *
     * @param  array<string, string|null>  $headerRow
     */
    private function doctorLabelForColumn(array $headerRow, string $column): ?string
    {
        $value = trim((string) ($headerRow[$column] ?? ''));

        if ($value === '') {
            return null;
        }

        $normalized = mb_strtolower($value);

        if ($normalized === 'date' || $normalized === 'days') {
            return null;
        }

        return preg_replace('/\s+/u', ' ', $value) ?: $value;
    }

    /**
     * Day numbers keyed by spreadsheet row, for one block's Date column.
     *
     * @param  array<int, array<string, string|null>>  $rows
     * @return array<int, int>
     */
    private function dayNumbers(array $rows, int $headerRow, string $column): array
    {
        $days = [];

        foreach ($rows as $index => $row) {
            if ($index <= $headerRow) {
                continue;
            }

            $value = trim((string) ($row[$column] ?? ''));

            if ($value !== '' && ctype_digit($value)) {
                $days[$index] = (int) $value;
            }
        }

        return $days;
    }

    /**
     * The nearest Date column at or before the doctor's own column — that is the
     * block the doctor belongs to.
     *
     * @param  list<string>  $dateColumns
     */
    private function dateColumnFor(string $column, array $dateColumns): ?string
    {
        $target = Coordinate::columnIndexFromString($column);
        $best = null;

        foreach ($dateColumns as $candidate) {
            $index = Coordinate::columnIndexFromString($candidate);

            if ($index < $target && ($best === null || $index > Coordinate::columnIndexFromString($best))) {
                $best = $candidate;
            }
        }

        return $best;
    }

    /**
     * The selected month is authoritative; the sheet supplies only the day number.
     */
    private function dateFor(Carbon $month, int $day): ?string
    {
        if ($day < 1 || $day > $month->daysInMonth) {
            return null;
        }

        return $month->copy()->startOfMonth()->addDays($day - 1)->toDateString();
    }

    private function value(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private function normalizeName(string $name): string
    {
        $baseName = preg_split('/\s*[-–—]\s*|\s*\(/u', $name, 2)[0] ?? $name;

        return (string) Str::of($baseName)
            ->lower()
            ->replaceMatches('/\b(dr|doctor)\b\.?/u', '')
            ->replace('د.', '')
            ->replace('دكتور', '')
            ->replaceMatches('/[^[:alnum:]\x{0600}-\x{06FF}]+/u', '')
            ->trim();
    }
}
