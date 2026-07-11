import { Head } from '@inertiajs/react';
import NationalityController from '@/actions/App/Http/Controllers/Admin/NationalityController';
import Heading from '@/components/heading';
import { index } from '@/routes/admin/nationalities';
import type { BreadcrumbItem } from '@/types';
import NationalityForm from './nationality-form';

export default function CreateNationality() {
    return (
        <>
            <Head title="New nationality" />

            <div className="max-w-lg space-y-6 p-4">
                <Heading title="New nationality" />

                <NationalityForm form={NationalityController.store.form()} />
            </div>
        </>
    );
}

CreateNationality.layout = {
    breadcrumbs: [
        { title: 'Nationalities', href: index() },
        { title: 'New', href: '#' },
    ] satisfies BreadcrumbItem[],
};
