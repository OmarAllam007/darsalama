<?php

namespace App\Enums;

enum DoctorScheduleStatus: string
{
    case Work = 'work';
    case NoClinic = 'no_clinic';
    case Off = 'off';
    case Vacation = 'vacation';

    /**
     * The hospital left the cell blank. Distinct from `NoClinic`, which the sheet
     * states explicitly — reception should be able to tell "closed" from "unstated".
     */
    case NotScheduled = 'not_scheduled';

    /**
     * Whether this status can ever produce bookable slots. Only working days can;
     * individual windows may still be closed (OR) even when the status is Work.
     */
    public function allowsBooking(): bool
    {
        return $this === self::Work;
    }

    /**
     * Reception-facing wording for the calendar and the import preview.
     */
    public function label(): string
    {
        return match ($this) {
            self::Work => 'Working',
            self::NoClinic => 'No clinic',
            self::Off => 'Off',
            self::Vacation => 'Vacation',
            self::NotScheduled => 'Not scheduled',
        };
    }
}
