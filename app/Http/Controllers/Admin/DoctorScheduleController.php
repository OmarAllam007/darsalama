<?php

namespace App\Http\Controllers\Admin;

use App\Enums\DoctorScheduleStatus;
use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Support\ScheduleHours;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DoctorScheduleController extends Controller
{
    private const COLORS = [
        'green' => 'C6EFCE',   // working, all windows bookable
        'orange' => 'FFE0B2',  // working with an OR (closed) window
        'grey' => 'E5E7EB',    // off / no clinic
        'red' => 'FFC7CE',     // vacation
    ];

    /**
     * Show the editable month grid of doctor schedules.
     */
    public function index(Request $request): Response
    {
        $month = $this->month($request);
        $days = $this->monthDays($month);

        $departments = $this->departmentsWithDoctors();
        $cells = $this->cellsFor($departments->pluck('doctors')->flatten(), $month);

        return Inertia::render('admin/doctor-schedules/index', [
            'month' => $month->format('Y-m'),
            'days' => $days->map(fn (Carbon $day): array => [
                'date' => $day->toDateString(),
                'weekday' => $day->isoFormat('ddd'),
            ])->all(),
            'departments' => $departments->map(fn (Department $department): array => [
                'id' => $department->id,
                'name' => $department->name,
                'slot_minutes' => $department->slot_minutes,
                'doctors' => $department->doctors->map(fn (Doctor $doctor): array => [
                    'id' => $doctor->id,
                    'code' => $doctor->code,
                    'name' => $doctor->name,
                ])->values(),
            ])->values(),
            'cells' => $cells,
            'statuses' => array_map(fn (DoctorScheduleStatus $s): string => $s->value, DoctorScheduleStatus::cases()),
        ]);
    }

    /**
     * Create/update or clear a single doctor-day cell from the grid.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'doctor_id' => ['required', 'integer', 'exists:doctors,id'],
            'date' => ['required', 'date'],
            'hours' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $parsed = ScheduleHours::parse($validated['hours'] ?? null);
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['hours' => $e->getMessage()]);
        }

        $doctor = Doctor::findOrFail($validated['doctor_id']);
        $date = Carbon::parse($validated['date'])->toDateString();

        if ($parsed === null && empty($validated['note'])) {
            $doctor->schedules()->whereDate('date', $date)->delete();

            return back();
        }

        $doctor->schedules()->updateOrCreate(
            ['date' => $date],
            [
                'status' => $parsed['status'] ?? DoctorScheduleStatus::Off,
                'windows' => $parsed['windows'] ?? [],
                'note' => $validated['note'] ?? null,
            ],
        );

        return back();
    }

    /**
     * Download the month's schedule as a colour-coded Excel workbook.
     */
    public function export(Request $request): StreamedResponse
    {
        $month = $this->month($request);
        $days = $this->monthDays($month);
        $departments = $this->departmentsWithDoctors();
        $schedules = $this->scheduleMap($departments->pluck('doctors')->flatten(), $month);

        $spreadsheet = new Spreadsheet;
        $spreadsheet->removeSheetByIndex(0);

        foreach ($departments as $department) {
            $this->buildDepartmentSheet($spreadsheet, $department, $days, $schedules, $month);
        }

        $this->buildLegendSheet($spreadsheet);
        $spreadsheet->setActiveSheetIndex(0);

        $writer = new Xlsx($spreadsheet);
        $filename = "doctor-schedule-{$month->format('Y-m')}.xlsx";

        return response()->streamDownload(function () use ($writer): void {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Import a filled-in workbook, upserting each doctor-day cell.
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls'],
        ]);

        $spreadsheet = IOFactory::load($request->file('file')->getRealPath());
        $doctorsByCode = Doctor::whereNotNull('code')->pluck('id', 'code');

        $created = 0;
        $updated = 0;
        $errors = [];

        foreach ($spreadsheet->getAllSheets() as $sheet) {
            if ($sheet->getTitle() === 'Legend') {
                continue;
            }

            $rows = $sheet->toArray(null, false, false, false);

            if (count($rows) < 3) {
                continue;
            }

            $codeRow = $rows[1];  // row 2: doctor codes per column

            foreach (array_slice($rows, 2, preserve_keys: true) as $row) {
                $date = $this->parseDate($row[0] ?? null);

                if ($date === null) {
                    continue;
                }

                for ($col = 2; $col < count($codeRow); $col++) {
                    $code = trim((string) ($codeRow[$col] ?? ''));

                    if ($code === '') {
                        continue;
                    }

                    if (! isset($doctorsByCode[$code])) {
                        $errors[] = "Unknown doctor code \"{$code}\" ({$sheet->getTitle()}).";

                        continue;
                    }

                    try {
                        $parsed = ScheduleHours::parse($row[$col] ?? null);
                    } catch (InvalidArgumentException) {
                        $errors[] = "Bad cell for {$code} on {$date}: \"{$row[$col]}\".";

                        continue;
                    }

                    if ($parsed === null) {
                        continue;
                    }

                    $result = DoctorSchedule::updateOrCreate(
                        ['doctor_id' => $doctorsByCode[$code], 'date' => $date],
                        ['status' => $parsed['status'], 'windows' => $parsed['windows']],
                    );

                    $result->wasRecentlyCreated ? $created++ : $updated++;
                }
            }
        }

        return back()->with('import', [
            'created' => $created,
            'updated' => $updated,
            'errors' => array_slice($errors, 0, 50),
        ]);
    }

    private function buildDepartmentSheet(Spreadsheet $spreadsheet, Department $department, Collection $days, array $schedules, Carbon $month): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle($this->sheetTitle($department->name));

        $sheet->setCellValue('A1', 'Date')->setCellValue('B1', 'Day');
        $sheet->setCellValue('A2', $month->format('Y-m'));

        $col = 3; // column C
        foreach ($department->doctors as $doctor) {
            $letter = Coordinate::stringFromColumnIndex($col);
            $sheet->setCellValue("{$letter}1", $doctor->name);
            $sheet->setCellValueExplicit("{$letter}2", (string) $doctor->code, DataType::TYPE_STRING);
            $col++;
        }

        $row = 3;
        foreach ($days as $day) {
            $sheet->setCellValueExplicit("A{$row}", $day->toDateString(), DataType::TYPE_STRING);
            $sheet->setCellValue("B{$row}", $day->isoFormat('ddd'));

            $col = 3;
            foreach ($department->doctors as $doctor) {
                $letter = Coordinate::stringFromColumnIndex($col);
                $schedule = $schedules[$doctor->id][$day->toDateString()] ?? null;

                if ($schedule !== null) {
                    $sheet->setCellValue("{$letter}{$row}", ScheduleHours::format($schedule));
                    $color = $this->colorFor($schedule);
                    $sheet->getStyle("{$letter}{$row}")->getFill()
                        ->setFillType(Fill::FILL_SOLID)
                        ->getStartColor()->setRGB($color);
                }

                $col++;
            }

            $row++;
        }

        $sheet->getStyle('A1:B2')->getFont()->setBold(true);
        $sheet->getStyle("C1:{$this->lastColumn($department)}2")->getFont()->setBold(true);
        $sheet->freezePane('C3');
        foreach (range('A', $this->lastColumn($department)) as $columnLetter) {
            $sheet->getColumnDimension($columnLetter)->setAutoSize(true);
        }
    }

    private function buildLegendSheet(Spreadsheet $spreadsheet): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Legend');
        $sheet->fromArray([
            ['Cell', 'Meaning', 'Bookable'],
            ['8:00-12:00; 16:00-20:00', 'Two shifts', 'Yes'],
            ['8:00-16:00', 'Single shift', 'Yes'],
            ['8:00-15:00 (OR)', 'In surgery — closed for booking', 'No'],
            ['OFF', 'Weekly day off', 'No'],
            ['V', 'Vacation', 'No'],
            ['NO CLINIC', 'Present, no outpatient clinic', 'No'],
        ]);
        $sheet->getStyle('A1:C1')->getFont()->setBold(true);
        foreach (range('A', 'C') as $columnLetter) {
            $sheet->getColumnDimension($columnLetter)->setAutoSize(true);
        }
    }

    private function colorFor(DoctorSchedule $schedule): string
    {
        if ($schedule->status === DoctorScheduleStatus::Vacation) {
            return self::COLORS['red'];
        }

        if (in_array($schedule->status, [DoctorScheduleStatus::Off, DoctorScheduleStatus::NoClinic], true)) {
            return self::COLORS['grey'];
        }

        $hasClosedWindow = collect($schedule->windows ?? [])->contains(fn (array $w): bool => ! ($w['bookable'] ?? true));

        return $hasClosedWindow ? self::COLORS['orange'] : self::COLORS['green'];
    }

    /**
     * @return Collection<int, Department>
     */
    private function departmentsWithDoctors(): Collection
    {
        return Department::whereHas('doctors', fn ($q) => $q->where('is_active', true))
            ->with(['doctors' => fn ($q) => $q->where('is_active', true)->orderBy('name')])
            ->orderBy('name')
            ->get();
    }

    /**
     * Map of doctor_id => [date => "cell string"] for the month.
     *
     * @param  Collection<int, Doctor>  $doctors
     * @return array<int, array<string, string>>
     */
    private function cellsFor(Collection $doctors, Carbon $month): array
    {
        return collect($this->scheduleMap($doctors, $month))
            ->map(fn (array $byDate): array => array_map(
                fn (DoctorSchedule $s): string => ScheduleHours::format($s),
                $byDate,
            ))
            ->all();
    }

    /**
     * Map of doctor_id => [date => DoctorSchedule] for the month.
     *
     * @param  Collection<int, Doctor>  $doctors
     * @return array<int, array<string, DoctorSchedule>>
     */
    private function scheduleMap(Collection $doctors, Carbon $month): array
    {
        return DoctorSchedule::whereIn('doctor_id', $doctors->pluck('id'))
            ->whereBetween('date', [$month->copy()->startOfMonth()->toDateString(), $month->copy()->endOfMonth()->toDateString()])
            ->get()
            ->groupBy('doctor_id')
            ->map(fn (Collection $rows) => $rows->keyBy(fn (DoctorSchedule $s): string => $s->date->toDateString())->all())
            ->all();
    }

    private function month(Request $request): Carbon
    {
        $value = $request->validate(['month' => ['nullable', 'date_format:Y-m']])['month'] ?? null;

        return $value ? Carbon::createFromFormat('Y-m', $value)->startOfMonth() : Carbon::now()->startOfMonth();
    }

    /**
     * @return Collection<int, Carbon>
     */
    private function monthDays(Carbon $month): Collection
    {
        $start = $month->copy()->startOfMonth();

        return collect(range(0, $start->daysInMonth - 1))
            ->map(fn (int $offset): Carbon => $start->copy()->addDays($offset));
    }

    private function parseDate(mixed $value): ?string
    {
        $value = trim((string) $value);

        if ($value === '') {
            return null;
        }

        try {
            return Carbon::parse($value)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }

    private function sheetTitle(string $name): string
    {
        return substr(preg_replace('/[\\\\\/?*\[\]:]/', ' ', $name), 0, 31);
    }

    private function lastColumn(Department $department): string
    {
        return Coordinate::stringFromColumnIndex(2 + max(1, $department->doctors->count()));
    }
}
