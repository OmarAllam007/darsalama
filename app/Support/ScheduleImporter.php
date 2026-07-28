<?php

namespace App\Support;

use App\Enums\DoctorScheduleStatus;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Turns an uploaded OPD workbook into a reviewable diff against the stored
 * schedules, and — once confirmed — applies it.
 *
 * The same method produces the preview and the thing that gets written, so what
 * the administrator approved is exactly what lands in the database.
 *
 * @phpstan-type Window array{start: string, end: string, code: string|null, bookable: bool, note: string|null}
 * @phpstan-type Row array{doctor_id: int, doctor: string, department: string, date: string, current: string, incoming: string, change: string, message: string|null, status: string|null, windows: list<Window>}
 */
class ScheduleImporter
{
    public const CHANGE_NEW = 'new';

    public const CHANGE_MODIFIED = 'modified';

    public const CHANGE_UNCHANGED = 'unchanged';

    /** The cell could not be applied without orphaning a booked appointment. */
    public const CHANGE_CONFLICT = 'conflict';

    /** The cell could not be understood at all. */
    public const CHANGE_ERROR = 'error';

    public function __construct(private ScheduleWorkbook $workbook) {}

    /**
     * Diff the workbook against what is stored, without writing anything.
     *
     * @return array{rows: list<Row>, summary: array<string, int>, warnings: list<string>}
     *
     * @throws InvalidArgumentException on a structurally unusable file.
     */
    public function preview(string $path, Carbon $month): array
    {
        $doctors = $this->mappedDoctors();

        if ($doctors->isEmpty()) {
            throw new InvalidArgumentException('No doctors are mapped to workbook columns yet. Set up the column mapping first.');
        }

        $read = $this->workbook->read(
            $path,
            $month,
            $doctors->pluck('scheduleColumn.column', 'id')->all(),
        );

        $doctorIds = $doctors->modelKeys();
        $byId = $doctors->keyBy('id');
        $schedules = $this->existingSchedules($doctorIds, $month);
        $appointments = $this->activeAppointments($doctorIds, $month);

        $rows = [];

        foreach ($read['cells'] as $cell) {
            $rows[] = $this->row(
                $byId->get($cell['doctor_id']),
                $cell['date'],
                $cell['value'],
                $schedules[$cell['doctor_id']][$cell['date']] ?? null,
                $appointments[$cell['doctor_id']][$cell['date']] ?? collect(),
            );
        }

        return [
            'rows' => $rows,
            'summary' => $this->summarise($rows, $doctors->count()),
            'warnings' => $read['warnings'],
        ];
    }

    /**
     * Apply a previewed workbook. Re-reads the file rather than trusting anything
     * round-tripped through the browser, and writes every cell or none.
     *
     * @return array{rows: list<Row>, summary: array<string, int>, warnings: list<string>}
     */
    public function apply(string $path, Carbon $month): array
    {
        $preview = $this->preview($path, $month);

        DB::transaction(function () use ($preview): void {
            foreach ($preview['rows'] as $row) {
                if (! in_array($row['change'], [self::CHANGE_NEW, self::CHANGE_MODIFIED], true)) {
                    continue;
                }

                DoctorSchedule::updateOrCreate(
                    ['doctor_id' => $row['doctor_id'], 'date' => $row['date']],
                    ['status' => $row['status'], 'windows' => $row['windows']],
                );
            }
        });

        return $preview;
    }

    /**
     * Compare one workbook cell against the stored schedule for that doctor-day.
     *
     * @param  Collection<int, Appointment>  $appointments
     * @return Row
     */
    private function row(Doctor $doctor, string $date, ?string $value, ?DoctorSchedule $existing, Collection $appointments): array
    {
        $base = [
            'doctor_id' => $doctor->id,
            'doctor' => $doctor->name,
            'department' => $doctor->department->name,
            'date' => $date,
            'current' => $existing !== null ? $this->describe($existing->status, $existing->windows ?? []) : '',
            'message' => null,
            'status' => null,
            'windows' => [],
        ];

        try {
            $incoming = $this->parse($value);
        } catch (InvalidArgumentException $e) {
            return [...$base, 'incoming' => (string) $value, 'change' => self::CHANGE_ERROR, 'message' => $e->getMessage()];
        }

        $base['incoming'] = $this->describe($incoming['status'], $incoming['windows']);
        $base['status'] = $incoming['status']->value;
        $base['windows'] = $incoming['windows'];

        if ($existing !== null && $this->matches($existing, $incoming)) {
            return [...$base, 'change' => self::CHANGE_UNCHANGED];
        }

        $orphaned = $this->appointmentsInvalidatedBy($doctor, $appointments, $existing, $incoming);

        if ($orphaned !== []) {
            return [...$base, 'change' => self::CHANGE_CONFLICT, 'message' => 'Would leave '.implode(', ', $orphaned).' outside a bookable window. Cancel or move the appointment first.'];
        }

        return [...$base, 'change' => $existing === null ? self::CHANGE_NEW : self::CHANGE_MODIFIED];
    }

    /**
     * A blank cell means the hospital scheduled nothing for that doctor-day, which
     * closes it for booking while staying distinct from an explicit `No clinic`.
     *
     * @return array{status: DoctorScheduleStatus, windows: list<array{start: string, end: string, code: string|null, bookable: bool, note: string|null}>}
     */
    private function parse(?string $value): array
    {
        return ScheduleHours::parse($value) ?? ['status' => DoctorScheduleStatus::NotScheduled, 'windows' => []];
    }

