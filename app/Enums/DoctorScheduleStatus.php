<?php

namespace App\Enums;

enum DoctorScheduleStatus: string
{
    case Work = 'work';
    case NoClinic = 'no_clinic';
    case Off = 'off';
    case Vacation = 'vacation';

    /**
     * Whether this status can ever produce bookable slots. Only working days can;
     * individual windows may still be closed (OR) even when the status is Work.
     */
    public function allowsBooking(): bool
    {
        return $this === self::Work;
    }
}
