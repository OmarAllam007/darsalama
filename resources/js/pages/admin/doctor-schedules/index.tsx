import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    Clock3,
    Download,
    FileSpreadsheet,
    Stethoscope,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    exportMethod,
    index as schedulesIndex,
    update,
} from '@/routes/admin/doctor-schedules';
import { index as scheduleImports } from '@/routes/admin/schedule-imports';
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
type DayTone = 'available' | 'limited' | 'unavailable' | 'empty';

const weekDays = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

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
    const [departmentId, setDepartmentId] = useState(
        departments[0] ? String(departments[0].id) : '',
    );
    const [doctorId, setDoctorId] = useState(
        departments[0]?.doctors[0] ? String(departments[0].doctors[0].id) : '',
    );
    const [editingDay, setEditingDay] = useState<Day | null>(null);
    const [draftHours, setDraftHours] = useState('');
    const [saving, setSaving] = useState(false);

    const department = departments.find(
        (item) => String(item.id) === departmentId,
    );
    const doctor = department?.doctors.find(
        (item) => String(item.id) === doctorId,
    );

    const calendarDays = useMemo(() => {
        if (!days[0]) {
            return [];
        }

        const firstDay = new Date(`${days[0].date}T12:00:00`).getDay();
        const leadingDays = (firstDay + 1) % 7;
        const totalCells = Math.ceil((leadingDays + days.length) / 7) * 7;

        return [
            ...Array<Day | null>(leadingDays).fill(null),
            ...days,
            ...Array<Day | null>(totalCells - leadingDays - days.length).fill(
                null,
            ),
        ];
    }, [days]);

    const doctorCells = doctor ? (cells[doctor.id] ?? {}) : {};
    const scheduledDays = Object.values(doctorCells).filter(
        (value) => value.trim() !== '',
    ).length;

    const selectDepartment = (value: string) => {
        setDepartmentId(value);

        const nextDepartment = departments.find(
            (item) => String(item.id) === value,
        );
        setDoctorId(
            nextDepartment?.doctors[0]
                ? String(nextDepartment.doctors[0].id)
                : '',
        );
    };

    const goToMonth = (value: string) => {
        if (value) {
            router.get(
                schedulesIndex({ query: { month: value } }).url,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    };

    const openEditor = (day: Day) => {
        if (!doctor) {
            return;
        }

        setEditingDay(day);
        setDraftHours(doctorCells[day.date] ?? '');
    };

    const saveDay = () => {
        if (!doctor || !editingDay) {
            return;
        }

        const current = doctorCells[editingDay.date] ?? '';

        if (draftHours.trim() === current.trim()) {
            setEditingDay(null);

            return;
        }

        router.put(
            update().url,
            {
                doctor_id: doctor.id,
                date: editingDay.date,
                hours: draftHours,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setSaving(true),
                onSuccess: () => {
                    setEditingDay(null);
                    toast.success('Schedule updated.');
                },
                onError: (errors) =>
                    toast.error(errors.hours ?? 'Could not save this day.'),
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <>
            <Head title="Doctor schedules" />

            <div className="space-y-5 p-4 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <Heading
                        title="Doctor schedules"
                        description="Review and edit one doctor’s working calendar at a time."
                    />

                    <div className="flex flex-wrap items-end gap-2">
                        <Button variant="outline" asChild>
                            <a href={exportMethod({ query: { month } }).url}>
                                <Download />
                                Export Excel
                            </a>
                        </Button>

                        <Button variant="outline" asChild>
                            <Link href={scheduleImports()}>
                                <FileSpreadsheet />
                                Import Excel
                            </Link>
                        </Button>
                    </div>
                </div>

                <section className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
                    <div className="grid gap-4 border-b border-slate-300 bg-slate-950 p-4 text-white md:grid-cols-[1fr_auto] md:items-end md:p-5 dark:border-slate-700">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-emerald-400 text-slate-950">
                                <Stethoscope className="size-5" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold tracking-widest text-emerald-300 uppercase">
                                    Selected calendar
                                </p>
                                <p className="truncate text-lg font-semibold">
                                    {doctor?.name ?? 'Select a doctor'}
                                </p>
                                <p className="truncate text-sm text-slate-300">
                                    {department?.name ?? 'No department'} ·{' '}
                                    {department?.slot_minutes ?? 0} minute slots
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 text-sm">
                            <div>
                                <span className="block text-xs text-slate-400">
                                    Scheduled
                                </span>
                                <strong className="font-semibold text-white">
                                    {scheduledDays} of {days.length} days
                                </strong>
                            </div>
                            <div className="h-8 w-px bg-slate-700" />
                            <div>
                                <span className="block text-xs text-slate-400">
                                    Month
                                </span>
                                <strong className="font-semibold text-white">
                                    {formatMonth(month)}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1fr_1fr_11rem] dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="grid gap-1.5">
                            <Label>Department</Label>
                            <Select
                                value={departmentId}
                                onValueChange={selectDepartment}
                            >
                                <SelectTrigger className="w-full bg-white dark:bg-slate-950">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((item) => (
                                        <SelectItem
                                            key={item.id}
                                            value={String(item.id)}
                                        >
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1.5">
                            <Label>Doctor</Label>
                            <Select
                                value={doctorId}
                                onValueChange={setDoctorId}
                                disabled={!department?.doctors.length}
                            >
                                <SelectTrigger className="w-full bg-white dark:bg-slate-950">
                                    <SelectValue placeholder="Doctor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(department?.doctors ?? []).map((item) => (
                                        <SelectItem
                                            key={item.id}
                                            value={String(item.id)}
                                        >
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="month">Month</Label>
                            <Input
                                id="month"
                                type="month"
                                defaultValue={month}
                                onChange={(event) =>
                                    goToMonth(event.target.value)
                                }
                                className="bg-white dark:bg-slate-950"
                            />
                        </div>
                    </div>

                    {doctor ? (
                        <>
                            <ScheduleLegend />

                            <div className="overflow-x-auto">
                                <div className="min-w-[840px] p-3 md:p-4">
                                    <div className="grid grid-cols-7 border-t border-l border-slate-300 dark:border-slate-700">
                                        {weekDays.map((day) => (
                                            <div
                                                key={day}
                                                className="border-r border-b border-slate-300 bg-slate-100 px-3 py-2 text-xs font-bold tracking-wider text-slate-700 uppercase dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                            >
                                                {day}
                                            </div>
                                        ))}

                                        {calendarDays.map((day, index) =>
                                            day ? (
                                                <ScheduleDay
                                                    key={day.date}
                                                    day={day}
                                                    value={
                                                        doctorCells[day.date] ??
                                                        ''
                                                    }
                                                    onClick={() =>
                                                        openEditor(day)
                                                    }
                                                />
                                            ) : (
                                                <div
                                                    key={`empty-${index}`}
                                                    aria-hidden="true"
                                                    className="min-h-28 border-r border-b border-slate-300 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900/40"
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex min-h-72 flex-col items-center justify-center gap-2 p-8 text-center">
                            <CalendarDays className="size-8 text-slate-400" />
                            <p className="font-medium text-slate-900 dark:text-white">
                                No active doctor in this department
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Choose another department to view a schedule.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            <Dialog
                open={editingDay !== null}
                onOpenChange={(open) => !open && setEditingDay(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingDay
                                ? formatDate(editingDay.date)
                                : 'Edit schedule'}
                        </DialogTitle>
                        <DialogDescription>
                            Set {doctor?.name}&apos;s hours for this date. Leave
                            blank to clear the schedule.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="schedule-hours">Schedule</Label>
                        <Input
                            id="schedule-hours"
                            value={draftHours}
                            onChange={(event) =>
                                setDraftHours(event.target.value)
                            }
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    saveDay();
                                }
                            }}
                            placeholder="8:00-12:00; 16:00-20:00"
                            autoFocus
                        />
                        <p className="text-xs leading-5 text-muted-foreground">
                            Use <code>OFF</code>, <code>V</code>, or{' '}
                            <code>NO CLINIC</code> for a whole day. Codes in
                            brackets close a window, except <code>(OPD)</code>{' '}
                            and <code>(ONLY)</code>.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setEditingDay(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={saveDay}
                            disabled={saving}
                        >
                            {saving ? 'Saving…' : 'Save schedule'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function ScheduleDay({
    day,
    value,
    onClick,
}: {
    day: Day;
    value: string;
    onClick: () => void;
}) {
    const tone = scheduleTone(value);
    const toneClasses: Record<DayTone, string> = {
        available:
            'border-l-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:border-l-emerald-400 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50',
        limited:
            'border-l-amber-600 bg-amber-50 hover:bg-amber-100 dark:border-l-amber-400 dark:bg-amber-950/30 dark:hover:bg-amber-950/50',
        unavailable:
            'border-l-rose-600 bg-rose-50 hover:bg-rose-100 dark:border-l-rose-400 dark:bg-rose-950/30 dark:hover:bg-rose-950/50',
        empty: 'border-l-slate-300 bg-white hover:bg-slate-50 dark:border-l-slate-600 dark:bg-slate-950 dark:hover:bg-slate-900',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={`Edit ${formatDate(day.date)} schedule${value ? `: ${value}` : ''}`}
            className={`group min-h-28 border-r border-b border-l-4 border-r-slate-300 border-b-slate-300 p-2.5 text-left transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary dark:border-r-slate-700 dark:border-b-slate-700 ${toneClasses[tone]}`}
        >
            <span className="flex items-start justify-between gap-2">
                <span className="text-lg font-bold text-slate-950 dark:text-white">
                    {day.date.slice(8)}
                </span>
                <span className="text-[0.65rem] font-semibold tracking-wide text-slate-500 uppercase opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:text-slate-400">
                    Edit
                </span>
            </span>

            {value ? (
                <span className="mt-4 flex items-start gap-1.5 text-xs leading-4 font-semibold text-slate-800 dark:text-slate-100">
                    <Clock3 className="mt-0.5 size-3.5 shrink-0" />
                    <span className="line-clamp-3">{value}</span>
                </span>
            ) : (
                <span className="mt-5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Not scheduled
                </span>
            )}
        </button>
    );
}

function ScheduleLegend() {
    return (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-200 px-4 py-3 text-xs font-medium text-slate-700 dark:border-slate-800 dark:text-slate-300">
            <LegendKey className="bg-emerald-600" label="Working" />
            <LegendKey
                className="bg-amber-500"
                label="Limited / closed window"
            />
            <LegendKey className="bg-rose-600" label="Off or unavailable" />
            <LegendKey
                className="bg-slate-300 dark:bg-slate-600"
                label="Not scheduled"
            />
            <span className="ml-auto text-slate-500 dark:text-slate-400">
                Select a date to edit
            </span>
        </div>
    );
}

function LegendKey({ className, label }: { className: string; label: string }) {
    return (
        <span className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${className}`} />
            {label}
        </span>
    );
}

function scheduleTone(value: string): DayTone {
    const normalized = value.trim().toUpperCase();

    if (!normalized) {
        return 'empty';
    }

    if (['OFF', 'V', 'VACATION', 'NO CLINIC'].includes(normalized)) {
        return 'unavailable';
    }

    const windowCodes = normalized.match(/\([^)]+\)/g) ?? [];

    if (windowCodes.some((code) => code !== '(OPD)' && code !== '(ONLY)')) {
        return 'limited';
    }

    return 'available';
}

function formatMonth(month: string): string {
    return new Intl.DateTimeFormat('en', {
        month: 'long',
        year: 'numeric',
    }).format(new Date(`${month}-01T12:00:00`));
}

function formatDate(date: string): string {
    return new Intl.DateTimeFormat('en', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(`${date}T12:00:00`));
}

DoctorSchedulesIndex.layout = {
    breadcrumbs: [
        { title: 'Doctor schedules', href: schedulesIndex() },
    ] satisfies BreadcrumbItem[],
};
