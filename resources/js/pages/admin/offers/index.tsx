import { Head, Link, router } from '@inertiajs/react';
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
    price: string | null;
    original_price: string | null;
    is_expired: boolean;
    doctor: {
        id: number;
        name: string;
        department: {
            id: number;
            name: string;
        };
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
                        description="Manage promotional offers for each doctor"
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
                                <th className="p-3 font-medium">Doctor</th>
                                <th className="p-3 font-medium">Price</th>
                                <th className="p-3 font-medium">Status</th>
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
                                        {offer.doctor.name} —{' '}
                                        {offer.doctor.department.name}
                                    </td>
                                    <td className="p-3">
                                        {offer.price ? (
                                            <>
                                                {offer.original_price && (
                                                    <span className="mr-1 text-muted-foreground line-through">
                                                        {
                                                            offer.original_price
                                                        }
                                                    </span>
                                                )}
                                                {offer.price} SAR
                                            </>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {offer.is_expired ? (
                                            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                                                Expired
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="space-x-3 p-3 text-right">
                                        {offer.is_expired && (
                                            <button
                                                type="button"
                                                className="text-sm underline"
                                                onClick={() =>
                                                    router.patch(
                                                        OfferController.restore.url(
                                                            offer.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                Restore original price
                                            </button>
                                        )}
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
                                        colSpan={6}
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
