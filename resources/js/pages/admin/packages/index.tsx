import { Head, Link } from '@inertiajs/react';
import PackageController from '@/actions/App/Http/Controllers/Admin/PackageController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { deleteWithConfirm } from '@/lib/delete-with-confirm';
import { index as packagesIndex } from '@/routes/admin/packages';
import type { BreadcrumbItem } from '@/types';

type Package = {
    id: number;
    name_en: string;
    name_ar: string;
    type: string;
    price: string | null;
    department: {
        id: number;
        name: string;
    };
};

export default function PackagesIndex({ packages }: { packages: Package[] }) {
    return (
        <>
            <Head title="Packages" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Packages"
                        description="Manage the packages offered by each department"
                    />
                    <Button asChild>
                        <Link href={PackageController.create()}>
                            New package
                        </Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="p-3 font-medium">Name</th>
                                <th className="p-3 font-medium">Department</th>
                                <th className="p-3 font-medium">Price</th>
                                <th className="p-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {packages.map((pkg) => (
                                <tr key={pkg.id} className="border-t">
                                    <td className="p-3">{pkg.name_en}</td>
                                    <td className="p-3">
                                        {pkg.department.name}
                                    </td>
                                    <td className="p-3">{pkg.price ?? '—'}</td>
                                    <td className="space-x-3 p-3 text-right">
                                        <Link
                                            className="text-sm underline"
                                            href={PackageController.edit(
                                                pkg.id,
                                            )}
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="text-sm text-destructive underline"
                                            data-test="delete-package-button"
                                            onClick={() =>
                                                deleteWithConfirm(
                                                    PackageController.destroy.url(
                                                        pkg.id,
                                                    ),
                                                    pkg.name_en,
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {packages.length === 0 && (
                                <tr>
                                    <td
                                        className="p-3 text-muted-foreground"
                                        colSpan={4}
                                    >
                                        No packages yet.
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

PackagesIndex.layout = {
    breadcrumbs: [
        { title: 'Packages', href: packagesIndex() },
    ] satisfies BreadcrumbItem[],
};
