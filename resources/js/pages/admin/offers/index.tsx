import { Head, Link } from '@inertiajs/react';
import OfferController from '@/actions/App/Http/Controllers/Admin/OfferController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { deleteWithConfirm } from '@/lib/delete-with-confirm';
import { index as offersIndex } from '@/routes/admin/offers';
import type { BreadcrumbItem } from '@/types';

type Offer = {
    id: number;
    title: string;
    image: string | null;
    department: {
        id: number;
        name: string;
    };
};

export default function OffersIndex({ offers }: { offers: Offer[] }) {
    return (
        <>
            <Head title="Offers" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Offers"
                        description="Manage promotional offers for each department"
                    />
                    <Button asChild>
                        <Link href={OfferController.create()}>New offer</Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="p-3 font-medium">Image</th>
                                <th className="p-3 font-medium">Title</th>
                                <th className="p-3 font-medium">Department</th>
                                <th className="p-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {offers.map((offer) => (
                                <tr key={offer.id} className="border-t">
                                    <td className="p-3">
                                        {offer.image && (
                                            <img
                                                src={`/storage/${offer.image}`}
                                                alt={offer.title}
                                                className="h-10 w-16 rounded object-cover"
                                            />
                                        )}
                                    </td>
                                    <td className="p-3">{offer.title}</td>
                                    <td className="p-3">
                                        {offer.department.name}
                                    </td>
                                    <td className="space-x-3 p-3 text-right">
                                        <Link
                                            className="text-sm underline"
                                            href={OfferController.edit(
                                                offer.id,
                                            )}
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="text-sm text-destructive underline"
                                            data-test="delete-offer-button"
                                            onClick={() =>
                                                deleteWithConfirm(
                                                    OfferController.destroy.url(
                                                        offer.id,
                                                    ),
                                                    offer.title,
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {offers.length === 0 && (
                                <tr>
                                    <td
                                        className="p-3 text-muted-foreground"
                                        colSpan={4}
                                    >
                                        No offers yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

OffersIndex.layout = {
    breadcrumbs: [
        { title: 'Offers', href: offersIndex() },
    ] satisfies BreadcrumbItem[],
};
