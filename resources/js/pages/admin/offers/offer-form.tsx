import { Form } from '@inertiajs/react';
import toast from 'react-hot-toast';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { RouteFormDefinition } from '@/wayfinder';

type Doctor = {
    id: number;
    name: string;
    department: {
        id: number;
        name: string;
    };
};

type Offer = {
    doctor_id: number;
    title: string;
    description: string;
    price: string | null;
    original_price: string | null;
    is_expired: boolean;
};

export default function OfferForm({
    form,
    doctors,
    offer,
    imageUrl,
}: {
    form: RouteFormDefinition<'post' | 'put'>;
    doctors: Doctor[];
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
                        <Label htmlFor="doctor_id">Doctor</Label>
                        <select
                            id="doctor_id"
                            name="doctor_id"
                            defaultValue={offer?.doctor_id}
                            required
                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none"
                        >
                            {doctors.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                    {doctor.name} — {doctor.department.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.doctor_id} />
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Offer price (SAR)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={offer?.price ?? ''}
                                placeholder="149.00"
                            />
                            <InputError message={errors.price} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="original_price">
                                Original price (SAR)
                            </Label>
                            <Input
                                id="original_price"
                                name="original_price"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={offer?.original_price ?? ''}
                                placeholder="199.00"
                            />
                            <InputError message={errors.original_price} />
                        </div>
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

                    <div className="flex items-center gap-2">
                        <input type="hidden" name="is_expired" value="0" />
                        <Checkbox
                            id="is_expired"
                            name="is_expired"
                            value="1"
                            defaultChecked={offer?.is_expired ?? false}
                        />
                        <Label htmlFor="is_expired">
                            Expired (shows the original price on the site
                            instead of the offer price)
                        </Label>
                    </div>

                    <Button disabled={processing}>Save</Button>
                </>
            )}
        </Form>
    );
}
