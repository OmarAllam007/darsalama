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

type Doctor = { id: number; name: string; upload_name: string | null };
type Department = { id: number; name: string; doctors: Doctor[] };

export default function ScheduleColumnsIndex({
    departments,
}: {
    departments: Department[];
}) {
    const initial: Record<number, string> = {};

    for (const department of departments) {
        for (const doctor of department.doctors) {
            initial[doctor.id] = doctor.upload_name ?? '';
        }
    }

    const { data, setData, put, processing, errors, isDirty } = useForm({
        upload_names: initial,
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        put(update().url, {
            preserveScroll: true,
            onSuccess: () => toast.success('Upload-name mapping saved.'),
        });
    };

    return (
        <>
            <Head title="Schedule upload names" />

            <form onSubmit={submit} className="space-y-6 p-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <Heading
                        title="Schedule upload names"
                        description="Set the exact doctor title used in the OPD sheet header for each doctor. Import now matches by sheet name, not by fixed column position."
                    />
                    <Button type="submit" disabled={processing || !isDirty}>
                        {processing ? 'Saving…' : 'Save mapping'}
                    </Button>
                </div>

                <InputError message={errors.upload_names} />

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
                                            <td className="w-56 p-2">
                                                <Input
                                                    aria-label={`Sheet upload name for ${doctor.name}`}
                                                    value={
                                                        data.upload_names[
                                                            doctor.id
                                                        ] ?? ''
                                                    }
                                                    maxLength={120}
                                                    placeholder="e.g. Dr. Ehab"
                                                    className="h-8"
                                                    onChange={(event) =>
                                                        setData('upload_names', {
                                                            ...data.upload_names,
                                                            [doctor.id]:
                                                                event.target.value,
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
        { title: 'Schedule upload names', href: scheduleColumns() },
    ] satisfies BreadcrumbItem[],
};
