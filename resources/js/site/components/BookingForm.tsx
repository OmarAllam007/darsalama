import { Form } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import BookingController from '@/actions/App/Http/Controllers/BookingController';
import InputError from '@/components/input-error';
import { useLanguage } from '@/site/i18n/LanguageContext';

function isoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function startOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return today;
}

export default function BookingForm({
    doctorId,
    availableWeekdays,
}: {
    doctorId: number;
    availableWeekdays: number[];
}) {
    const { t, lang } = useLanguage();
    const today = useMemo(() => startOfToday(), []);
    const [month, setMonth] = useState(
        () => new Date(today.getFullYear(), today.getMonth(), 1),
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

    const firstOfMonth = month;
    const daysInMonth = new Date(
        month.getFullYear(),
        month.getMonth() + 1,
        0,
    ).getDate();
    const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
    const days = Array.from(
        { length: daysInMonth },
        (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1),
    );

    return (
        <div>
            <div>
                <div
                    style={{
                        marginBottom: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <button
                        type="button"
                        className="bk-back"
                        style={{ marginBottom: 0 }}
                        onClick={() =>
                            setMonth(
                                new Date(
                                    month.getFullYear(),
                                    month.getMonth() - 1,
                                    1,
                                ),
                            )
                        }
                    >
                        {lang === 'ar' ? '→' : '←'}
                    </button>
                    <p className="bk-section-label" style={{ margin: 0 }}>
                        {month.toLocaleDateString(lang === 'ar' ? 'ar' : 'en', {
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                    <button
                        type="button"
                        className="bk-back"
                        style={{ marginBottom: 0 }}
                        onClick={() =>
                            setMonth(
                                new Date(
                                    month.getFullYear(),
                                    month.getMonth() + 1,
                                    1,
                                ),
                            )
                        }
                    >
                        {lang === 'ar' ? '←' : '→'}
                    </button>
                </div>

                <div
                    className="bk-grid"
                    style={{
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        marginBottom: 4,
                    }}
                >
                    {t('booking.weekdays').map((label: string) => (
                        <div
                            key={label}
                            style={{
                                textAlign: 'center',
                                fontSize: 11,
                                fontWeight: 600,
                                color: '#64748b',
                            }}
                        >
                            {label}
                        </div>
                    ))}
                </div>
                <div
                    className="bk-grid"
                    style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}
                >
                    {Array.from({ length: leadingBlanks }).map((_, i) => (
                        <div key={`blank-${i}`} />
                    ))}
                    {days.map((day) => {
                        const weekday = (day.getDay() + 6) % 7;
                        const disabled =
                            day < today || !availableWeekdays.includes(weekday);
                        const iso = isoDate(day);
                        const isSelected = selectedDate === iso;

                        return (
                            <button
                                key={iso}
                                type="button"
                                disabled={disabled}
                                onClick={() => setSelectedDate(iso)}
                                className={
                                    isSelected
                                        ? 'bk-chip is-selected'
                                        : 'bk-chip'
                                }
                                style={{ padding: '8px 4px' }}
                            >
                                {day.getDate()}
                            </button>
                        );
                    })}
                </div>
            </div>

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
