<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Booking Timezone
    |--------------------------------------------------------------------------
    |
    | The clinic's local timezone. All slot times and booking cut-off logic are
    | evaluated against this timezone rather than the application timezone.
    |
    */

    'timezone' => env('BOOKING_TIMEZONE', 'Asia/Riyadh'),

    /*
    |--------------------------------------------------------------------------
    | Next-day Booking Cut-off Hour
    |--------------------------------------------------------------------------
    |
    | Hour of the day (0-23, clinic local time) after which the following day
    | can no longer be booked, giving reception time to review bookings.
    |
    */

    'next_day_cutoff_hour' => (int) env('BOOKING_NEXT_DAY_CUTOFF_HOUR', 20),

];
