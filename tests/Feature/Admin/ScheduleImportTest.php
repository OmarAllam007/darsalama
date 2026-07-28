<?php

use App\Enums\DoctorScheduleStatus;
use App\Models\Appointment;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\ScheduleImport;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Testing\TestResponse;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-06-15 09:00', config('booking.timezone')));
    $this->actingAs(User::factory()->create());
});

afterEach(function () {
    Carbon::setTestNow();
});

/**
 * A doctor mapped to a fixed workbook column.
 */
function mappedDoctor(string $column, int $slotMinutes = 15): Doctor
{
    $doctor = Doctor::factory()->create([
        'department_id' => Department::factory()->create(['slot_minutes' => $slotMinutes]),
    ]);

    $doctor->scheduleColumn()->create(['column' => $column]);

    return $doctor;
}

/**
 * Build a workbook shaped like the hospital's: a title row, a `Days | Date |
 * doctor…` header, then one row per day of the month.
 *
 * @param  array<string, array<int, string>>  $cells  column letter => [day => value]
 */
function workbook(array $cells, int $days = 31): UploadedFile
{
    $spreadsheet = new Spreadsheet;
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('July 2026');

    $sheet->setCellValue('A5', 'General Surgery - July 2026');
    $sheet->setCellValue('A6', 'Days')->setCellValue('B6', 'Date');
    $sheet->setCellValue('G6', 'Days')->setCellValue('H6', 'Date');

    for ($day = 1; $day <= $days; $day++) {
        $row = $day + 6;
        $sheet->setCellValue("B{$row}", $day);
        $sheet->setCellValue("H{$row}", $day);

        foreach ($cells as $column => $values) {
            if (isset($values[$day])) {
                $sheet->setCellValue("{$column}{$row}", $values[$day]);
            }
        }
    }

    $path = tempnam(sys_get_temp_dir(), 'opd').'.xlsx';
    (new Xlsx($spreadsheet))->save($path);

    return new UploadedFile($path, 'July 2026 - OPD Schedule.xlsx', null, null, true);
}

function preview(UploadedFile $file, string $month = '2026-07'): TestResponse
{
    return test()->post(route('admin.schedule-imports.preview'), ['month' => $month, 'file' => $file]);
}

test('uploading previews the changes without writing anything', function () {
    $doctor = mappedDoctor('C');

    $response = preview(workbook(['C' => [1 => '8:00-12:00; 16:00-20:00']]));

    $response->assertOk();
    expect(DoctorSchedule::count())->toBe(0);

    // Every day of the month is accounted for: the one the sheet fills in, and
    // the thirty blanks that close the day.
    $preview = $response->viewData('page')['props']['preview'];
    expect($preview['summary']['created'])->toBe(31)
        ->and($preview['summary']['doctors'])->toBe(1)
        ->and($preview['summary']['days'])->toBe(31);

    $row = collect($preview['rows'])->firstWhere('date', '2026-07-01');
    expect($row['change'])->toBe('new')
        ->and($row['incoming'])->toBe('8:00-12:00; 16:00-20:00')
        ->and($row['doctor'])->toBe($doctor->name);
});

test('confirming applies the schedule and logs the import', function () {
    $doctor = mappedDoctor('C');

    $token = preview(workbook([
        'C' => [1 => '8:00-12:00 (OPD) 12:00-16:00 (LTC)', 2 => 'OFF'],
    ]))->viewData('page')['props']['preview']['token'];

    $this->post(route('admin.schedule-imports.store'), ['token' => $token])
        ->assertRedirect(route('admin.schedule-imports.index'));

    $first = DoctorSchedule::where('doctor_id', $doctor->id)->whereDate('date', '2026-07-01')->sole();

    expect($first->status)->toBe(DoctorScheduleStatus::Work)
        ->and($first->windows)->toBe([
            ['start' => '08:00', 'end' => '12:00', 'code' => 'OPD', 'bookable' => true, 'note' => null],
            ['start' => '12:00', 'end' => '16:00', 'code' => 'LTC', 'bookable' => false, 'note' => null],
        ]);

    expect(DoctorSchedule::where('doctor_id', $doctor->id)->whereDate('date', '2026-07-02')->sole()->status)
        ->toBe(DoctorScheduleStatus::Off);

    $import = ScheduleImport::sole();
    expect($import->summary['created'])->toBe(31)
        ->and($import->original_filename)->toBe('July 2026 - OPD Schedule.xlsx')
        ->and($import->imported_by)->not->toBeNull();
});

test('a blank cell closes the day rather than leaving it bookable', function () {
    $doctor = mappedDoctor('C');

    $token = preview(workbook(['C' => [1 => '8:00-16:00']]))
        ->viewData('page')['props']['preview']['token'];

    $this->post(route('admin.schedule-imports.store'), ['token' => $token]);

    $blank = DoctorSchedule::where('doctor_id', $doctor->id)->whereDate('date', '2026-07-02')->sole();

    expect($blank->status)->toBe(DoctorScheduleStatus::NotScheduled)
        ->and($blank->windows)->toBe([])
        ->and($blank->status->allowsBooking())->toBeFalse();
});

test('importing the same workbook twice changes nothing the second time', function () {
    mappedDoctor('C');
    $cells = ['C' => [1 => '8:00-12:00; 16:00-20:00', 2 => 'V']];

    $token = preview(workbook($cells))->viewData('page')['props']['preview']['token'];
    $this->post(route('admin.schedule-imports.store'), ['token' => $token]);

    $before = DoctorSchedule::orderBy('id')->pluck('updated_at', 'id');

    $summary = preview(workbook($cells))->viewData('page')['props']['preview']['summary'];

    expect($summary['created'])->toBe(0)
        ->and($summary['updated'])->toBe(0)
        ->and($summary['unchanged'])->toBe(31)
        ->and(DoctorSchedule::orderBy('id')->pluck('updated_at', 'id'))->toEqual($before);
});

