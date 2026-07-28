import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    CalendarPlus,
    Clock3,
    Mail,
    Phone,
    Stethoscope,
    UsersRound,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    create as appointmentsCreate,
    index as appointmentsIndex,
} from '@/routes/admin/appointments';
import type { BreadcrumbItem } from '@/types';

type Appointment = {
    id: number;
    reference: string;
    date: string;
    time: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    status: string;
    doctor: { name: string; department: { name: string } };
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    total: number;
};

type Filters = {
    range: string;
    doctor_id: number | null;
    from: string | null;
    to: string | null;
};

const RANGE_OPTIONS: { value: Filters['range']; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'week', label: 'This week' },
    { value: 'custom', label: 'Custom' },
];

const STATUS_VARIANTS: Record<
    string,
    'success' | 'warning' | 'destructive' | 'secondary'
> = {
    confirmed: 'success',
    pending: 'warning',
    cancelled: 'destructive',
};

export default function AppointmentsIndex({
    appointments,
    doctors,
    filters,
}: {
    appointments: Paginated<Appointment>;
    doctors: { id: number; name: string }[];
    filters: Filters;
}) {
    const updateFilters = (changes: Partial<Filters>) => {
        router.get(
            appointmentsIndex().url,
            { ...filters, ...changes },
            { preserveState: true, replace: true },
        );
    };

    const activeRange =
        RANGE_OPTIONS.find((option) => option.value === filters.range)?.label ??
        'All';
    const activeDoctor = doctors.find(
        (doctor) => doctor.id === filters.doctor_id,
    );

    return (
        <>
            <Head title="Appointments" />

            <div className="space-y-5 p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Appointments"
                        description="Review bookings, patient details, and the assigned care team."
                    />
                    <Button asChild>
                        <Link href={appointmentsCreate()}>
                            <CalendarPlus />
                            Book appointment
                        </Link>
                    </Button>
                </div>

                <section className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
                    <div className="grid gap-5 border-b border-slate-300 bg-slate-950 p-4 text-white md:grid-cols-[1fr_auto] md:items-end md:p-5 dark:border-slate-700">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
                                <CalendarDays className="size-5" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold tracking-widest text-cyan-300 uppercase">
                                    Appointment desk
                                </p>
                                <p className="truncate text-lg font-semibold">
                                    {activeRange}
                                    {activeDoctor
                                        ? ` · ${activeDoctor.name}`
                                        : ' · All doctors'}
                                </p>
                                <p className="text-sm text-slate-300">
                                    Showing {appointments.total}{' '}
                                    {appointments.total === 1
                                        ? 'appointment'
                                        : 'appointments'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 text-sm">
                            <div>
                                <span className="block text-xs text-slate-400">
                                    Date view
                                </span>
                                <strong className="font-semibold text-white">
                                    {activeRange}
                                </strong>
                            </div>
                            <div className="h-8 w-px bg-slate-700" />
                            <div>
                                <span className="block text-xs text-slate-400">
                                    Doctor
                                </span>
                                <strong className="font-semibold text-white">
                                    {activeDoctor?.name ?? 'Everyone'}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                            <div className="grid gap-1.5">
                                <Label>Date range</Label>
                                <div
                                    className="inline-flex w-fit flex-wrap rounded-lg border border-slate-300 bg-white p-1 shadow-xs dark:border-slate-700 dark:bg-slate-950"
                                    aria-label="Filter appointments by date"
                                >
                                    {RANGE_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            aria-pressed={
                                                filters.range === option.value
                                            }
                                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                                                filters.range === option.value
                                                    ? 'bg-slate-900 text-white shadow-xs dark:bg-cyan-300 dark:text-slate-950'
                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                                            }`}
                                            onClick={() =>
                                                updateFilters({
                                                    range: option.value,
                                                })
                                            }
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-1.5 lg:w-72">
                                <Label>Doctor</Label>
                                <Select
                                    value={
                                        filters.doctor_id
                                            ? String(filters.doctor_id)
                                            : 'all'
                                    }
                                    onValueChange={(value) =>
                                        updateFilters({
                                            doctor_id:
                                                value === 'all'
                                                    ? null
                                                    : Number(value),
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full bg-white dark:bg-slate-950">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All doctors
                                        </SelectItem>
                                        {doctors.map((doctor) => (
                                            <SelectItem
                                                key={doctor.id}
                                                value={String(doctor.id)}
                                            >
                                                {doctor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {filters.range === 'custom' && (
                            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="appointments-from">
                                        From
                                    </Label>
                                    <Input
                                        id="appointments-from"
                                        type="date"
                                        className="w-auto"
                                        defaultValue={filters.from ?? ''}
                                        onChange={(event) =>
                                            updateFilters({
                                                range: 'custom',
                                                from: event.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="appointments-to">To</Label>
                                    <Input
                                        id="appointments-to"
                                        type="date"
                                        className="w-auto"
                                        defaultValue={filters.to ?? ''}
                                        onChange={(event) =>
                                            updateFilters({
                                                range: 'custom',
                                                to: event.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <p className="pb-2 text-xs text-slate-500 dark:text-slate-400">
                                    Results update when either date changes.
                                </p>
                            </div>
                        )}
                    </div>

                    {appointments.data.length > 0 ? (
                        <>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[850px] text-sm">
                                    <thead className="bg-slate-100 text-left dark:bg-slate-900">
                                        <tr className="border-b border-slate-300 dark:border-slate-700">
                                            <th className="px-4 py-3 text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                                                Schedule
                                            </th>
                                            <th className="px-4 py-3 text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                                                Patient
                                            </th>
                                            <th className="px-4 py-3 text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                                                Contact
                                            </th>
                                            <th className="px-4 py-3 text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                                                Care team
                                            </th>
                                            <th className="px-4 py-3 text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {appointments.data.map(
                                            (appointment) => (
                                                <AppointmentRow
                                                    key={appointment.id}
                                                    appointment={appointment}
                                                />
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="divide-y divide-slate-200 md:hidden dark:divide-slate-800">
                                {appointments.data.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.id}
                                        appointment={appointment}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <EmptyAppointments />
                    )}
                </section>

                {appointments.links.length > 3 && (
                    <nav
                        className="flex flex-wrap items-center justify-between gap-3"
                        aria-label="Appointments pagination"
                    >
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {appointments.total}{' '}
                            {appointments.total === 1
                                ? 'appointment'
                                : 'appointments'}{' '}
                            in this view
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {appointments.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url ?? '#'}
                                    preserveScroll
                                    aria-current={
                                        link.active ? 'page' : undefined
                                    }
                                    className={`min-w-9 rounded-md border px-3 py-1.5 text-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                                        link.active
                                            ? 'border-slate-900 bg-slate-900 text-white dark:border-cyan-300 dark:bg-cyan-300 dark:text-slate-950'
                                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
                                    } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </nav>
                )}
            </div>
        </>
    );
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
    return (
        <tr className="bg-white transition-colors hover:bg-cyan-50/60 dark:bg-slate-950 dark:hover:bg-cyan-950/20">
            <td className="px-4 py-4 align-top">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200">
                        <Clock3 className="size-4" />
                    </span>
                    <div>
                        <p className="font-bold text-slate-950 dark:text-white">
                            {formatTime(appointment.time)}
                        </p>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            {formatDate(appointment.date)}
                        </p>
                        <p className="mt-1 font-mono text-[0.65rem] text-slate-400 dark:text-slate-500">
                            {appointment.reference}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4 align-top">
                <p className="font-semibold text-slate-950 dark:text-white">
                    {appointment.first_name} {appointment.last_name}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Patient
                </p>
            </td>
            <td className="px-4 py-4 align-top">
                <ContactDetails appointment={appointment} />
            </td>
            <td className="px-4 py-4 align-top">
                <div className="flex items-start gap-2">
                    <Stethoscope className="mt-0.5 size-4 shrink-0 text-slate-400" />
                    <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                            {appointment.doctor.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {appointment.doctor.department.name}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4 align-top">
                <StatusBadge status={appointment.status} />
            </td>
        </tr>
    );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
    return (
        <article className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200">
                        <Clock3 className="size-4" />
                    </span>
                    <div>
                        <p className="text-lg font-bold text-slate-950 dark:text-white">
                            {formatTime(appointment.time)}
                        </p>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            {formatDate(appointment.date)}
                        </p>
                    </div>
                </div>
                <StatusBadge status={appointment.status} />
            </div>

            <div>
                <p className="font-semibold text-slate-950 dark:text-white">
                    {appointment.first_name} {appointment.last_name}
                </p>
                <ContactDetails appointment={appointment} />
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                <Stethoscope className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {appointment.doctor.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {appointment.doctor.department.name}
                    </p>
                </div>
                <span className="ml-auto font-mono text-[0.65rem] text-slate-400">
                    {appointment.reference}
                </span>
            </div>
        </article>
    );
}

function ContactDetails({ appointment }: { appointment: Appointment }) {
    if (!appointment.email && !appointment.phone) {
        return (
            <span className="text-xs text-slate-400 dark:text-slate-500">
                No contact details
            </span>
        );
    }

    return (
        <div className="mt-1 grid gap-1 text-xs text-slate-600 dark:text-slate-300">
            {appointment.phone && (
                <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5 text-slate-400" />
                    {appointment.phone}
                </span>
            )}
            {appointment.email && (
                <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5 text-slate-400" />
                    <span className="max-w-52 truncate">
                        {appointment.email}
                    </span>
                </span>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <Badge
            variant={STATUS_VARIANTS[status] ?? 'secondary'}
            className="gap-1.5 capitalize"
        >
            <span className="size-1.5 rounded-full bg-current" />
            {status}
        </Badge>
    );
}

function EmptyAppointments() {
    return (
        <div className="flex min-h-72 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <UsersRound className="size-6" />
            </span>
            <div>
                <p className="font-semibold text-slate-950 dark:text-white">
                    No appointments in this view
                </p>
                <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">
                    Try another date range or doctor, or book a new appointment.
                </p>
            </div>
            <Button variant="outline" asChild>
                <Link href={appointmentsCreate()}>
                    <CalendarPlus />
                    Book appointment
                </Link>
            </Button>
        </div>
    );
}

function formatDate(date: string): string {
    return new Intl.DateTimeFormat('en', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    }).format(new Date(`${date}T12:00:00`));
}

function formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return new Intl.DateTimeFormat('en', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

AppointmentsIndex.layout = {
    breadcrumbs: [
        { title: 'Appointments', href: appointmentsIndex() },
    ] satisfies BreadcrumbItem[],
};
