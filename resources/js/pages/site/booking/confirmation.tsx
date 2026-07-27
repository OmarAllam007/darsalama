import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/site/i18n/LanguageContext';

type Appointment = {
    id: number;
    reference: string;
    date: string;
    time: string;
    first_name: string;
    last_name: string;
    email: string | null;
    doctor: {
        name: string;
        name_ar: string;
        department: { name: string; name_ar: string };
    };
};

const pad = (n: number) => String(n).padStart(2, '0');

// ponytail: fixed 30 minute event duration for calendar links; wire up doctor slot_minutes if variable durations matter later.
const EVENT_MINUTES = 30;

function googleDateFormat(date: Date): string {
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function outlookDateFormat(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export default function BookingConfirmation({
    appointment,
    qrCodeDataUri,
}: {
    appointment: Appointment;
    qrCodeDataUri: string | null;
}) {
    const { t, lang } = useLanguage();
    const locale = lang === 'ar' ? 'ar' : lang === 'ur' ? 'ur' : 'en';
    const start = new Date(`${appointment.date}T${appointment.time}`);
    const end = new Date(start.getTime() + EVENT_MINUTES * 60_000);
    const title = `Appointment with ${appointment.doctor.name}`;
    const details = `${appointment.doctor.department.name} appointment at Dar As Salama.`;

    const googleUrl =
        'https://calendar.google.com/calendar/render?action=TEMPLATE' +
        `&text=${encodeURIComponent(title)}` +
        `&dates=${googleDateFormat(start)}/${googleDateFormat(end)}` +
        `&details=${encodeURIComponent(details)}`;

    const outlookUrl =
        'https://outlook.live.com/calendar/0/deeplink/compose?rru=addevent' +
        `&subject=${encodeURIComponent(title)}` +
        `&startdt=${outlookDateFormat(start)}` +
        `&enddt=${outlookDateFormat(end)}` +
        `&body=${encodeURIComponent(details)}`;

    return (
        <>
            <Head title={t('booking.confirmed.title') as string} />

            <section className="py-16">
                <div className="container">
                    <div className="mx-auto max-w-lg space-y-6 rounded-2xl border bg-background p-8 text-center shadow-sm">
                        <div className="text-5xl">🎉</div>
                        <div>
                            <h1 className="text-xl font-semibold">
                                {t('booking.confirmed.title')}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {t('booking.confirmed.appointmentId')}{' '}
                                <span className="font-mono font-medium tracking-wider">
                                    {appointment.reference}
                                </span>
                            </p>
                        </div>

                        <dl className="divide-y rounded-lg border text-start text-sm">
                            <Row
                                label={t('booking.confirmed.date')}
                                value={start.toLocaleDateString(locale, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            />
                            <Row
                                label={t('booking.confirmed.time')}
                                value={start.toLocaleTimeString(locale, {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                })}
                            />
                            <Row
                                label={t('booking.confirmed.service')}
                                value={
                                    lang === 'ar'
                                        ? appointment.doctor.department.name_ar
                                        : appointment.doctor.department.name
                                }
                            />
                            <Row
                                label={t('booking.confirmed.doctor')}
                                value={
                                    lang === 'ar'
                                        ? appointment.doctor.name_ar
                                        : appointment.doctor.name
                                }
                            />
                            <Row
                                label={t('booking.confirmed.yourName')}
                                value={`${appointment.first_name} ${appointment.last_name}`}
                            />
                            {appointment.email && (
                                <Row
                                    label={t('booking.confirmed.email')}
                                    value={appointment.email}
                                />
                            )}
                        </dl>

                        {/* {qrCodeDataUri && (
                            <img
                                src={qrCodeDataUri}
                                alt={t('booking.confirmed.qrAlt') as string}
                                className="mx-auto size-40"
                            />
                        )} */}

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                asChild
                                variant="outline"
                                className="flex-1"
                            >
                                <a
                                    href={googleUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {t('booking.confirmed.addToGoogle')}
                                </a>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="flex-1"
                            >
                                <a
                                    href={outlookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {t('booking.confirmed.addToOutlook')}
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

function Row({ label, value }: { label: ReactNode; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 p-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    );
}
