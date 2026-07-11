import { Form } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import BookingController from '@/actions/App/Http/Controllers/BookingController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        <div className="space-y-8">
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
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
                    </Button>
                    <p className="font-medium">
                        {month.toLocaleDateString(lang === 'ar' ? 'ar' : 'en', {
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
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
                    </Button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center">
                    {t('booking.weekdays').map((label: string) => (
                        <div
                            key={label}
                            className="text-xs font-medium text-muted-foreground"
                        >
                            {label}
                        </div>
                    ))}
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
                                className={`rounded-md border py-2 text-sm ${
                                    isSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : disabled
                                          ? 'cursor-not-allowed text-muted-foreground/40'
                                          : 'border-primary/20 bg-primary/5 hover:bg-accent'
                                }`}
                            >
                                {day.getDate()}
                            </button>
                        );
                    })}
                </div>
            </div>

            {selectedDate && (
                <div>
                    <Label className="mb-3 block">
                        {t('booking.availableTimes')}
                    </Label>
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
                    className="space-y-6 border-t pt-6"
                    resetOnSuccess={false}
                >
                    {({ processing, errors }) => (
                        <>
                            <h2 className="text-lg font-semibold">
                                {t('booking.yourInformation')}
                            </h2>

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

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">
                                        {t('booking.firstName')}
                                    </Label>
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.first_name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="last_name">
                                        {t('booking.lastName')}
                                    </Label>
                                    <Input
                                        id="last_name"
                                        name="last_name"
                                        required
                                    />
                                    <InputError message={errors.last_name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        {t('booking.email')}
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">
                                        {t('booking.phone')}
                                    </Label>
                                    <Input id="phone" name="phone" />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>

                            <Button disabled={processing} className="w-full">
                                {t('booking.confirm')}
                            </Button>
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
        return (
            <p className="text-sm text-muted-foreground">
                {t('booking.loading')}
            </p>
        );
    }

    if (slots.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                {t('booking.noTimes')}
            </p>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((time) => (
                <button
                    key={time}
                    type="button"
                    onClick={() => onSelect(time)}
                    className={`rounded-md border py-2 text-sm ${
                        selectedTime === time
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                    }`}
                >
                    {time}
                </button>
            ))}
        </div>
    );
}
