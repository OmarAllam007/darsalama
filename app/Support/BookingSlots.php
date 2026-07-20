<?php

namespace App\Support;

use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Illuminate\Support\Carbon;

/**
 * Generates the bookable slot start times for a doctor on a given date, honouring
 * the date-specific schedule (OR/OFF/vacation days close booking) and each
 * department's slot length.
 */
class BookingSlots
{
    /**
     * @return array<int, string>
     */
    public function available(Doctor $doctor, string $date, bool $enforceLeadTime = true): array
    {
        if ($enforceLeadTime && $this->isBeforeEarliestPublicDate($date)) {
            return [];
        }

        $timezone = $this->timezone();
        $now = Carbon::now($timezone);

        $booked = $doctor->appointments()
            ->whereDate('date', $date)
            ->pluck('time')
            ->map(fn ($time) => Carbon::parse($time)->format('H:i'))
            ->all();

        $schedule = $doctor->schedules()->whereDate('date', $date)->first();

        $slots = $schedule !== null
            ? $this->fromSchedule($schedule, $doctor, $date, $timezone, $now)
            : $this->fromAvailabilities($doctor, $date, $timezone, $now);

        $slots = array_values(array_diff(array_unique($slots), $booked));
        sort($slots);

        return $slots;
    }

    /**
     * The dates in a month (`Y-m`) a doctor is open for booking — a schedule row
     * that is working with at least one open window, or, where no row exists, a
     * weekday covered by the legacy availability template. Past/cut-off filtering
     * is left to the caller.
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

        $weekdays = $doctor->availabilities()->distinct()->pluck('weekday')->all();

        $days = [];

        for ($day = $start->copy(); $day->lte($end); $day->addDay()) {
            $iso = $day->toDateString();
            $schedule = $schedules->get($iso);

            $open = $schedule !== null
                ? $schedule->status->allowsBooking() && collect($schedule->windows ?? [])->contains(fn (array $w): bool => $w['bookable'] ?? true)
                : in_array($day->dayOfWeekIso - 1, $weekdays, true);

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
    private function fromSchedule(DoctorSchedule $schedule, Doctor $doctor, string $date, string $timezone, Carbon $now): array
    {
        if (! $schedule->status->allowsBooking()) {
            return [];
        }

        $slotMinutes = $doctor->loadMissing('department')->department?->slot_minutes ?? 15;
        $slots = [];

        foreach ($schedule->windows ?? [] as $window) {
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
     * Slots from the legacy weekly availability template (doctors without a
     * date-specific schedule row for the day).
     *
     * @return array<int, string>
     */
    private function fromAvailabilities(Doctor $doctor, string $date, string $timezone, Carbon $now): array
    {
        $weekday = Carbon::parse($date, $timezone)->dayOfWeekIso - 1;
        $slots = [];

        foreach ($doctor->availabilities()->where('weekday', $weekday)->get() as $availability) {
            $slots = array_merge($slots, $this->chunkWindow(
                Carbon::parse($date.' '.$availability->start_time, $timezone),
                Carbon::parse($date.' '.$availability->end_time, $timezone),
                $availability->slot_minutes,
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
        $timezone = $this->timezone();
        $now = Carbon::now($timezone);
        $target = Carbon::parse($date, $timezone)->startOfDay();
        $tomorrow = $now->copy()->addDay()->startOfDay();

        if ($target->lt($tomorrow)) {
            return true;
        }

        return $target->equalTo($tomorrow)
            && $now->hour >= (int) config('booking.next_day_cutoff_hour');
    }

    private function timezone(): string
    {
        return config('booking.timezone');
    }
}
