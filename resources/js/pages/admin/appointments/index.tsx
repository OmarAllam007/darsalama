import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { index as appointmentsIndex } from '@/routes/admin/appointments';
import type { BreadcrumbItem } from '@/types';

type Appointment = {
    id: number;
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

    return (
        <>
            <Head title="Appointments" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Appointments"
                    description="Every appointment booked through the public site"
                />

                <div className="flex flex-wrap items-center gap-2">
                    {RANGE_OPTIONS.map((option) => (
                        <Button
                            key={option.value}
                            type="button"
                            size="sm"
                            variant={
                                filters.range === option.value
                                    ? 'default'
                                    : 'outline'
                            }
                            onClick={() =>
                                updateFilters({ range: option.value })
                            }
                        >
                            {option.label}
                        </Button>
                    ))}

                    {filters.range === 'custom' && (
                        <>
                            <Input
                                type="date"
                                className="w-auto"
                                defaultValue={filters.from ?? ''}
                                onChange={(e) =>
                                    updateFilters({
                                        range: 'custom',
                                        from: e.target.value,
                                    })
                                }
                            />
                            <span className="text-sm text-muted-foreground">
                                to
                            </span>
                            <Input
                                type="date"
                                className="w-auto"
                                defaultValue={filters.to ?? ''}
                                onChange={(e) =>
                                    updateFilters({
                                        range: 'custom',
                                        to: e.target.value,
                                    })
                                }
                            />
                        </>
                    )}

                    <select
                        className="ml-auto h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none"
                        value={filters.doctor_id ?? ''}
                        onChange={(e) =>
                            updateFilters({
                                doctor_id: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                            })
                        }
                    >
                        <option value="">All doctors</option>
                        {doctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                                {doctor.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="p-3 font-medium">Patient</th>
                                <th className="p-3 font-medium">Contact</th>
                                <th className="p-3 font-medium">Doctor</th>
                                <th className="p-3 font-medium">Department</th>
                                <th className="p-3 font-medium">Date</th>
                                <th className="p-3 font-medium">Time</th>
                                <th className="p-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.data.map((appointment) => (
                                <tr key={appointment.id} className="border-t">
                                    <td className="p-3">
                                        {appointment.first_name}{' '}
                                        {appointment.last_name}
                                    </td>
                                    <td className="p-3 text-muted-foreground">
                                        {[appointment.email, appointment.phone]
                                            .filter(Boolean)
                                            .join(' · ') || '—'}
                                    </td>
                                    <td className="p-3">
                                        {appointment.doctor.name}
                                    </td>
                                    <td className="p-3">
                                        {appointment.doctor.department.name}
                                    </td>
                                    <td className="p-3">{appointment.date}</td>
                                    <td className="p-3">
                                        {appointment.time.slice(0, 5)}
                                    </td>
                                    <td className="p-3">
                                        <Badge
                                            variant={
                                                STATUS_VARIANTS[
                                                    appointment.status
                                                ] ?? 'secondary'
                                            }
                                            className="capitalize"
                                        >
                                            {appointment.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            {appointments.data.length === 0 && (
                                <tr>
                                    <td
                                        className="p-3 text-muted-foreground"
                                        colSpan={7}
                                    >
                                        No appointments match these filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {appointments.links.length > 3 && (
                    <div className="flex flex-wrap gap-2">
                        {appointments.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                preserveScroll
                                className={`rounded-md border px-3 py-1 text-sm ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : ''
                                } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

AppointmentsIndex.layout = {
    breadcrumbs: [
        { title: 'Appointments', href: appointmentsIndex() },
    ] satisfies BreadcrumbItem[],
};
