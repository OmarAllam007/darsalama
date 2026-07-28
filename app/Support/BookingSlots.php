<?php

namespace App\Support;

use App\Enums\DoctorScheduleStatus;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Generates the bookable slot start times for a doctor on a given date.
 *
 * Availability comes from the imported schedule and nothing else: a doctor with
 * no `doctor_schedules` row for a date is not bookable on it. The slot length is
 * the doctor's department's (`departments.slot_minutes`).
 */
class BookingSlots
{
    /**
     * Whether the doctor has any future schedule that can support online booking.
     */
    public function hasFutureAvailability(Doctor $doctor): bool
    {
        $earliestDate = $this->earliestPublicDate();

        return $doctor->schedules()
            ->whereDate('date', '>=', $earliestDate->toDateString())
            ->where('status', DoctorScheduleStatus::Work->value)
            ->get(['windows'])
            ->contains(
                fn (DoctorSchedule $schedule): bool => collect($schedule->windows)
                    ->contains(fn (array $window): bool => $window['bookable'] ?? true),
            );
    }

    /**
     * @param  Collection<int, Doctor>  $doctors
     * @return array<int, bool>
     */
    public function futureAvailabilityFor(Collection $doctors): array
    {
        $availability = $doctors
            ->mapWithKeys(fn (Doctor $doctor): array => [$doctor->id => false])
            ->all();

        if ($doctors->isEmpty()) {
            return $availability;
        }

        DoctorSchedule::query()
            ->whereIn('doctor_id', $doctors->pluck('id'))
            ->whereDate('date', '>=', $this->earliestPublicDate()->toDateString())
            ->where('status', DoctorScheduleStatus::Work->value)
            ->get(['doctor_id', 'windows'])
            ->each(function (DoctorSchedule $schedule) use (&$availability): void {
                if (collect($schedule->windows)->contains(
                    fn (array $window): bool => $window['bookable'] ?? true,
                )) {
                    $availability[$schedule->doctor_id] = true;
                }
            });

        return $availability;
    }

    /**
     * @return array<int, string>
     */
    public function available(Doctor $doctor, string $date, bool $enforceLeadTime = true): array
    {
        if ($enforceLeadTime && $this->isBeforeEarliestPublicDate($date)) {
            return [];
        }

        $booked = $doctor->appointments()
            ->whereDate('date', $date)
            ->pluck('time')
            ->map(fn ($time) => Carbon::parse($time)->format('H:i'))
            ->all();

        $schedule = $doctor->schedules()->whereDate('date', $date)->first();

        $slots = $schedule !== null
            ? $this->fromSchedule($schedule, $doctor, $date)
            : [];

        $slots = array_values(array_diff(array_unique($slots), $booked));
        sort($slots);

        return $slots;
    }

    /**
     * The dates in a month (`Y-m`) a doctor is open for booking: a schedule row
     * that is working with at least one open window. Past/cut-off filtering is
     * left to the caller.
     *
     * @return array<int, string>
     */
    public function bookableDays(Doctor $doctor, string $month): array
    {
        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $schedules = $doctor->schedules()
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->keyBy(fn (DoctorSchedule $s): string => $s->date->toDateString());

        $days = [];

        for ($day = $start->copy(); $day->lte($end); $day->addDay()) {
            $iso = $day->toDateString();
            $schedule = $schedules->get($iso);

            $open = $schedule !== null
                && $schedule->status->allowsBooking()
                && collect($schedule->windows)->contains(fn (array $w): bool => $w['bookable'] ?? true);

            if ($open) {
                $days[] = $iso;
            }
        }

        return $days;
    }

    /**
     * Slots from a date-specific schedule. Non-working days and OR windows yield
     * nothing; open windows are chunked by the doctor's department slot length.
     *
     * @return array<int, string>
     */
    private function fromSchedule(DoctorSchedule $schedule, Doctor $doctor, string $date): array
    {
        if (! $schedule->status->allowsBooking()) {
            return [];
        }

        return $this->slotsIn($schedule->windows, $date, $doctor->loadMissing('department')->department->slot_minutes);
    }

    /**
     * Slot start times inside a day's open windows, ignoring existing bookings.
     * Shared with the reception calendar so both count slots the same way.
     *
     * @param  array<int, array<string, mixed>>  $windows
     * @return array<int, string>
     */
    public function slotsIn(array $windows, string $date, int $slotMinutes): array
    {
        $timezone = $this->timezone();
        $now = Carbon::now($timezone);
        $slots = [];

        foreach ($windows as $window) {
            if (! ($window['bookable'] ?? true)) {
                continue;
            }

            $slots = array_merge($slots, $this->chunkWindow(
                Carbon::parse($date.' '.$window['start'], $timezone),
                Carbon::parse($date.' '.$window['end'], $timezone),
                $slotMinutes,
                $now,
            ));
        }

        return $slots;
    }

    /**
     * Chunk a single time window into `H:i` slot start times in the future.
     *
     * @return array<int, string>
     */
    private function chunkWindow(Carbon $start, Carbon $end, int $slotMinutes, Carbon $now): array
    {
        $slots = [];
        $cursor = $start->copy();

        while ($cursor->copy()->addMinutes($slotMinutes)->lte($end)) {
            if ($cursor->gt($now)) {
                $slots[] = $cursor->format('H:i');
            }

            $cursor->addMinutes($slotMinutes);
        }

        return $slots;
    }

    /**
     * Public bookings must be at least a day ahead: today and earlier are never
     * bookable, and the following day closes at the configured evening cut-off so
     * reception has time to review the day's bookings.
     */
    private function isBeforeEarliestPublicDate(string $date): bool
    {
        return Carbon::parse($date, $this->timezone())
            ->startOfDay()
            ->lt($this->earliestPublicDate());
    }

    private function earliestPublicDate(): Carbon
    {
        $now = Carbon::now($this->timezone());
        $earliestDate = $now->copy()->addDay()->startOfDay();

        if ($now->hour >= (int) config('booking.next_day_cutoff_hour')) {
            $earliestDate->addDay();
        }

        return $earliestDate;
    }

    private function timezone(): string
    {
        return config('booking.timezone');
    }
}