test('a cell that cannot be parsed is reported and skipped', function () {
    mappedDoctor('C');

    $preview = preview(workbook(['C' => [1 => 'She is no longer with us.']]))
        ->viewData('page')['props']['preview'];

    $row = collect($preview['rows'])->firstWhere('date', '2026-07-01');

    expect($preview['summary']['errors'])->toBe(1)
        ->and($row['change'])->toBe('error')
        ->and($row['message'])->toContain('Unrecognised schedule cell');

    $this->post(route('admin.schedule-imports.store'), ['token' => $preview['token']]);

    expect(DoctorSchedule::whereDate('date', '2026-07-01')->exists())->toBeFalse();
});

test('an import never strands an already booked appointment', function () {
    $doctor = mappedDoctor('C');

    $doctor->schedules()->create([
        'date' => '2026-07-01',
        'status' => DoctorScheduleStatus::Work,
        'windows' => [['start' => '08:00', 'end' => '12:00', 'code' => null, 'bookable' => true, 'note' => null]],
    ]);

    Appointment::factory()->create([
        'doctor_id' => $doctor->id,
        'date' => '2026-07-01',
        'time' => '09:00',
    ]);

    // The workbook would close the whole morning for surgery.
    $preview = preview(workbook(['C' => [1 => '8:00-12:00 (OR)']]))
        ->viewData('page')['props']['preview'];

    $row = collect($preview['rows'])->firstWhere('date', '2026-07-01');

    expect($preview['summary']['conflicts'])->toBe(1)
        ->and($row['change'])->toBe('conflict')
        ->and($row['message'])->toContain('09:00');

    $this->post(route('admin.schedule-imports.store'), ['token' => $preview['token']]);

    expect($doctor->schedules()->whereDate('date', '2026-07-01')->sole()->windows[0]['bookable'])
        ->toBeTrue();
});

test('a change that keeps the appointment bookable still applies', function () {
    $doctor = mappedDoctor('C');

    $doctor->schedules()->create([
        'date' => '2026-07-01',
        'status' => DoctorScheduleStatus::Work,
        'windows' => [['start' => '08:00', 'end' => '12:00', 'code' => null, 'bookable' => true, 'note' => null]],
    ]);

    Appointment::factory()->create([
        'doctor_id' => $doctor->id,
        'date' => '2026-07-01',
        'time' => '09:00',
    ]);

    $token = preview(workbook(['C' => [1 => '8:00-12:00; 16:00-20:00']]))
        ->viewData('page')['props']['preview']['token'];

    $this->post(route('admin.schedule-imports.store'), ['token' => $token]);

    expect($doctor->schedules()->whereDate('date', '2026-07-01')->sole()->windows)->toHaveCount(2);
});

test('doctors without a column mapping and months outside the selection are untouched', function () {
    $mapped = mappedDoctor('C');
    $unmapped = Doctor::factory()->create();

    $august = $mapped->schedules()->create([
        'date' => '2026-08-01',
        'status' => DoctorScheduleStatus::Off,
        'windows' => [],
    ]);

    $token = preview(workbook(['C' => [1 => '8:00-16:00'], 'D' => [1 => 'OFF']]))
        ->viewData('page')['props']['preview']['token'];

    $this->post(route('admin.schedule-imports.store'), ['token' => $token]);

    expect($unmapped->schedules()->count())->toBe(0)
        ->and($august->refresh()->status)->toBe(DoctorScheduleStatus::Off)
        ->and($mapped->schedules()->whereBetween('date', ['2026-07-01', '2026-07-31'])->count())->toBe(31);
});

test('the doctor name printed in the workbook is irrelevant', function () {
    $doctor = mappedDoctor('C');
    $doctor->update(['name' => 'Dr. Abdullah Al-Taha']);

    $file = workbook(['C' => [1 => '8:00-16:00']]);
    $token = preview($file)->viewData('page')['props']['preview']['token'];

    $this->post(route('admin.schedule-imports.store'), ['token' => $token]);

    expect($doctor->schedules()->whereDate('date', '2026-07-01')->exists())->toBeTrue();
});

test('a file that is not the schedule template is rejected before any preview', function () {
    mappedDoctor('C');

    $spreadsheet = new Spreadsheet;
    $spreadsheet->getActiveSheet()->setCellValue('A1', 'Invoice');
    $path = tempnam(sys_get_temp_dir(), 'bad').'.xlsx';
    (new Xlsx($spreadsheet))->save($path);

    preview(new UploadedFile($path, 'invoice.xlsx', null, null, true))
        ->assertSessionHasErrors('file');
});

test('a day number that the month does not have is reported', function () {
    mappedDoctor('C');

    $preview = preview(workbook(['C' => [1 => '8:00-16:00']], days: 31), month: '2026-02')
        ->viewData('page')['props']['preview'];

    expect($preview['warnings'])->not->toBeEmpty()
        ->and($preview['summary']['days'])->toBe(28);
});

test('the column mapping page saves and rejects duplicate columns', function () {
    $first = Doctor::factory()->create(['is_active' => true]);
    $second = Doctor::factory()->create(['is_active' => true]);

    $this->put(route('admin.schedule-columns.update'), [
        'columns' => [$first->id => 'c', $second->id => 'BZ'],
    ])->assertRedirect();

    expect($first->scheduleColumn->refresh()->column)->toBe('C')
        ->and($second->scheduleColumn->column)->toBe('BZ');

    $this->put(route('admin.schedule-columns.update'), [
        'columns' => [$first->id => 'C', $second->id => 'C'],
    ])->assertSessionHasErrors('columns');
});
