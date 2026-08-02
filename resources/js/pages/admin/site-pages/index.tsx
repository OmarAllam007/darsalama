import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { update } from '@/actions/App/Http/Controllers/Admin/SitePageController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { index as sitePagesIndex } from '@/routes/admin/site-pages';
import type { BreadcrumbItem } from '@/types';

type SitePage = {
    slug: string;
    name: string;
    is_visible: boolean;
};

export default function SitePagesIndex({ pages }: { pages: SitePage[] }) {
    return (
        <>
            <Head title="Site pages" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Site pages"
                    description="Choose which public pages visitors can open and see in navigation."
                />

                <Form
                    {...update.form()}
                    className="max-w-3xl space-y-5"
                    onSuccess={() => toast.success('Site pages updated.')}
                >
                    {({ processing }) => (
                        <>
                            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                                {pages.map((page) => (
                                    <label
                                        key={page.slug}
                                        className="flex cursor-pointer items-center justify-between gap-4 border-b p-5 last:border-b-0 hover:bg-muted/40"
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                                                {page.is_visible ? (
                                                    <Eye className="size-5" />
                                                ) : (
                                                    <EyeOff className="size-5" />
                                                )}
                                            </span>
                                            <span>
                                                <strong className="block font-medium">
                                                    {page.name}
                                                </strong>
                                                <span className="text-sm text-muted-foreground">
                                                    /{page.slug}
                                                </span>
                                            </span>
                                        </span>
                                        <Checkbox
                                            name="visible_pages[]"
                                            value={page.slug}
                                            defaultChecked={page.is_visible}
                                            className="size-5"
                                            aria-label={`Show ${page.name}`}
                                        />
                                    </label>
                                ))}
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Hidden pages return a 404 and are removed from
                                the website menu and search.
                            </p>

                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving…' : 'Save visibility'}
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

SitePagesIndex.layout = {
    breadcrumbs: [
        { title: 'Site pages', href: sitePagesIndex() },
    ] satisfies BreadcrumbItem[],
};
