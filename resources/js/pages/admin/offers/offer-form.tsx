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

type Offer = {
    department_id: number;
    title: string;
    description: string;
};

export default function OfferForm({
    form,
    departments,
    offer,
    imageUrl,
}: {
    form: RouteFormDefinition<'post' | 'put'>;
    departments: Department[];
    offer?: Offer;
    imageUrl?: string | null;
}) {
    return (
        <Form
            {...form}
            encType="multipart/form-data"
            className="space-y-6"
            onSuccess={() =>
                toast.success(offer ? 'Offer updated.' : 'Offer created.')
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
                            defaultValue={offer?.department_id}
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
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            defaultValue={offer?.title}
                            required
                            autoFocus
                            placeholder="Summer checkup discount"
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={offer?.description}
                            required
                            rows={4}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="image">Image</Label>
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt="Current"
                                className="h-24 w-40 rounded-md object-cover"
                            />
                        )}
                        <Input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                        />
                        <InputError message={errors.image} />
                    </div>

                    <Button disabled={processing}>Save</Button>
                </>
            )}
        </Form>
    );
}
