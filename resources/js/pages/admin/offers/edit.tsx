import { Head } from '@inertiajs/react';
import OfferController from '@/actions/App/Http/Controllers/Admin/OfferController';
import Heading from '@/components/heading';
import { index } from '@/routes/admin/offers';
import type { BreadcrumbItem } from '@/types';
import OfferForm from './offer-form';

type Doctor = {
    id: number;
    name: string;
    department: {
        id: number;
        name: string;
    };
};

type Offer = {
    id: number;
    doctor_id: number;
    title: string;
    description: string;
    image: string | null;
    price: string | null;
    original_price: string | null;
    is_expired: boolean;
};

export default function EditOffer({
    offer,
    doctors,
}: {
    offer: Offer;
    doctors: Doctor[];
}) {
    return (
        <>
            <Head title={`Edit ${offer.title}`} />

            <div className="max-w-2xl space-y-6 p-4">
                <Heading title={`Edit ${offer.title}`} />

                <OfferForm
                    form={OfferController.update.form(offer.id)}
                    doctors={doctors}
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
