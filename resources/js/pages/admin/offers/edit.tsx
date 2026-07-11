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

type Offer = {
    id: number;
    department_id: number;
    title: string;
    description: string;
    image: string | null;
};

export default function EditOffer({
    offer,
    departments,
}: {
    offer: Offer;
    departments: Department[];
}) {
    return (
        <>
            <Head title={`Edit ${offer.title}`} />

            <div className="max-w-2xl space-y-6 p-4">
                <Heading title={`Edit ${offer.title}`} />

                <OfferForm
                    form={OfferController.update.form(offer.id)}
                    departments={departments}
                    offer={offer}
                    imageUrl={offer.image ? `/storage/${offer.image}` : null}
                />
            </div>
        </>
    );
}

EditOffer.layout = {
    breadcrumbs: [
        { title: 'Offers', href: index() },
        { title: 'Edit', href: '#' },
    ] satisfies BreadcrumbItem[],
};
