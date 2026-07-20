<?php

use App\Enums\DoctorScheduleStatus;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\User;
use App\Support\BookingSlots;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-07-15 09:00', config('booking.timezone')));
});

afterEach(function () {
    Carbon::setTestNow();
});

function scheduledDoctor(int $slotMinutes = 15): Doctor
{
    $department = Department::factory()->create(['slot_minutes' => $slotMinutes]);

    return Doctor::factory()->create(['department_id' => $department->id]);
}

function slotsFor(Doctor $doctor, string $date): array
{
    return app(BookingSlots::class)->available($doctor, $date);
}

test('a working schedule generates slots at the department duration', function () {
    $doctor = scheduledDoctor(slotMinutes: 40);
    $date = Carbon::tomorrow()->toDateString();

    $doctor->schedules()->create([
        'date' => $date,
        'status' => DoctorScheduleStatus::Work,
        'windows' => [['start' => '08:00', 'end' => '10:00', 'bookable' => true]],
    ]);

    expect(slotsFor($doctor, $date))
        ->toBe(['08:00', '08:40', '09:20']);
});

test('other departments default to 15 minute slots', function () {
    $doctor = scheduledDoctor(slotMinutes: 15);
    $date = Carbon::tomorrow()->toDateString();

    $doctor->schedules()->create([
        'date' => $date,
        'status' => DoctorScheduleStatus::Work,
        'windows' => [['start' => '08:00', 'end' => '09:00', 'bookable' => true]],
    ]);

    expect(slotsFor($doctor, $date))
        ->toBe(['08:00', '08:15', '08:30', '08:45']);
});

test('OR windows are closed for booking', function () {
    $doctor = scheduledDoctor();
    $date = Carbon::tomorrow()->toDateString();

    $doctor->schedules()->create([
        'date' => $date,
        'status' => DoctorScheduleStatus::Work,
        'windows' => [['start' => '08:00', 'end' => '16:00', 'bookable' => false]],
    ]);

    expect(slotsFor($doctor, $date))->toBeEmpty();
});

test('a half day exposes only the open window', function () {
    $doctor = scheduledDoctor();
    $date = Carbon::tomorrow()->toDateString();

    $doctor->schedules()->create([
        'date' => $date,
        'status' => DoctorScheduleStatus::Work,
        'windows' => [
            ['start' => '08:00', 'end' => '12:00', 'bookable' => true],
            ['start' => '16:00', 'end' => '20:00', 'bookable' => false],
        ],
    ]);

    $slots = slotsFor($doctor, $date);

    expect($slots)->toContain('08:00')
        ->and($slots)->not->toContain('16:00');
});

test('off, vacation and no-clinic days have no slots', function (DoctorScheduleStatus $status) {
    $doctor = scheduledDoctor();
    $date = Carbon::tomorrow()->toDateString();

    $doctor->schedules()->create(['date' => $date, 'status' => $status, 'windows' => []]);

    expect(slotsFor($doctor, $date))->toBeEmpty();
})->with([
    DoctorScheduleStatus::Off,
    DoctorScheduleStatus::Vacation,
    DoctorScheduleStatus::NoClinic,
]);

test('days without a schedule fall back to the weekly availability template', function () {
    $doctor = scheduledDoctor();
    $doctor->availabilities()->create([
        'weekday' => Carbon::tomorrow()->dayOfWeekIso - 1,
        'start_time' => '09:00',
        'end_time' => '10:00',
        'slot_minutes' => 30,
    ]);

    expect(slotsFor($doctor, Carbon::tomorrow()->toDateString()))
        ->toBe(['09:00', '09:30']);
});

test('the days endpoint lists only schedule-open dates', function () {
    $doctor = scheduledDoctor();

    $doctor->schedules()->createMany([
        ['date' => '2026-07-06', 'status' => DoctorScheduleStatus::Work, 'windows' => [['start' => '08:00', 'end' => '12:00', 'bookable' => true]]],
        ['date' => '2026-07-07', 'status' => DoctorScheduleStatus::Off, 'windows' => []],
        ['date' => '2026-07-08', 'status' => DoctorScheduleStatus::Work, 'windows' => [['start' => '08:00', 'end' => '16:00', 'bookable' => false]]],
    ]);

    $days = $this->getJson(route('booking.days', $doctor).'?month=2026-07')->json('days');

    expect($days)->toContain('2026-07-06')
        ->and($days)->not->toContain('2026-07-07')
        ->and($days)->not->toContain('2026-07-08');
});

test('the days endpoint falls back to the weekly template without schedule rows', function () {
    $doctor = scheduledDoctor();
    $doctor->availabilities()->create([
        'weekday' => 0, // Monday
        'start_time' => '09:00',
        'end_time' => '12:00',
        'slot_minutes' => 30,
    ]);

    $days = $this->getJson(route('booking.days', $doctor).'?month=2026-07')->json('days');

    expect($days)->toContain('2026-07-06')
        ->and($days)->toContain('2026-07-13')
        ->and($days)->not->toContain('2026-07-07');
});

