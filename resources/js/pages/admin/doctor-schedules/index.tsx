import { Head, router, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import toast from 'react-hot-toast';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    exportMethod,
    importMethod,
    index as schedulesIndex,
    update,
} from '@/routes/admin/doctor-schedules';
import type { BreadcrumbItem } from '@/types';

type Day = { date: string; weekday: string };
type Doctor = { id: number; code: string | null; name: string };
type Department = {
    id: number;
    name: string;
    slot_minutes: number;
    doctors: Doctor[];
};
type Cells = Record<number, Record<string, string>>;
type ImportSummary = {
    created: number;
    updated: number;
    errors: string[];
};

export default function DoctorSchedulesIndex({
    month,
    days,
    departments,
    cells,
}: {
    month: string;
    days: Day[];
    departments: Department[];
    cells: Cells;
    statuses: string[];
}) {
    const fileInput = useRef<HTMLInputElement>(null);
    const flash = usePage<{ flash: { import: ImportSummary | null } }>().props
        .flash;

    if (flash?.import) {
        const { created, updated, errors } = flash.import;
        toast.success(`Imported: ${created} added, ${updated} updated.`);

        if (errors.length > 0) {
            toast.error(`${errors.length} cell(s) skipped — see console.`);
            console.warn('Schedule import issues:', errors);
        }
    }

    const goToMonth = (value: string) => {
        if (value) {
            router.get(schedulesIndex({ query: { month: value } }).url, {}, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const saveCell = (doctorId: number, date: string, value: string) => {
        const current = cells[doctorId]?.[date] ?? '';

        if (value.trim() === current.trim()) {
            return;
        }

        router.put(
            update().url,
            { doctor_id: doctorId, date, hours: value },
            {
                preserveScroll: true,
                preserveState: true,
                onError: (errors) =>
                    toast.error(errors.hours ?? 'Could not save cell.'),
            },
        );
    };

    const submitImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        router.post(
            importMethod().url,
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => {
                    if (fileInput.current) {
                        fileInput.current.value = '';
                    }
                },
            },
        );
    };

    return (
        <>
            <Head title="Doctor schedules" />

            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <Heading title="Doctor schedules" />

                    <div className="flex flex-wrap items-end gap-3">
                        <div className="grid gap-1">
                            <Label htmlFor="month">Month</Label>
                            <Input
                                id="month"
                                type="month"
                                defaultValue={month}
                                onChange={(e) => goToMonth(e.target.value)}
                                className="w-40"
                            />
                        </div>

                        <a
                            href={
                                exportMethod({ query: { month } }).url
                            }
                        >
                            <Button variant="outline" type="button">
                                Export Excel
                            </Button>
                        </a>

                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => fileInput.current?.click()}
                        >
                            Import Excel
                        </Button>
                        <input
                            ref={fileInput}
                            type="file"
                            accept=".xlsx,.xls"
                            className="hidden"
                            onChange={submitImport}
                        />
                    </div>
                </div>

                <p className="text-sm text-muted-foreground">
                    Type each cell as{' '}
                    <code>8:00-12:00; 16:00-20:00</code>, add{' '}
                    <code>(OR)</code> to close a window for booking, or use{' '}
                    <code>OFF</code>, <code>V</code>, <code>NO CLINIC</code>.
                    Blank clears the day.
                </p>

                {departments.map((department) => (
                    <div key={department.id} className="space-y-2">
                        <h2 className="text-lg font-semibold">
                            {department.name}{' '}
                            <span className="text-sm font-normal text-muted-foreground">
                                ({department.slot_minutes} min slots)
                            </span>
                        </h2>

                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="sticky left-0 z-10 bg-muted/50 px-2 py-1 text-left">
                                            Date
                                        </th>
                                        {department.doctors.map((doctor) => (
                                            <th
                                                key={doctor.id}
                                                className="min-w-44 px-2 py-1 text-left"
                                            >
                                                {doctor.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {days.map((day) => (
                                        <tr
                                            key={day.date}
                                            className="border-t"
                                        >
                                            <td className="sticky left-0 z-10 bg-background px-2 py-1 whitespace-nowrap">
                                                {day.weekday}{' '}
                                                {day.date.slice(8)}
                                            </td>
                                            {department.doctors.map(
                                                (doctor) => (
                                                    <td
                                                        key={doctor.id}
                                                        className="px-1 py-0.5"
                                                    >
                                                        <Input
                                                            defaultValue={
                                                                cells[
                                                                    doctor.id
                                                                ]?.[
                                                                    day.date
                                                                ] ?? ''
                                                            }
                                                            onBlur={(e) =>
                                                                saveCell(
                                                                    doctor.id,
                                                                    day.date,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-8"
                                                        />
                                                    </td>
                                                ),
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

DoctorSchedulesIndex.layout = {
    breadcrumbs: [
        { title: 'Doctor schedules', href: schedulesIndex() },
    ] satisfies BreadcrumbItem[],
};
