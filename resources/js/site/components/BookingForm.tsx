import { Form } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import BookingController from '@/actions/App/Http/Controllers/BookingController';
import CallbackRequestController from '@/actions/App/Http/Controllers/CallbackRequestController';
import InputError from '@/components/input-error';
import { useLanguage } from '@/site/i18n/LanguageContext';
import { saudiPhoneInputProps } from '@/site/saudiPhoneInput';

// Keep in sync with config/booking.php.
const CLINIC_TIMEZONE = 'Asia/Riyadh';
const NEXT_DAY_CUTOFF_HOUR = 20;

// Current date/hour in the clinic timezone, independent of the visitor's browser timezone.
function clinicNow(): { dateIso: string; hour: number } {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: CLINIC_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(new Date());

    const value = (type: string) =>
        parts.find((part) => part.type === type)?.value ?? '';

    return {
        dateIso: `${value('year')}-${value('month')}-${value('day')}`,
        hour: Number(value('hour')),
    };
}

function addDaysIso(iso: string, days: number): string {
    const [year, month, day] = iso.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days));

    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

const DAYS_SHOWN = 7;

export default function BookingForm({ doctorId }: { doctorId: number }) {
    const { t, lang } = useLanguage();
    const locale = lang === 'ar' ? 'ar' : lang === 'ur' ? 'ur' : 'en';
    const clinic = useMemo(() => clinicNow(), []);
    const todayIso = clinic.dateIso;
    const tomorrowIso = useMemo(() => addDaysIso(todayIso, 1), [todayIso]);
    const nextDayClosed = clinic.hour >= NEXT_DAY_CUTOFF_HOUR;
    // The strip always starts on today; the arrows page it a week at a time.
    const [weekOffset, setWeekOffset] = useState(0);
    const weekDates = useMemo(
        () =>
            Array.from({ length: DAYS_SHOWN }, (_, i) =>
                addDaysIso(todayIso, weekOffset * DAYS_SHOWN + i),
            ),
        [todayIso, weekOffset],
    );
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    // Reset the chosen time whenever the date changes, without a setState-in-effect.
    const [dateForSelectedTime, setDateForSelectedTime] =
        useState(selectedDate);

    if (dateForSelectedTime !== selectedDate) {
        setDateForSelectedTime(selectedDate);
        setSelectedTime(null);
    }

    // Bookable dates, driven by the doctor's schedule (falls back to the weekly
    // template until the month's data has loaded). A week can span two months.
    const monthKeys = useMemo(
        () => [...new Set(weekDates.map((iso) => iso.slice(0, 7)))],
        [weekDates],
    );
    const [daysByMonth, setDaysByMonth] = useState<Record<string, string[]>>(
        {},
    );

    useEffect(() => {
        const missing = monthKeys.filter((key) => !daysByMonth[key]);

        if (missing.length === 0) {
            return;
        }

        let cancelled = false;

        missing.forEach((monthKey) => {
            fetch(
                BookingController.days.url(doctorId, {
                    query: { month: monthKey },
                }),
                { headers: { Accept: 'application/json' } },
            )
                .then((response) => response.json())
                .then((data) => {
                    if (!cancelled) {
                        setDaysByMonth((prev) => ({
                            ...prev,
                            [monthKey]: data.days ?? [],
                        }));
                    }
                });
        });

        return () => {
            cancelled = true;
        };
    }, [doctorId, monthKeys, daysByMonth]);

    // A day is open only if the doctor's uploaded schedule says so, so nothing
    // is offered until the month's list of open days has arrived.
    const isOpen = (iso: string): boolean =>
        daysByMonth[iso.slice(0, 7)]?.includes(iso) ?? false;

    const dayLabel = (iso: string): string => {
        const [year, month, day] = iso.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString(locale, {
            month: 'long',
            weekday: 'long',
        });
    };

    return (
        <div>
            <div>
                <div className="bk-week-head">
                    <button
                        type="button"
                        className="bk-back"
                        disabled={weekOffset === 0}
                        onClick={() => setWeekOffset(weekOffset - 1)}
                    >
                        {lang === 'ar' ? '→' : '←'}
                    </button>
                    <p className="bk-section-label" style={{ margin: 0 }}>
                        {t('booking.chooseDate')}
                    </p>
                    <button
                        type="button"
                        className="bk-back"
                        onClick={() => setWeekOffset(weekOffset + 1)}
                    >
                        {lang === 'ar' ? '←' : '→'}
                    </button>
                </div>

                <div className="bk-grid bk-days">
                    {weekDates.map((iso) => {
                        const isToday = iso === todayIso;
                        // Public bookings start tomorrow: today is shown but not bookable.
                        const disabled =
                            iso <= todayIso ||
                            !isOpen(iso) ||
                            (nextDayClosed && iso === tomorrowIso);

                        return (
                            <button
                                key={iso}
                                type="button"
                                disabled={disabled}
                                onClick={() => setSelectedDate(iso)}
                                className={`bk-chip bk-day${isToday ? ' is-today' : ''}${selectedDate === iso ? ' is-selected' : ''}`}
                            >
                                <span className="n">{Number(iso.slice(8))}</span>
                                <span className="d">
                                    {isToday
                                        ? `${t('booking.today')} · ${t('booking.viewOnly')}`
                                        : dayLabel(iso)}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {!selectedDate && <CallbackBar doctorId={doctorId} />}

            {selectedDate && (
                <div style={{ marginTop: 20 }}>
                    <p className="bk-section-label">
                        {t('booking.availableTimes')}
                    </p>
                    <TimeSlots
                        key={selectedDate}
                        doctorId={doctorId}
                        date={selectedDate}
                        selectedTime={selectedTime}
                        onSelect={setSelectedTime}
                    />
                </div>
            )}

            {selectedDate && selectedTime && (
                <Form
                    {...BookingController.store.form(doctorId)}
                    resetOnSuccess={false}
                    style={{
                        marginTop: 20,
                        paddingTop: 18,
                        borderTop: '1px solid #eef0f4',
                    }}
                >
                    {({ processing, errors }) => (
                        <>
                            <p
                                className="bk-section-label"
                                style={{ marginTop: 0 }}
                            >
                                {t('booking.yourInformation')}
                            </p>

                            <input
                                type="hidden"
                                name="date"
                                value={selectedDate}
                                readOnly
                            />
                            <input
                                type="hidden"
                                name="time"
                                value={selectedTime}
                                readOnly
                            />
                            <InputError message={errors.time} />

                            <div className="bk-field">
                                <label htmlFor="first_name">
                                    {t('booking.firstName')}
                                </label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.first_name} />
                            </div>
                            <div className="bk-field">
                                <label htmlFor="last_name">
                                    {t('booking.lastName')}
                                </label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    required
                                />
                                <InputError message={errors.last_name} />
                            </div>
                            <div className="bk-field">
                                <label htmlFor="email">
                                    {t('booking.email')}
                                </label>
                                <input id="email" name="email" type="email" />
                                <InputError message={errors.email} />
                            </div>
                            <div className="bk-field">
                                <label htmlFor="phone">
                                    {t('booking.phone')}
                                </label>
                                <div className="bk-phone-wrap">
                                    <span className="bk-cc">+966</span>
                                    <input
                                        id="phone"
                                        name="phone"
                                        placeholder="5XXXXXXXX"
                                    />
                                </div>
                                <InputError message={errors.phone} />
                            </div>

                            <button
                                type="submit"
                                className="bk-confirm"
                                disabled={processing}
                            >
                                {t('booking.confirm')}
                            </button>
                        </>
                    )}
                </Form>
            )}
        </div>
    );
}

/** Escape hatch for visitors who can't find a slot: ask the clinic to call them. */
function CallbackBar({ doctorId }: { doctorId: number }) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);

    return (
        <div className="bk-callback">
            <button
                type="button"
                className="bk-callback-bar"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
            >
                {t('booking.callbackBar')}
                <span className={open ? 'caret is-open' : 'caret'}>▾</span>
            </button>

            {open && (
                <Form
                    {...CallbackRequestController.store.form(doctorId)}
                    resetOnSuccess
                    options={{ preserveScroll: true }}
                    className="bk-callback-form"
                >
                    {({ processing, errors, wasSuccessful }) =>
                        wasSuccessful ? (
                            <p className="bk-hint">
                                {t('booking.callbackSuccess')}
                            </p>
                        ) : (
                            <>
                                {Object.keys(errors).length > 0 && (
                                    <p className="bk-callback-error" role="alert">
                                        {t('booking.callbackError')}
                                    </p>
                                )}
                                <input
                                    type="hidden"
                                    name="preferred_contact"
                                    value="phone"
                                />
                                <div className="bk-field">
                                    <label htmlFor="cb-bar-name">
                                        {t('booking.callbackName')}
                                    </label>
                                    <input id="cb-bar-name" name="name" required />
                                </div>
                                <div className="bk-field">
                                    <label htmlFor="cb-bar-phone">
                                        {t('booking.callbackPhone')}
                                    </label>
                                    <div className="bk-phone-wrap">
                                        <span className="bk-cc">+966</span>
                                        <input
                                            id="cb-bar-phone"
                                            name="phone"
                                            {...saudiPhoneInputProps}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="bk-confirm"
                                    disabled={processing}
                                >
                                    {t('booking.callbackSubmit')}
                                </button>
                            </>
                        )
                    }
                </Form>
            )}
        </div>
    );
}

function TimeSlots({
    doctorId,
    date,
    selectedTime,
    onSelect,
}: {
    doctorId: number;
    date: string;
    selectedTime: string | null;
    onSelect: (time: string) => void;
}) {
    const { t } = useLanguage();
    const [slots, setSlots] = useState<string[] | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetch(BookingController.slots.url(doctorId, { query: { date } }), {
            headers: { Accept: 'application/json' },
        })
            .then((response) => response.json())
            .then((data) => {
                if (!cancelled) {
                    setSlots(data.slots);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [doctorId, date]);

    if (slots === null) {
        return <p className="bk-hint">{t('booking.loading')}</p>;
    }

    if (slots.length === 0) {
        return <p className="bk-hint">{t('booking.noTimes')}</p>;
    }

    return (
        <div className="bk-grid">
            {slots.map((time) => (
                <button
                    key={time}
                    type="button"
                    onClick={() => onSelect(time)}
                    className={
                        selectedTime === time
                            ? 'bk-chip is-selected'
                            : 'bk-chip'
                    }
                >
                    {time}
                </button>
            ))}
        </div>
    );
}
