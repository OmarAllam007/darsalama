import { Head, Link } from '@inertiajs/react';
import NationalityController from '@/actions/App/Http/Controllers/Admin/NationalityController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { deleteWithConfirm } from '@/lib/delete-with-confirm';
import { index as nationalitiesIndex } from '@/routes/admin/nationalities';
import type { BreadcrumbItem } from '@/types';

type Nationality = {
    id: number;
    name: string;
    name_ar: string;
    flag: string | null;
};

export default function NationalitiesIndex({
    nationalities,
}: {
    nationalities: Nationality[];
}) {
    return (
        <>
            <Head title="Nationalities" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Nationalities"
                        description="Manage the nationalities doctors can be assigned"
                    />
                    <Button asChild>
                        <Link href={NationalityController.create()}>
                            New nationality
                        </Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="p-3 font-medium">Flag</th>
                                <th className="p-3 font-medium">Name</th>
                                <th className="p-3 font-medium">Arabic name</th>
                                <th className="p-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {nationalities.map((nationality) => (
                                <tr key={nationality.id} className="border-t">
                                    <td className="p-3">
                                        {nationality.flag && (
                                            <img
                                                src={nationality.flag}
                                                alt={`${nationality.name} flag`}
                                                className="h-6 w-9 rounded-sm border object-cover"
                                            />
                                        )}
                                    </td>
                                    <td className="p-3">{nationality.name}</td>
                                    <td className="p-3" dir="rtl">
                                        {nationality.name_ar}
                                    </td>
                                    <td className="space-x-3 p-3 text-right">
                                        <Link
                                            className="text-sm underline"
                                            href={NationalityController.edit(
                                                nationality.id,
                                            )}
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="text-sm text-destructive underline"
                                            data-test="delete-nationality-button"
                                            onClick={() =>
                                                deleteWithConfirm(
                                                    NationalityController.destroy.url(
                                                        nationality.id,
                                                    ),
                                                    nationality.name,
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {nationalities.length === 0 && (
                                <tr>
                                    <td
                                        className="p-3 text-muted-foreground"
                                        colSpan={4}
                                    >
                                        No nationalities yet.
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

NationalitiesIndex.layout = {
    breadcrumbs: [
        { title: 'Nationalities', href: nationalitiesIndex() },
    ] satisfies BreadcrumbItem[],
};