    /**
     * Appointments that are bookable under the stored schedule but would not be
     * under the incoming one. An import must never strand a booked patient.
     *
     * @param  Collection<int, Appointment>  $appointments
     * @param  array{status: DoctorScheduleStatus, windows: list<array<string, mixed>>}  $incoming
     * @return list<string>
     */
    private function appointmentsInvalidatedBy(Doctor $doctor, Collection $appointments, ?DoctorSchedule $existing, array $incoming): array
    {
        if ($appointments->isEmpty()) {
            return [];
        }

        $minutes = $doctor->department->slot_minutes;
        $orphaned = [];

        foreach ($appointments as $appointment) {
            $time = Carbon::parse($appointment->time)->format('H:i');

            // A row that does not exist yet means the appointment was taken under
            // the weekly template, which the import is not entitled to invalidate.
            $currentlyValid = $existing === null
                || $this->covers($existing->status, $existing->windows ?? [], $time, $minutes);

            if ($currentlyValid && ! $this->covers($incoming['status'], $incoming['windows'], $time, $minutes)) {
                $orphaned[] = $time.' '.$appointment->first_name.' '.$appointment->last_name;
            }
        }

        return $orphaned;
    }

    /**
     * Whether a status + windows pair leaves a whole appointment inside one open
     * window.
     *
     * @param  list<array<string, mixed>>  $windows
     */
    private function covers(DoctorScheduleStatus $status, array $windows, string $time, int $minutes): bool
    {
        if (! $status->allowsBooking()) {
            return false;
        }

        $end = Carbon::createFromFormat('H:i', $time)->addMinutes($minutes)->format('H:i');

        foreach ($windows as $window) {
            if (($window['bookable'] ?? true) && $time >= $window['start'] && $end <= $window['end']) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array{status: DoctorScheduleStatus, windows: list<array<string, mixed>>}  $incoming
     */
    private function matches(DoctorSchedule $existing, array $incoming): bool
    {
        return $existing->status === $incoming['status']
            && $this->canonical($existing->windows ?? []) === $this->canonical($incoming['windows']);
    }

    /**
     * Normalise windows for comparison so rows stored before codes existed do not
     * all read as modified.
     *
     * @param  list<array<string, mixed>>  $windows
     * @return list<array<string, mixed>>
     */
    private function canonical(array $windows): array
    {
        return array_map(fn (array $window): array => [
            'start' => $window['start'],
            'end' => $window['end'],
            'code' => $window['code'] ?? null,
            'bookable' => $window['bookable'] ?? true,
            'note' => $window['note'] ?? null,
        ], $windows);
    }

    /**
     * Reception-readable rendering of a status + windows pair.
     *
     * @param  list<array<string, mixed>>  $windows
     */
    private function describe(DoctorScheduleStatus $status, array $windows): string
    {
        if ($status !== DoctorScheduleStatus::Work) {
            return $status->label();
        }

        return ScheduleHours::format(new DoctorSchedule(['status' => $status, 'windows' => $windows]));
    }

    /**
     * @param  list<Row>  $rows
     * @return array<string, int>
     */
    private function summarise(array $rows, int $doctors): array
    {
        $counts = array_count_values(array_column($rows, 'change'));

        return [
            'doctors' => $doctors,
            'days' => count(array_unique(array_column($rows, 'date'))),
            'created' => $counts[self::CHANGE_NEW] ?? 0,
            'updated' => $counts[self::CHANGE_MODIFIED] ?? 0,
            'unchanged' => $counts[self::CHANGE_UNCHANGED] ?? 0,
            'conflicts' => $counts[self::CHANGE_CONFLICT] ?? 0,
            'errors' => $counts[self::CHANGE_ERROR] ?? 0,
        ];
    }

    /**
     * @return EloquentCollection<int, Doctor>
     */
    private function mappedDoctors(): EloquentCollection
    {
        return Doctor::query()
            ->whereHas('scheduleColumn')
            ->with(['scheduleColumn', 'department:id,name,slot_minutes'])
            ->get();
    }

    /**
     * @param  array<int, int|string>  $doctorIds
     * @return array<int, array<string, DoctorSchedule>>
     */
    private function existingSchedules(array $doctorIds, Carbon $month): array
    {
        return DoctorSchedule::whereIn('doctor_id', $doctorIds)
            ->whereBetween('date', [$month->copy()->startOfMonth()->toDateString(), $month->copy()->endOfMonth()->toDateString()])
            ->get()
            ->groupBy('doctor_id')
            ->map(fn (Collection $rows): array => $rows->keyBy(fn (DoctorSchedule $s): string => $s->date->toDateString())->all())
            ->all();
    }

    /**
     * @param  array<int, int|string>  $doctorIds
     * @return array<int, array<string, Collection<int, Appointment>>>
     */
    private function activeAppointments(array $doctorIds, Carbon $month): array
    {
        return Appointment::whereIn('doctor_id', $doctorIds)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('date', [$month->copy()->startOfMonth()->toDateString(), $month->copy()->endOfMonth()->toDateString()])
            ->get()
            ->groupBy('doctor_id')
            ->map(fn (Collection $rows) => $rows->groupBy(fn (Appointment $a): string => $a->date->toDateString())->all())
            ->all();
    }
}
