import { Head, useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    index as scheduleColumns,
    update,
} from '@/routes/admin/schedule-columns';
import type { BreadcrumbItem } from '@/types';

type Doctor = { id: number; name: string; column: string | null };
type Department = { id: number; name: string; doctors: Doctor[] };

export default function ScheduleColumnsIndex({
    departments,
}: {
    departments: Department[];
}) {
    const initial: Record<number, string> = {};

    for (const department of departments) {
        for (const doctor of department.doctors) {
            initial[doctor.id] = doctor.column ?? '';
        }
    }

    const { data, setData, put, processing, errors, isDirty } = useForm({
        columns: initial,
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        put(update().url, {
            preserveScroll: true,
            onSuccess: () => toast.success('Column mapping saved.'),
        });
    };

    return (
        <>
            <Head title="Excel column mapping" />

            <form onSubmit={submit} className="space-y-6 p-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <Heading
                        title="Excel column mapping"
                        description="Which column of the hospital's monthly OPD workbook belongs to each doctor. The import matches on position only — the name printed in the sheet is ignored."
                    />
                    <Button type="submit" disabled={processing || !isDirty}>
                        {processing ? 'Saving…' : 'Save mapping'}
                    </Button>
                </div>

                <InputError message={errors.columns} />

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {departments.map((department) => (
                        <div
                            key={department.id}
                            className="overflow-hidden rounded-lg border"
                        >
                            <div className="bg-muted/50 px-3 py-2 text-sm font-medium">
                                {department.name}
                            </div>
                            <table className="w-full text-sm">
                                <tbody>
                                    {department.doctors.map((doctor) => (
                                        <tr
                                            key={doctor.id}
                                            className="border-t"
                                        >
                                            <td className="p-2">
                                                {doctor.name}
                                            </td>
                                            <td className="w-24 p-2">
                                                <Input
                                                    aria-label={`Excel column for ${doctor.name}`}
                                                    value={
                                                        data.columns[
                                                            doctor.id
                                                        ] ?? ''
                                                    }
                                                    maxLength={3}
                                                    placeholder="—"
                                                    className="h-8 text-center uppercase"
                                                    onChange={(event) =>
                                                        setData('columns', {
                                                            ...data.columns,
                                                            [doctor.id]:
                                                                event.target.value.toUpperCase(),
                                                        })
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </form>
        </>
    );
}

ScheduleColumnsIndex.layout = {
    breadcrumbs: [
        { title: 'Excel column mapping', href: scheduleColumns() },
    ] satisfies BreadcrumbItem[],
};
