import { Head } from '@inertiajs/react';
import DoctorController from '@/actions/App/Http/Controllers/Admin/DoctorController';
import Heading from '@/components/heading';
import { index } from '@/routes/admin/doctors';
import type { BreadcrumbItem } from '@/types';
import DoctorForm from './doctor-form';

type Department = {
    id: number;
    name: string;
};

type Nationality = {
    id: number;
    name: string;
};

export default function CreateDoctor({
    departments,
    nationalities,
}: {
    departments: Department[];
    nationalities: Nationality[];
}) {
    return (
        <>
            <Head title="New doctor" />

            <div className="max-w-2xl space-y-6 p-4">
                <Heading title="New doctor" />

                <DoctorForm
                    form={DoctorController.store.form()}
                    departments={departments}
                    nationalities={nationalities}
                />
            </div>
        </>
    );
}

CreateDoctor.layout = {
    breadcrumbs: [
        { title: 'Doctors', href: index() },
        { title: 'New', href: '#' },
    ] satisfies BreadcrumbItem[],
};
