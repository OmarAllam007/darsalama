import type { ReactNode } from 'react';

export function ChartCard({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
            <h3 className="mb-4 text-sm font-medium">{title}</h3>
            <div className="h-64">{children}</div>
        </div>
    );
}
