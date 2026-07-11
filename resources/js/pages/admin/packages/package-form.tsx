import { Form } from '@inertiajs/react';
import toast from 'react-hot-toast';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { RouteFormDefinition } from '@/wayfinder';

type Department = {
    id: number;
    name: string;
};

type Package = {
    department_id: number;
    name: string;
    name_ar: string;
    description: string;
    price: string;
};

export default function PackageForm({
    form,
    departments,
    pkg,
}: {
    form: RouteFormDefinition<'post' | 'put'>;
    departments: Department[];
    pkg?: Package;
}) {
    return (
        <Form
            {...form}
            className="space-y-6"
            onSuccess={() =>
                toast.success(pkg ? 'Package updated.' : 'Package created.')
            }
            onError={() => toast.error('Please fix the errors below.')}
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="department_id">Department</Label>
                        <select
                            id="department_id"
                            name="department_id"
                            defaultValue={pkg?.department_id}
                            required
                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none"
                        >
                            {departments.map((department) => (
                                <option
                                    key={department.id}
                                    value={department.id}
                                >
                                    {department.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.department_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={pkg?.name}
                            required
                            autoFocus
                            placeholder="Full Checkup"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name_ar">Arabic name</Label>
                        <Input
                            id="name_ar"
                            name="name_ar"
                            dir="rtl"
                            defaultValue={pkg?.name_ar}
                            required
                        />
                        <InputError message={errors.name_ar} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={pkg?.description}
                            required
                            rows={4}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            min={0}
                            step="0.01"
                            defaultValue={pkg?.price}
                            required
                        />
                        <InputError message={errors.price} />
                    </div>

                    <Button disabled={processing}>Save</Button>
                </>
            )}
        </Form>
    );
}
