import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as scheduleColumns } from '@/routes/admin/schedule-columns';
import {
    index as scheduleImports,
    preview as previewRoute,
    store,
} from '@/routes/admin/schedule-imports';
import type { BreadcrumbItem } from '@/types';

type Change = 'new' | 'modified' | 'unchanged' | 'conflict' | 'error';

type Summary = {
    doctors: number;
    days: number;
    created: number;
    updated: number;
    unchanged: number;
    conflicts: number;
    errors: number;
};

type Row = {
    doctor_id: number;
    doctor: string;
    department: string;
    date: string;
    current: string;
    incoming: string;
    change: Change;
    message: string | null;
};

type Preview = {
    token: string;
    month: string;
    filename: string;
    summary: Summary;
    warnings: string[];
    rows: Row[];
};

type HistoryEntry = {
    id: number;
    month: string;
    filename: string;
    imported_by: string | null;
    imported_at: string | null;
    summary: Summary;
};

const changeStyles: Record<Change, string> = {
    new: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100',
    modified:
        'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100',
    unchanged: 'bg-muted text-muted-foreground',
    conflict: 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100',
    error: 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100',
};

const changeLabels: Record<Change, string> = {
    new: 'New',
    modified: 'Modified',
    unchanged: 'Unchanged',
    conflict: 'Skipped — booked',
    error: 'Skipped — unreadable',
};

