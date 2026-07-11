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

type Package = {
    id: number;
    department_id: number;
    name: string;
    name_ar: string;
    description: string;
    price: string;
};

export default function EditPackage({
    package: pkg,
    departments,
}: {
    package: Package;
    departments: Department[];
}) {
    return (
        <>
            <Head title={`Edit ${pkg.name}`} />

            <div className="max-w-lg space-y-6 p-4">
                <Heading title={`Edit ${pkg.name}`} />

                <PackageForm
                    form={PackageController.update.form(pkg.id)}
                    departments={departments}
                    pkg={pkg}
                />
            </div>
        </>
    );
}

EditPackage.layout = {
    breadcrumbs: [
        { title: 'Packages', href: index() },
        { title: 'Edit', href: '#' },
    ] satisfies BreadcrumbItem[],
};
