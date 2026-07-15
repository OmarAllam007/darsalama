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

type Doctor = {
    id: number;
    code: string;
    name: string;
    name_ar: string;
    job: string;
    job_ar: string;
    department_id: number;
    nationality_id: number | null;
    image: string | null;
    is_active: boolean;
    availabilities: {
        weekday: number;
        start_time: string;
        end_time: string;
        slot_minutes: number;
    }[];
    qualifications: {
        name: string;
        name_ar: string;
    }[];
    services: {
        name: string;
        name_ar: string;
    }[];
};

export default function EditDoctor({
    doctor,
    departments,
    nationalities,
}: {
    doctor: Doctor;
    departments: Department[];
    nationalities: Nationality[];
}) {
    return (
        <>
            <Head title={`Edit ${doctor.name}`} />

            <div className="max-w-2xl space-y-6 p-4">
                <Heading title={`Edit ${doctor.name}`} />

                <DoctorForm
                    form={DoctorController.update.form(doctor.id)}
                    departments={departments}
                    nationalities={nationalities}
                    doctor={doctor}
                    imageUrl={doctor.image ? `/storage/${doctor.image}` : null}
                />
            </div>
        </>
    );
}

EditDoctor.layout = {
    breadcrumbs: [
        { title: 'Doctors', href: index() },
        { title: 'Edit', href: '#' },
    ] satisfies BreadcrumbItem[],
};
