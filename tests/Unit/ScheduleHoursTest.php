<?php

use App\Enums\DoctorScheduleStatus;
use App\Models\DoctorSchedule;
use App\Support\ScheduleHours;

it('parses every schedule cell the sheet uses', function (string $cell, DoctorScheduleStatus $status, array $windows) {
    expect(ScheduleHours::parse($cell))->toEqual(['status' => $status, 'windows' => $windows]);
})->with([
    'two shifts' => ['8:00-12:00; 16:00-20:00', DoctorScheduleStatus::Work, [
        ['start' => '08:00', 'end' => '12:00', 'bookable' => true],
        ['start' => '16:00', 'end' => '20:00', 'bookable' => true],
    ]],
    'single shift' => ['8:00-16:00', DoctorScheduleStatus::Work, [
        ['start' => '08:00', 'end' => '16:00', 'bookable' => true],
    ]],
    'off' => ['OFF', DoctorScheduleStatus::Off, []],
    'vacation' => ['V', DoctorScheduleStatus::Vacation, []],
    'no clinic' => ['No clinic', DoctorScheduleStatus::NoClinic, []],
    'operating room' => ['8:00-15:00 (OR)', DoctorScheduleStatus::Work, [
        ['start' => '08:00', 'end' => '15:00', 'bookable' => false],
    ]],
    'half day with afternoon OR' => ['8:00-12:00; 16:00-20:00 (OR)', DoctorScheduleStatus::Work, [
        ['start' => '08:00', 'end' => '12:00', 'bookable' => true],
        ['start' => '16:00', 'end' => '20:00', 'bookable' => false],
    ]],
]);

it('returns null for a blank cell', function () {
    expect(ScheduleHours::parse('  '))->toBeNull();
});

it('throws on an unrecognised cell', function () {
    ScheduleHours::parse('she left the clinic');
})->throws(InvalidArgumentException::class);

it('round-trips parse and format', function (string $cell) {
    $parsed = ScheduleHours::parse($cell);
    $schedule = new DoctorSchedule(['status' => $parsed['status'], 'windows' => $parsed['windows']]);

    expect(ScheduleHours::format($schedule))->toBe($cell);
})->with([
    '8:00-12:00; 16:00-20:00',
    '8:00-16:00',
    '8:00-15:00 (OR)',
    '8:00-12:00; 16:00-20:00 (OR)',
    'OFF',
    'V',
    'NO CLINIC',
]);
