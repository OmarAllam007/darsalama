import { Link } from '@inertiajs/react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { home } from '@/routes';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const currentPage = breadcrumbs.at(-1)?.title ?? 'Admin';

    return (
        <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center justify-between gap-4 border-b border-[#e2dfd4] bg-[#fbfaf6]/90 px-4 backdrop-blur-xl transition-[width,height] ease-linear md:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="size-9 shrink-0 rounded-xl border border-[#dedbcf] bg-white text-[#15265c] shadow-sm hover:bg-[#f3f0e5]" />
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h1 className="truncate text-base font-semibold tracking-tight text-[#172047] md:text-lg">
                            {currentPage}
                        </h1>
                        <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/10 sm:inline-flex">
                            <ShieldCheck className="size-3" />
                            Secure
                        </span>
                    </div>
                    <div className="hidden text-xs text-[#7b8192] sm:block">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden text-right lg:block">
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#9b7b2f] uppercase">
                        Hospital workspace
                    </p>
                    <p className="text-xs text-[#7b8192]">
                        Care coordination center
                    </p>
                </div>
                <Link
                    href={home()}
                    target="_blank"
                    className="inline-flex size-9 items-center justify-center rounded-xl border border-[#dedbcf] bg-white text-[#15265c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9a94f] hover:text-[#9b7724] sm:w-auto sm:px-3"
                >
                    <ExternalLink className="size-4" />
                    <span className="ml-2 hidden text-xs font-semibold sm:inline">
                        View site
                    </span>
                </Link>
            </div>
        </header>
    );
}