export default function ScheduleImportsIndex({
    history,
    defaultMonth,
    preview,
}: {
    history: HistoryEntry[];
    defaultMonth: string;
    preview?: Preview;
}) {
    const flash = usePage<{ flash: { import: Summary | null } }>().props.flash;

    useEffect(() => {
        if (flash?.import) {
            const { created, updated } = flash.import;
            toast.success(
                `Import applied: ${created} added, ${updated} updated.`,
            );
        }
    }, [flash?.import]);

    const upload = useForm<{ month: string; file: File | null }>({
        month: defaultMonth,
        file: null,
    });

    const submitUpload = (event: React.FormEvent) => {
        event.preventDefault();
        upload.post(previewRoute().url, { forceFormData: true });
    };

    const confirmImport = () => {
        if (!preview) {
            return;
        }

        router.post(
            store().url,
            { token: preview.token },
            { preserveScroll: true },
        );
    };

    const applicable = preview
        ? preview.summary.created + preview.summary.updated
        : 0;

    return (
        <>
            <Head title="Import schedule" />

            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <Heading
                        title="Import schedule"
                        description="Upload the hospital's monthly OPD workbook. Nothing is saved until you confirm the preview."
                    />
                    <Button variant="outline" asChild>
                        <Link href={scheduleColumns()}>Column mapping</Link>
                    </Button>
                </div>

                <form
                    onSubmit={submitUpload}
                    className="flex flex-wrap items-end gap-3 rounded-lg border p-4"
                >
                    <div className="grid gap-1">
                        <Label htmlFor="month">Schedule month</Label>
                        <Input
                            id="month"
                            type="month"
                            value={upload.data.month}
                            onChange={(event) =>
                                upload.setData('month', event.target.value)
                            }
                            className="w-44"
                        />
                        <InputError message={upload.errors.month} />
                    </div>

                    <div className="grid gap-1">
                        <Label htmlFor="file">Excel file</Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(event) =>
                                upload.setData(
                                    'file',
                                    event.target.files?.[0] ?? null,
                                )
                            }
                            className="w-80"
                        />
                        <InputError message={upload.errors.file} />
                    </div>

                    <Button
                        type="submit"
                        disabled={upload.processing || !upload.data.file}
                    >
                        {upload.processing ? 'Reading…' : 'Upload & preview'}
                    </Button>
                </form>

                {preview && (
                    <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="font-medium">
                                    Preview — {preview.filename}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {preview.month} · nothing has been saved yet
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        router.get(scheduleImports().url)
                                    }
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={confirmImport}
                                    disabled={applicable === 0}
                                >
                                    Confirm import ({applicable})
                                </Button>
                            </div>
                        </div>

                        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                            <Stat
                                label="Doctors"
                                value={preview.summary.doctors}
                            />
                            <Stat label="Days" value={preview.summary.days} />
                            <Stat label="New" value={preview.summary.created} />
                            <Stat
                                label="Modified"
                                value={preview.summary.updated}
                            />
                            <Stat
                                label="Unchanged"
                                value={preview.summary.unchanged}
                            />
                            <Stat
                                label="Booked conflicts"
                                value={preview.summary.conflicts}
                                alert={preview.summary.conflicts > 0}
                            />
                            <Stat
                                label="Unreadable"
                                value={preview.summary.errors}
                                alert={preview.summary.errors > 0}
                            />
                        </dl>

                        {preview.warnings.length > 0 && (
                            <ul className="list-inside list-disc rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                                {preview.warnings.map((warning) => (
                                    <li key={warning}>{warning}</li>
                                ))}
                            </ul>
                        )}

                        {preview.rows.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                This workbook matches what is already stored.
                            </p>
                        ) : (
                            <div className="max-h-[28rem] overflow-auto rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-muted/90 text-left backdrop-blur">
                                        <tr>
                                            <th className="p-2 font-medium">
                                                Doctor
                                            </th>
                                            <th className="p-2 font-medium">
                                                Department
                                            </th>
                                            <th className="p-2 font-medium">
                                                Date
                                            </th>
                                            <th className="p-2 font-medium">
                                                Current
                                            </th>
                                            <th className="p-2 font-medium">
                                                From Excel
                                            </th>
                                            <th className="p-2 font-medium">
                                                Change
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.rows.map((row) => (
                                            <tr
                                                key={`${row.doctor_id}-${row.date}`}
                                                className="border-t align-top"
                                            >
                                                <td className="p-2">
                                                    {row.doctor}
                                                </td>
                                                <td className="p-2 text-muted-foreground">
                                                    {row.department}
                                                </td>
                                                <td className="p-2 whitespace-nowrap">
                                                    {row.date}
                                                </td>
                                                <td className="p-2 text-muted-foreground">
                                                    {row.current || '—'}
                                                </td>
                                                <td className="p-2">
                                                    {row.incoming || '—'}
                                                </td>
                                                <td className="p-2">
                                                    <span
                                                        className={`inline-block rounded px-2 py-0.5 text-xs ${changeStyles[row.change]}`}
                                                    >
                                                        {
                                                            changeLabels[
                                                                row.change
                                                            ]
                                                        }
                                                    </span>
                                                    {row.message && (
                                                        <p className="mt-1 max-w-md text-xs text-muted-foreground">
                                                            {row.message}
                                                        </p>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    <h2 className="font-medium">Import history</h2>
                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="p-3 font-medium">Month</th>
                                    <th className="p-3 font-medium">File</th>
                                    <th className="p-3 font-medium">By</th>
                                    <th className="p-3 font-medium">When</th>
                                    <th className="p-3 font-medium">Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length === 0 && (
                                    <tr className="border-t">
                                        <td
                                            colSpan={5}
                                            className="p-3 text-muted-foreground"
                                        >
                                            No workbook has been imported yet.
                                        </td>
                                    </tr>
                                )}
                                {history.map((entry) => (
                                    <tr key={entry.id} className="border-t">
                                        <td className="p-3">{entry.month}</td>
                                        <td className="p-3">
                                            {entry.filename}
                                        </td>
                                        <td className="p-3">
                                            {entry.imported_by ?? 'Unknown'}
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {entry.imported_at}
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {entry.summary.created} new,{' '}
                                            {entry.summary.updated} modified,{' '}
                                            {entry.summary.conflicts} skipped
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

function Stat({
    label,
    value,
    alert = false,
}: {
    label: string;
    value: number;
    alert?: boolean;
}) {
    return (
        <div className="rounded-md border p-3">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd
                className={`text-lg font-medium ${alert ? 'text-destructive' : ''}`}
            >
                {value}
            </dd>
        </div>
    );
}

ScheduleImportsIndex.layout = {
    breadcrumbs: [
        { title: 'Import schedule', href: scheduleImports() },
    ] satisfies BreadcrumbItem[],
};
