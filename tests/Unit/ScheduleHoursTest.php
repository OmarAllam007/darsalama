<?php

use App\Enums\DoctorScheduleStatus;
use App\Models\DoctorSchedule;
use App\Support\ScheduleHours;

/**
 * @return array{start: string, end: string, code: string|null, bookable: bool, note: string|null}
 */
function window(string $start, string $end, ?string $code, bool $bookable, ?string $note = null): array
{
    return ['start' => $start, 'end' => $end, 'code' => $code, 'bookable' => $bookable, 'note' => $note];
}

it('parses every schedule cell the hospital sheet uses', function (string $cell, DoctorScheduleStatus $status, array $windows) {
    expect(ScheduleHours::parse($cell))->toEqual(['status' => $status, 'windows' => $windows]);
})->with([
    'plain range' => ['8:00-12:00', DoctorScheduleStatus::Work, [
        window('08:00', '12:00', null, true),
    ]],
    'two shifts' => ['8:00-12:00; 16:00-20:00', DoctorScheduleStatus::Work, [
        window('08:00', '12:00', null, true),
        window('16:00', '20:00', null, true),
    ]],
    'two shifts, space before separator' => ['8:00-12:00 ; 16:00-20:00', DoctorScheduleStatus::Work, [
        window('08:00', '12:00', null, true),
        window('16:00', '20:00', null, true),
    ]],
    'two shifts, no space after separator' => ['10:00-14:00;18:00-22:00', DoctorScheduleStatus::Work, [
        window('10:00', '14:00', null, true),
        window('18:00', '22:00', null, true),
    ]],
    'OPD is bookable' => ['8:00-12:00 (OPD)', DoctorScheduleStatus::Work, [
        window('08:00', '12:00', 'OPD', true),
    ]],
    'bracketed ONLY is bookable' => ['8:00-12:00 (ONLY)', DoctorScheduleStatus::Work, [
        window('08:00', '12:00', 'ONLY', true),
    ]],
    'bare only is bookable' => ['16:00-20:00 only', DoctorScheduleStatus::Work, [
        window('16:00', '20:00', 'ONLY', true),
    ]],
    'LTC is not bookable' => ['8:00-12:00 (LTC)', DoctorScheduleStatus::Work, [
        window('08:00', '12:00', 'LTC', false),
    ]],
    'OR is not bookable' => ['8:00-15:00 (OR)', DoctorScheduleStatus::Work, [
        window('08:00', '15:00', 'OR', false),
    ]],
    'O.R normalises to OR' => ['8:00-16:00 (O.R)', DoctorScheduleStatus::Work, [
        window('08:00', '16:00', 'OR', false),
    ]],
    'two ranges without a separator' => ['8:00-12:00 (OPD) 12:00-16:00 (LTC)', DoctorScheduleStatus::Work, [
        window('08:00', '12:00', 'OPD', true),
        window('12:00', '16:00', 'LTC', false),
    ]],
    'trailing note is kept' => ['8:00-16:00 (OR) w/Neurosurgeon', DoctorScheduleStatus::Work, [
        window('08:00', '16:00', 'OR', false, 'w/Neurosurgeon'),
    ]],
    'half day with afternoon OR' => ['8:00-12:00; 16:00-20:00 (OR)', DoctorScheduleStatus::Work, [
        window('08:00', '12:00', null, true),
        window('16:00', '20:00', 'OR', false),
    ]],
    'off' => ['OFF', DoctorScheduleStatus::Off, []],
    'vacation' => ['V', DoctorScheduleStatus::Vacation, []],
    'no clinic' => ['No clinic', DoctorScheduleStatus::NoClinic, []],
    'no clinic on vacation' => ['No clinic (V)', DoctorScheduleStatus::NoClinic, []],
    'not applicable' => ['N.A', DoctorScheduleStatus::NoClinic, []],
]);

it('returns null for a blank cell', function () {
    expect(ScheduleHours::parse('  '))->toBeNull();
});

it('rejects cells it cannot understand', function (string $cell) {
    ScheduleHours::parse($cell);
})->with([
    'free text' => ['She is no longer with us.'],
    'half-written times' => ['8 morning maybe 12'],
    'range that ends before it starts' => ['16:00-08:00'],
    'range with no length' => ['12:00-12:00'],
    'overlapping ranges' => ['8:00-13:00; 12:00-16:00'],
    'duplicate ranges' => ['8:00-12:00; 8:00-12:00'],
])->throws(InvalidArgumentException::class);

it('round-trips parse and format', function (string $cell) {
    $parsed = ScheduleHours::parse($cell);
    $schedule = new DoctorSchedule(['status' => $parsed['status'], 'windows' => $parsed['windows']]);

    expect(ScheduleHours::format($schedule))->toBe($cell);
})->with([
    '8:00-12:00; 16:00-20:00',
    '8:00-16:00',
    '8:00-15:00 (OR)',
    '8:00-12:00 (OPD); 12:00-16:00 (LTC)',
    '8:00-16:00 (OR) w/Neurosurgeon',
    'OFF',
    'V',
    'NO CLINIC',
]);

it('still formats windows stored before codes existed', function () {
    $schedule = new DoctorSchedule([
        'status' => DoctorScheduleStatus::Work,
        'windows' => [
            ['start' => '08:00', 'end' => '12:00', 'bookable' => true],
            ['start' => '16:00', 'end' => '20:00', 'bookable' => false],
        ],
    ]);

    expect(ScheduleHours::format($schedule))->toBe('8:00-12:00; 16:00-20:00 (OR)');
});
