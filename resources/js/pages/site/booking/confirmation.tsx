import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type Appointment = {
    id: number;
    date: string;
    time: string;
    first_name: string;
    last_name: string;
    email: string | null;
    doctor: {
        name: string;
        department: { name: string };
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
    qrCodeDataUri: string;
}) {
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
            <Head title="Appointment confirmed" />

            <section className="py-16">
                <div className="container">
                    <div className="mx-auto max-w-lg space-y-6 rounded-2xl border bg-background p-8 text-center shadow-sm">
                        <div className="text-5xl">🎉</div>
                        <div>
                            <h1 className="text-xl font-semibold">
                                Congratulations
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Appointment ID #{appointment.id}
                            </p>
                        </div>

                        <dl className="divide-y rounded-lg border text-left text-sm">
                            <Row
                                label="Date"
                                value={start.toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            />
                            <Row
                                label="Time"
                                value={start.toLocaleTimeString(undefined, {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                })}
                            />
                            <Row
                                label="Service"
                                value={appointment.doctor.department.name}
                            />
                            <Row
                                label="Doctor"
                                value={appointment.doctor.name}
                            />
                            <Row
                                label="Your name"
                                value={`${appointment.first_name} ${appointment.last_name}`}
                            />
                            {appointment.email && (
                                <Row label="Email" value={appointment.email} />
                            )}
                        </dl>

                        <img
                            src={qrCodeDataUri}
                            alt="Appointment QR code"
                            className="mx-auto size-40"
                        />

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
                                    Add to Google Calendar
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
                                    Add to Outlook
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 p-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    );
}