test('the public site cannot book today', function () {
    $doctor = scheduledDoctor();
    $today = Carbon::today(config('booking.timezone'))->toDateString();

    $doctor->schedules()->create([
        'date' => $today,
        'status' => DoctorScheduleStatus::Work,
        'windows' => [['start' => '08:00', 'end' => '20:00', 'bookable' => true]],
    ]);

    // The public slots endpoint rejects today outright.
    $this->getJson(route('booking.slots', $doctor).'?date='.$today)->assertStatus(422);

    $this->from(route('booking.show', $doctor))->post(route('booking.store', $doctor), [
        'date' => $today,
        'time' => '10:00',
        'first_name' => 'Sara',
        'last_name' => 'Ali',
    ])->assertSessionHasErrors('date');

    expect($doctor->appointments()->count())->toBe(0);
});

test('reception can still book today', function () {
    $this->actingAs(User::factory()->create());
    $doctor = scheduledDoctor();
    $today = Carbon::today(config('booking.timezone'))->toDateString();

    $doctor->schedules()->create([
        'date' => $today,
        'status' => DoctorScheduleStatus::Work,
        'windows' => [['start' => '08:00', 'end' => '20:00', 'bookable' => true]],
    ]);

    $slots = $this->getJson(route('admin.appointments.slots', $doctor).'?date='.$today)->json('slots');

    expect($slots)->not->toBeEmpty();

    $this->post(route('admin.appointments.store'), [
        'doctor_id' => $doctor->id,
        'date' => $today,
        'time' => $slots[0],
        'first_name' => 'Sara',
        'last_name' => 'Ali',
    ])->assertRedirect(route('admin.appointments.index'));

    expect($doctor->appointments()->count())->toBe(1);
});

test('admin can manually book an available slot', function () {
    $this->actingAs(User::factory()->create());
    $doctor = scheduledDoctor();
    $date = Carbon::tomorrow()->toDateString();

    $doctor->schedules()->create([
        'date' => $date,
        'status' => DoctorScheduleStatus::Work,
        'windows' => [['start' => '08:00', 'end' => '09:00', 'bookable' => true]],
    ]);

    $this->post(route('admin.appointments.store'), [
        'doctor_id' => $doctor->id,
        'date' => $date,
        'time' => '08:15',
        'first_name' => 'Sara',
        'last_name' => 'Ali',
    ])->assertRedirect(route('admin.appointments.index'));

    expect($doctor->appointments()->count())->toBe(1);
});

test('admin manual booking rejects a closed slot', function () {
    $this->actingAs(User::factory()->create());
    $doctor = scheduledDoctor();
    $date = Carbon::tomorrow()->toDateString();

    $doctor->schedules()->create([
        'date' => $date,
        'status' => DoctorScheduleStatus::Off,
        'windows' => [],
    ]);

    $this->from(route('admin.appointments.create'))->post(route('admin.appointments.store'), [
        'doctor_id' => $doctor->id,
        'date' => $date,
        'time' => '08:15',
        'first_name' => 'Sara',
        'last_name' => 'Ali',
    ])->assertSessionHasErrors('time');

    expect($doctor->appointments()->count())->toBe(0);
});

test('the schedule exports as an xlsx download', function () {
    $this->actingAs(User::factory()->create());
    scheduledDoctor();

    $response = $this->get(route('admin.doctor-schedules.export', ['month' => '2026-07']));

    $response->assertOk();
    expect($response->headers->get('content-type'))
        ->toContain('spreadsheetml');
});

test('importing a workbook upserts schedule rows and reports unknown codes', function () {
    $this->actingAs(User::factory()->create());
    $doctor = scheduledDoctor();

    $path = tempnam(sys_get_temp_dir(), 'sched').'.xlsx';
    $spreadsheet = new Spreadsheet;
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('General Surgery');
    $sheet->setCellValue('A1', 'Date')->setCellValue('B1', 'Day')
        ->setCellValue('C1', $doctor->name)->setCellValue('D1', 'Ghost');
    $sheet->setCellValue('A2', '2026-07');
    $sheet->setCellValueExplicit('C2', (string) $doctor->code, DataType::TYPE_STRING);
    $sheet->setCellValueExplicit('D2', 'DOC-9999', DataType::TYPE_STRING);
    $sheet->setCellValueExplicit('A3', '2026-07-20', DataType::TYPE_STRING);
    $sheet->setCellValue('B3', 'Mon')
        ->setCellValue('C3', '8:00-12:00; 16:00-20:00')
        ->setCellValue('D3', 'OFF');
    (new Xlsx($spreadsheet))->save($path);

    $response = $this->post(route('admin.doctor-schedules.import'), [
        'file' => new UploadedFile($path, 'schedule.xlsx', null, null, true),
    ]);

    $response->assertSessionHas('import');

    $schedule = DoctorSchedule::where('doctor_id', $doctor->id)->whereDate('date', '2026-07-20')->sole();
    expect($schedule->windows)->toHaveCount(2)
        ->and($schedule->status)->toBe(DoctorScheduleStatus::Work)
        ->and(session('import')['errors'])->not->toBeEmpty();
});
