import { Form } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import BookingController from '@/actions/App/Http/Controllers/BookingController';
import CallbackRequestController from '@/actions/App/Http/Controllers/CallbackRequestController';
import InputError from '@/components/input-error';
import { PHONE, PHONE_TEL } from '@/site/i18n/constants';
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

function minutesFromTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
}

function timeFromMinutes(totalMinutes: number): string {
    const minutesInDay = 24 * 60;
    const normalized =
        ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay;
    const hours = Math.floor(normalized / 60);
    const minutes = normalized % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function slotRange(start: string, durationMinutes: number): string {
    const startMinutes = minutesFromTime(start);
    const end = timeFromMinutes(startMinutes + durationMinutes);

    return `${start}\u2013${end}`;
}

function inferSlotMinutes(slots: string[]): number {
    if (slots.length < 2) {
        return 15;
    }

    const deltas = slots
        .map(minutesFromTime)
        .slice(1)
        .map((current, index) => current - minutesFromTime(slots[index]))
        .filter((delta) => delta > 0);

    return deltas.length > 0 ? Math.min(...deltas) : 15;
}

const DAYS_WINDOW = 31;

export default function BookingForm({
    doctorId,
    doctorName,
    departmentName,
    hasOnlineBooking,
}: {
    doctorId: number;
    doctorName: string;
    departmentName: string;
    hasOnlineBooking: boolean;
}) {
    const { t } = useLanguage();

    if (!hasOnlineBooking) {
        return (
            <div>
                <div className="bk-online-unavailable" role="status">
                    <p>
                        {t('booking.onlineUnavailable')}{' '}
                        <a href={PHONE_TEL} dir="ltr">
                            {PHONE}
                        </a>{' '}
                        {t('booking.onlineUnavailableAction')}
                    </p>
                </div>

                <CallbackBar
                    doctorId={doctorId}
                    doctorName={doctorName}
                    departmentName={departmentName}
                />
            </div>
        );
    }

    return (
        <BookableBookingForm doctorId={doctorId} />
    );
}

function BookableBookingForm({
    doctorId,
}: {
    doctorId: number;
}) {
    const { t, lang } = useLanguage();
    const locale = lang === 'ar' ? 'ar' : lang === 'ur' ? 'ur' : 'en';
    const clinic = useMemo(() => clinicNow(), []);
    const todayIso = clinic.dateIso;
    const tomorrowIso = useMemo(() => addDaysIso(todayIso, 1), [todayIso]);
    const nextDayClosed = clinic.hour >= NEXT_DAY_CUTOFF_HOUR;
    const dateWindow = useMemo(
        () =>
            Array.from({ length: DAYS_WINDOW }, (_, i) =>
                addDaysIso(todayIso, i),
            ),
        [todayIso],
    );
    const [step, setStep] = useState<'date' | 'time' | 'info'>('date');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [slotMinutes, setSlotMinutes] = useState(15);

    // Bookable dates, driven by the doctor's schedule (falls back to the weekly
    // template until the month's data has loaded). A week can span two months.
    const monthKeys = useMemo(
        () => [...new Set(dateWindow.map((iso) => iso.slice(0, 7)))],
        [dateWindow],
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

    const dayLabel = (iso: string, showDay = true): string => {
        const [year, month, day] = iso.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString(locale, {
            month: 'short',
            ...(showDay ? { weekday: 'short' as const } : {}),
        });
    };

    const visibleDates = useMemo(
        () =>
            dateWindow.filter((iso) => {
                if (iso === todayIso) {
                    return true;
                }

                return isOpen(iso);
            }),
        [dateWindow, todayIso, daysByMonth],
    );

    const openDate = (iso: string) => {
        setSelectedDate(iso);
        setSelectedTime(null);
        setStep('time');
    };

    const selectTime = (time: string) => {
        setSelectedTime(time);
        setStep('info');
    };

    const selectedDateLabel = selectedDate ? dayLabel(selectedDate, false) : '';

    return (
        <div>
            {step === 'date' && (
                <div>
                    <p className="bk-section-label">{t('booking.selectDate')}</p>
                    <div className="bk-grid bk-days">
                        {visibleDates.map((iso) => {
                            const isToday = iso === todayIso;
                            // Public bookings start tomorrow: today is shown but not bookable.
                            const disabled =
                                iso <= todayIso ||
                                (nextDayClosed && iso === tomorrowIso);

                            return (
                                <button
                                    key={iso}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => openDate(iso)}
                                    className={[
                                        'bk-chip',
                                        'bk-day',
                                        isToday ? 'is-today' : null,
                                        selectedDate === iso ? 'is-selected' : null,
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
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
            )}

            {step === 'time' && selectedDate && (
                <div style={{ marginTop: 20 }}>
                    <button
                        type="button"
                        className="bk-step-back"
                        onClick={() => setStep('date')}
                    >
                        {lang === 'ar' ? '‹ ' : '‹ '}
                        {t('booking.backToDates')}
                    </button>
                    <p className="bk-section-label">
                        {t('booking.selectTime')} ({slotMinutes} min) —{' '}
                        {selectedDateLabel}
                    </p>
                    <TimeSlots
                        key={selectedDate}
                        doctorId={doctorId}
                        date={selectedDate}
                        selectedTime={selectedTime}
                        onSelect={selectTime}
                        onSlotMinutes={setSlotMinutes}
                    />
                </div>
            )}

            {step === 'info' && selectedDate && selectedTime && (
                <Form
                    {...BookingController.store.form(doctorId)}
                    transform={(data) => {
                        const fullName = String(data.full_name ?? '').trim();
                        const parts = fullName.split(/\s+/).filter(Boolean);
                        const firstName = parts.shift() ?? fullName;
                        const lastName = parts.join(' ') || '-';

                        return {
                            ...data,
                            first_name: firstName,
                            last_name: lastName,
                        };
                    }}
                    resetOnSuccess={false}
                    style={{
                        marginTop: 20,
                        paddingTop: 18,
                        borderTop: '1px solid #eef0f4',
                    }}
                >
                    {({ processing, errors }) => (
                        <>
                            <button
                                type="button"
                                className="bk-step-back"
                                onClick={() => setStep('time')}
                            >
                                {lang === 'ar' ? '‹ ' : '‹ '}
                                {t('booking.backToTimes')}
                            </button>

                            <p className="bk-selected-slot">
                                {selectedDateLabel} ·{' '}
                                {slotRange(selectedTime, slotMinutes)}
                            </p>

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
                            <input
                                type="hidden"
                                name="first_name"
                                value=""
                                readOnly
                            />
                            <input
                                type="hidden"
                                name="last_name"
                                value=""
                                readOnly
                            />
                            <InputError message={errors.time} />

                            <div className="bk-field">
                                <label htmlFor="full_name">
                                    {t('booking.fullName')}
                                </label>
                                <input
                                    id="full_name"
                                    name="full_name"
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.first_name} />
                                <InputError message={errors.last_name} />
                            </div>
                            <div className="bk-field">
                                <label htmlFor="appointment-phone">
                                    {t('booking.callbackPhone')}
                                </label>
                                <div className="bk-phone-wrap">
                                    <span className="bk-cc">+966</span>
                                    <input
                                        id="appointment-phone"
                                        name="phone"
                                        {...saudiPhoneInputProps}
                                    />
                                </div>
                                <p className="bk-callback-help">
                                    {t('booking.callbackPhoneHint')}
                                </p>
                                <InputError message={errors.phone} />
                            </div>

                            <button
                                type="submit"
                                className="bk-confirm"
                                disabled={processing}
                            >
                                {t('booking.appointmentRequest')}
                            </button>
                        </>
                    )}
                </Form>
            )}
        </div>
    );
}

/** Escape hatch for visitors who can't find a slot: ask the clinic to call them. */
function CallbackBar({
    doctorId,
    doctorName,
    departmentName,
}: {
    doctorId: number;
    doctorName: string;
    departmentName: string;
}) {
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
                                    <p
                                        className="bk-callback-error"
                                        role="alert"
                                    >
                                        {t('booking.callbackError')}
                                    </p>
                                )}
                                <p className="bk-callback-context">
                                    {doctorName}
                                    <span aria-hidden="true"> — </span>
                                    {departmentName}
                                </p>
                                <div className="bk-field">
                                    <label htmlFor="cb-bar-name">
                                        {t('booking.callbackName')}
                                    </label>
                                    <input
                                        id="cb-bar-name"
                                        name="name"
                                        autoComplete="name"
                                        required
                                    />
                                    <InputError message={errors.name} />
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
                                    <p className="bk-callback-help">
                                        {t('booking.callbackPhoneHint')}
                                    </p>
                                    <InputError message={errors.phone} />
                                </div>
                                <div className="bk-field">
                                    <label htmlFor="cb-bar-contact">
                                        {t('booking.callbackPreferredContact')}
                                    </label>
                                    <select
                                        id="cb-bar-contact"
                                        name="preferred_contact"
                                        defaultValue="phone"
                                    >
                                        <option value="phone">
                                            {t('booking.callbackPhoneCall')}
                                        </option>
                                        <option value="whatsapp">
                                            {t('booking.callbackWhatsapp')}
                                        </option>
                                    </select>
                                    <InputError
                                        message={errors.preferred_contact}
                                    />
                                </div>
                                <div className="bk-field">
                                    <label htmlFor="cb-bar-time">
                                        {t('booking.callbackBestTime')}
                                    </label>
                                    <select
                                        id="cb-bar-time"
                                        name="best_time"
                                        defaultValue={t(
                                            'booking.callbackMorning',
                                        )}
                                    >
                                        <option
                                            value={t('booking.callbackMorning')}
                                        >
                                            {t('booking.callbackMorning')}
                                        </option>
                                        <option
                                            value={t(
                                                'booking.callbackAfternoon',
                                            )}
                                        >
                                            {t('booking.callbackAfternoon')}
                                        </option>
                                        <option
                                            value={t('booking.callbackEvening')}
                                        >
                                            {t('booking.callbackEvening')}
                                        </option>
                                    </select>
                                    <InputError message={errors.best_time} />
                                </div>
                                <div className="bk-field">
                                    <label htmlFor="cb-bar-notes">
                                        {t('booking.callbackNeeds')}
                                    </label>
                                    <textarea
                                        id="cb-bar-notes"
                                        name="notes"
                                        rows={3}
                                        placeholder={t(
                                            'booking.callbackNeedsPlaceholder',
                                        )}
                                    />
                                    <InputError message={errors.notes} />
                                </div>
                                <button
                                    type="submit"
                                    className="bk-confirm"
                                    disabled={processing}
                                >
                                    {processing
                                        ? t('booking.callbackSending')
                                        : t('booking.callbackSubmit')}
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
    onSlotMinutes,
}: {
    doctorId: number;
    date: string;
    selectedTime: string | null;
    onSelect: (time: string) => void;
    onSlotMinutes: (minutes: number) => void;
}) {
    const { t } = useLanguage();
    const [slots, setSlots] = useState<string[] | null>(null);
    const [slotMinutes, setSlotMinutes] = useState(15);

    useEffect(() => {
        let cancelled = false;

        fetch(BookingController.slots.url(doctorId, { query: { date } }), {
            headers: { Accept: 'application/json' },
        })
            .then((response) => response.json())
            .then((data) => {
                if (!cancelled) {
                    const availableSlots: string[] = data.slots ?? [];
                    const inferredMinutes = inferSlotMinutes(availableSlots);
                    setSlotMinutes(inferredMinutes);
                    onSlotMinutes(inferredMinutes);
                    setSlots(availableSlots);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [doctorId, date, onSlotMinutes]);

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
                    {slotRange(time, slotMinutes)}
                </button>
            ))}
        </div>
    );
}
