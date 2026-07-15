import { Head, Link } from '@inertiajs/react';
import DoctorController from '@/actions/App/Http/Controllers/Admin/DoctorController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { deleteWithConfirm } from '@/lib/delete-with-confirm';
import { index as doctorsIndex } from '@/routes/admin/doctors';
import type { BreadcrumbItem } from '@/types';

type Doctor = {
    id: number;
    code: string;
    name: string;
    name_ar: string;
    image: string | null;
    is_active: boolean;
    department: { id: number; name: string };
};

export default function DoctorsIndex({ doctors }: { doctors: Doctor[] }) {
    return (
        <>
            <Head title="Doctors" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Doctors"
                        description="Manage the doctors shown on the public site"
                    />
                    <Button asChild>
                        <Link href={DoctorController.create()}>New doctor</Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="p-3 font-medium">Code</th>
                                <th className="p-3 font-medium">Doctor</th>
                                <th className="p-3 font-medium">Department</th>
                                <th className="p-3 font-medium">Status</th>
                                <th className="p-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map((doctor) => (
                                <tr key={doctor.id} className="border-t">
                                    <td className="p-3 font-mono text-xs text-muted-foreground">
                                        {doctor.code}
                                    </td>
                                    <td className="flex items-center gap-3 p-3">
                                        {doctor.image ? (
                                            <img
                                                src={`/storage/${doctor.image}`}
                                                alt={doctor.name}
                                                className="size-9 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="size-9 rounded-full bg-muted" />
                                        )}
                                        {doctor.name}
                                    </td>
                                    <td className="p-3">
                                        {doctor.department.name}
                                    </td>
                                    <td className="p-3">
                                        <Badge
                                            variant={
                                                doctor.is_active
                                                    ? 'success'
                                                    : 'secondary'
                                            }
                                        >
                                            {doctor.is_active
                                                ? 'Active'
                                                : 'Hidden'}
                                        </Badge>
                                    </td>
                                    <td className="space-x-3 p-3 text-right">
                                        <Link
                                            className="text-sm underline"
                                            href={DoctorController.edit(
                                                doctor.id,
                                            )}
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="text-sm text-destructive underline"
                                            onClick={() =>
                                                deleteWithConfirm(
                                                    DoctorController.destroy.url(
                                                        doctor.id,
                                                    ),
                                                    doctor.name,
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {doctors.length === 0 && (
                                <tr>
                                    <td
                                        className="p-3 text-muted-foreground"
                                        colSpan={5}
                                    >
                                        No doctors yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

DoctorsIndex.layout = {
    breadcrumbs: [
        { title: 'Doctors', href: doctorsIndex() },
    ] satisfies BreadcrumbItem[],
};
