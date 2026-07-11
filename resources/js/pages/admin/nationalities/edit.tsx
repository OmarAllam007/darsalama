import { Head } from '@inertiajs/react';
import NationalityController from '@/actions/App/Http/Controllers/Admin/NationalityController';
import Heading from '@/components/heading';
import { index } from '@/routes/admin/nationalities';
import type { BreadcrumbItem } from '@/types';
import NationalityForm from './nationality-form';

type Nationality = {
    id: number;
    name: string;
    name_ar: string;
    flag: string | null;
};

export default function EditNationality({
    nationality,
}: {
    nationality: Nationality;
}) {
    return (
        <>
            <Head title={`Edit ${nationality.name}`} />

            <div className="max-w-lg space-y-6 p-4">
                <Heading title={`Edit ${nationality.name}`} />

                <NationalityForm
                    form={NationalityController.update.form(nationality.id)}
                    nationality={nationality}
                />
            </div>
        </>
    );
}

EditNationality.layout = {
    breadcrumbs: [
        { title: 'Nationalities', href: index() },
        { title: 'Edit', href: '#' },
    ] satisfies BreadcrumbItem[],
};
