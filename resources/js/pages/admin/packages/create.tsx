import { Head } from '@inertiajs/react';
import PackageController from '@/actions/App/Http/Controllers/Admin/PackageController';
import Heading from '@/components/heading';
import { index } from '@/routes/admin/packages';
import type { BreadcrumbItem } from '@/types';
import PackageForm from './package-form';

type Department = {
    id: number;
    name: string;
};

export default function CreatePackage({
    departments,
}: {
    departments: Department[];
}) {
    return (
        <>
            <Head title="New package" />

            <div className="max-w-2xl space-y-6 p-4">
                <Heading title="New package" />

                <PackageForm
                    form={PackageController.store.form()}
                    departments={departments}
                />
            </div>
        </>
    );
}

CreatePackage.layout = {
    breadcrumbs: [
        { title: 'Packages', href: index() },
        { title: 'New', href: '#' },
    ] satisfies BreadcrumbItem[],
};
