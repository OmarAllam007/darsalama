import { Form } from '@inertiajs/react';
import toast from 'react-hot-toast';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RouteFormDefinition } from '@/wayfinder';

type Nationality = {
    name: string;
    name_ar: string;
    flag: string | null;
};

export default function NationalityForm({
    form,
    nationality,
}: {
    form: RouteFormDefinition<'post' | 'put'>;
    nationality?: Nationality;
}) {
    return (
        <Form
            {...form}
            encType="multipart/form-data"
            className="space-y-6"
            onSuccess={() =>
                toast.success(
                    nationality
                        ? 'Nationality updated.'
                        : 'Nationality created.',
                )
            }
            onError={() => toast.error('Please fix the errors below.')}
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={nationality?.name}
                            required
                            autoFocus
                            placeholder="Egyptian"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name_ar">Arabic name</Label>
                        <Input
                            id="name_ar"
                            name="name_ar"
                            dir="rtl"
                            defaultValue={nationality?.name_ar}
                            required
                        />
                        <InputError message={errors.name_ar} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="flag">Flag image</Label>
                        {nationality?.flag && (
                            <img
                                src={nationality.flag}
                                alt="Current flag"
                                className="h-8 w-12 rounded-sm border object-cover"
                            />
                        )}
                        <Input
                            id="flag"
                            name="flag"
                            type="file"
                            accept="image/*"
                        />
                        <p className="text-xs text-muted-foreground">
                            PNG, JPG or SVG. Recommended a rectangular flag,
                            up to 2MB.
                        </p>
                        <InputError message={errors.flag} />
                    </div>

                    <Button disabled={processing}>Save</Button>
                </>
            )}
        </Form>
    );
}
