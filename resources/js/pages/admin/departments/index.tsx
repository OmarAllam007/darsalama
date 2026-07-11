import { Head, Link } from '@inertiajs/react';
import DepartmentController from '@/actions/App/Http/Controllers/Admin/DepartmentController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { deleteWithConfirm } from '@/lib/delete-with-confirm';
import { index as departmentsIndex } from '@/routes/admin/departments';
import type { BreadcrumbItem } from '@/types';

type Department = {
    id: number;
    name: string;
    name_ar: string;
    doctors_count: number;
};

export default function DepartmentsIndex({
    departments,
}: {
    departments: Department[];
}) {
    return (
        <>
            <Head title="Departments" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Departments"
                        description="Manage the specialties doctors belong to"
                    />
                    <Button asChild>
                        <Link href={DepartmentController.create()}>
                            New department
                        </Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="p-3 font-medium">Name</th>
                                <th className="p-3 font-medium">Arabic name</th>
                                <th className="p-3 font-medium">Doctors</th>
                                <th className="p-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((department) => (
                                <tr key={department.id} className="border-t">
                                    <td className="p-3">{department.name}</td>
                                    <td className="p-3" dir="rtl">
                                        {department.name_ar}
                                    </td>
                                    <td className="p-3">
                                        {department.doctors_count}
                                    </td>
                                    <td className="space-x-3 p-3 text-right">
                                        <Link
                                            className="text-sm underline"
                                            href={DepartmentController.edit(
                                                department.id,
                                            )}
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="text-sm text-destructive underline"
                                            data-test="delete-department-button"
                                            onClick={() =>
                                                deleteWithConfirm(
                                                    DepartmentController.destroy.url(
                                                        department.id,
                                                    ),
                                                    department.name,
                                                    'Its doctors will be deleted too.',
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {departments.length === 0 && (
                                <tr>
                                    <td
                                        className="p-3 text-muted-foreground"
                                        colSpan={4}
                                    >
                                        No departments yet.
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

DepartmentsIndex.layout = {
    breadcrumbs: [
        { title: 'Departments', href: departmentsIndex() },
    ] satisfies BreadcrumbItem[],
};
