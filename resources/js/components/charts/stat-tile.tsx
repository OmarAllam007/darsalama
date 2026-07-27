import type { LucideIcon } from 'lucide-react';

export function StatTile({
    label,
    value,
    icon: Icon,
    tone = 'navy',
}: {
    label: string;
    value: number | string;
    icon?: LucideIcon;
    tone?: 'navy' | 'gold' | 'emerald' | 'rose';
}) {
    const toneClasses = {
        navy: 'bg-[#edf0f8] text-[#15265c]',
        gold: 'bg-[#f7f0dc] text-[#9a7628]',
        emerald: 'bg-emerald-50 text-emerald-700',
        rose: 'bg-rose-50 text-rose-700',
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-[#e2dfd4] bg-white p-5 shadow-[0_12px_30px_-24px_rgba(21,38,92,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-24px_rgba(21,38,92,0.5)] dark:border-sidebar-border dark:bg-card">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-[#172047] dark:text-foreground">
                        {value}
                    </p>
                </div>
                {Icon && (
                    <div
                        className={`flex size-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}
                    >
                        <Icon className="size-5" />
                    </div>
                )}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[linear-gradient(90deg,#c9a94f,transparent)] transition-transform group-hover:scale-x-100" />
        </div>
    );
}
