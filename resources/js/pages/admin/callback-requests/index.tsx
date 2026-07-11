import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { index as callbackRequestsIndex } from '@/routes/admin/callback-requests';
import type { BreadcrumbItem } from '@/types';

type CallbackRequest = {
    id: number;
    name: string;
    phone: string;
    package_of_interest: string | null;
    best_time: string | null;
    preferred_contact: string;
    notes: string | null;
    status: string;
    created_at: string;
    doctor: { id: number; name: string } | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
};

export default function CallbackRequestsIndex({
    callbackRequests,
}: {
    callbackRequests: Paginated<CallbackRequest>;
}) {
    return (
        <>
            <Head title="Callback Requests" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Callback Requests"
                    description="Requests submitted from doctor profile pages on the public site"
                />

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="p-3 font-medium">Name</th>
                                <th className="p-3 font-medium">Phone</th>
                                <th className="p-3 font-medium">Doctor</th>
                                <th className="p-3 font-medium">
                                    Package of interest
                                </th>
                                <th className="p-3 font-medium">Best time</th>
                                <th className="p-3 font-medium">
                                    Preferred contact
                                </th>
                                <th className="p-3 font-medium">Notes</th>
                                <th className="p-3 font-medium">Received</th>
                            </tr>
                        </thead>
                        <tbody>
                            {callbackRequests.data.map((request) => (
                                <tr key={request.id} className="border-t">
                                    <td className="p-3">{request.name}</td>
                                    <td className="p-3">
                                        <a
                                            href={`tel:${request.phone}`}
                                            className="text-primary underline-offset-2 hover:underline"
                                        >
                                            {request.phone}
                                        </a>
                                    </td>
                                    <td className="p-3">
                                        {request.doctor?.name ?? '—'}
                                    </td>
                                    <td className="p-3">
                                        {request.package_of_interest ?? '—'}
                                    </td>
                                    <td className="p-3">
                                        {request.best_time ?? '—'}
                                    </td>
                                    <td className="p-3">
                                        <Badge
                                            variant="secondary"
                                            className="capitalize"
                                        >
                                            {request.preferred_contact}
                                        </Badge>
                                    </td>
                                    <td className="max-w-xs truncate p-3 text-muted-foreground">
                                        {request.notes ?? '—'}
                                    </td>
                                    <td className="p-3 text-muted-foreground">
                                        {new Date(
                                            request.created_at,
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {callbackRequests.data.length === 0 && (
                                <tr>
                                    <td
                                        className="p-3 text-muted-foreground"
                                        colSpan={8}
                                    >
                                        No callback requests yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {callbackRequests.links.length > 3 && (
                    <div className="flex flex-wrap gap-2">
                        {callbackRequests.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                preserveScroll
                                className={`rounded-md border px-3 py-1 text-sm ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : ''
                                } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

CallbackRequestsIndex.layout = {
    breadcrumbs: [
        { title: 'Callback Requests', href: callbackRequestsIndex() },
    ] satisfies BreadcrumbItem[],
};
