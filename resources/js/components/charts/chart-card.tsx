import type { ReactNode } from 'react';

export function ChartCard({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-[#e2dfd4] bg-white p-5 shadow-[0_16px_40px_-30px_rgba(21,38,92,0.45)] dark:border-sidebar-border dark:bg-card">
            <div className="mb-5 flex items-center gap-3">
                <span className="h-5 w-1 rounded-full bg-[#c9a94f]" />
                <h3 className="text-sm font-semibold tracking-tight text-[#20294c] dark:text-foreground">
                    {title}
                </h3>
            </div>
            <div className="h-64">{children}</div>
        </div>
    );
}
