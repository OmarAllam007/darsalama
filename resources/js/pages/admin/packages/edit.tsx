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

type Feature = {
    is_highlighted: boolean;
    label_en: string;
    label_ar: string;
    label_ur: string | null;
    label_tl: string | null;
};

type PriceTier = {
    label_en: string;
    label_ar: string;
    label_ur: string | null;
    label_tl: string | null;
    amount: string;
};

type StageTest = {
    name: string;
    code: string | null;
};

type Stage = {
    name_en: string;
    name_ar: string;
    name_ur: string | null;
    name_tl: string | null;
    subtitle_en: string | null;
    subtitle_ar: string | null;
    free_consultations: number;
    tests: StageTest[];
};

type Package = {
    id: number;
    department_id: number;
    slug: string | null;
    type: 'delivery' | 'care' | 'transport';
    name_en: string;
    name_ar: string;
    name_ur: string | null;
    name_tl: string | null;
    category_label_en: string | null;
    category_label_ar: string | null;
    category_label_ur: string | null;
    category_label_tl: string | null;
    description_en: string | null;
    description_ar: string | null;
    description_ur: string | null;
    description_tl: string | null;
    tagline_en: string | null;
    tagline_ar: string | null;
    tagline_ur: string | null;
    tagline_tl: string | null;
    price: string | null;
    original_price: string | null;
    sort_order: number;
    is_active: boolean;
    features: Feature[];
    price_tiers: PriceTier[];
    stages: Stage[];
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
            <Head title={`Edit ${pkg.name_en}`} />

            <div className="max-w-2xl space-y-6 p-4">
                <Heading title={`Edit ${pkg.name_en}`} />

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
