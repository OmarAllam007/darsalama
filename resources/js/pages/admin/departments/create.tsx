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

export default function CreateDepartment() {
    return (
        <>
            <Head title="New department" />

            <div className="max-w-lg space-y-6 p-4">
                <Heading title="New department" />

                <Form
                    {...DepartmentController.store.form()}
                    className="space-y-6"
                    onSuccess={() => toast.success('Department created.')}
                    onError={() => toast.error('Please fix the errors below.')}
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    autoFocus
                                    placeholder="Ophthalmology"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name_ar">Arabic name</Label>
                                <Input
                                    id="name_ar"
                                    name="name_ar"
                                    dir="rtl"
                                    required
                                    placeholder="طب العيون"
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
                                    defaultValue={15}
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

CreateDepartment.layout = {
    breadcrumbs: [
        { title: 'Departments', href: index() },
        { title: 'New', href: '#' },
    ] satisfies BreadcrumbItem[],
};
