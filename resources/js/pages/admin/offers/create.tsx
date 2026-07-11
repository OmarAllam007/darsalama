import { Head } from '@inertiajs/react';
import OfferController from '@/actions/App/Http/Controllers/Admin/OfferController';
import Heading from '@/components/heading';
import { index } from '@/routes/admin/offers';
import type { BreadcrumbItem } from '@/types';
import OfferForm from './offer-form';

type Department = {
    id: number;
    name: string;
};

export default function CreateOffer({
    departments,
}: {
    departments: Department[];
}) {
    return (
        <>
            <Head title="New offer" />

            <div className="max-w-2xl space-y-6 p-4">
                <Heading title="New offer" />

                <OfferForm
                    form={OfferController.store.form()}
                    departments={departments}
                />
            </div>
        </>
    );
}

CreateOffer.layout = {
    breadcrumbs: [
        { title: 'Offers', href: index() },
        { title: 'New', href: '#' },
    ] satisfies BreadcrumbItem[],
};
