import { Form, Head } from '@inertiajs/react';
import toast from 'react-hot-toast';
import DepartmentController from '@/actions/App/Http/Controllers/Admin/DepartmentController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/admin/departments';
import type { BreadcrumbItem } from '@/types';

type Department = {
    id: number;
    name: string;
    name_ar: string;
    slot_minutes: number;
};

export default function EditDepartment({
    department,
}: {
    department: Department;
}) {
    return (
        <>
            <Head title={`Edit ${department.name}`} />

            <div className="max-w-lg space-y-6 p-4">
                <Heading title={`Edit ${department.name}`} />

                <Form
                    {...DepartmentController.update.form(department.id)}
                    className="space-y-6"
                    onSuccess={() => toast.success('Department updated.')}
                    onError={() => toast.error('Please fix the errors below.')}
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={department.name}
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name_ar">Arabic name</Label>
                                <Input
                                    id="name_ar"
                                    name="name_ar"
                                    dir="rtl"
                                    defaultValue={department.name_ar}
                                    required
                                />
                                <InputError message={errors.name_ar} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slot_minutes">
                                    Appointment duration (minutes)
                                </Label>
                                <Input
                                    id="slot_minutes"
                                    name="slot_minutes"
                                    type="number"
                                    min={5}
                                    max={240}
                                    step={5}
                                    defaultValue={department.slot_minutes}
                                    required
                                />
                                <InputError message={errors.slot_minutes} />
                            </div>

                            <Button disabled={processing}>Save</Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

EditDepartment.layout = {
    breadcrumbs: [
        { title: 'Departments', href: index() },
        { title: 'Edit', href: '#' },
    ] satisfies BreadcrumbItem[],
};
