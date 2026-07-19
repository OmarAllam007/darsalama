import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { index as feedbackIndex } from '@/routes/admin/feedback';
import type { BreadcrumbItem } from '@/types';

type Feedback = {
    id: number;
    rating: string;
    mobile: string | null;
    notes: string | null;
    status: string;
    created_at: string;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
};

const RATING_META: Record<
    string,
    { label: string; emoji: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
    terrible: { label: 'Terrible', emoji: '😡', variant: 'destructive' },
    bad: { label: 'Bad', emoji: '🙁', variant: 'destructive' },
    okay: { label: 'Okay', emoji: '😐', variant: 'secondary' },
    good: { label: 'Good', emoji: '🙂', variant: 'default' },
    excellent: { label: 'Excellent', emoji: '😄', variant: 'default' },
};

export default function FeedbackIndex({
    feedback,
}: {
    feedback: Paginated<Feedback>;
}) {
    return (
        <>
            <Head title="Feedback" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Feedback"
                    description="Patient experience ratings submitted from the contact page"
                />

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="p-3 font-medium">Rating</th>
                                <th className="p-3 font-medium">Mobile</th>
                                <th className="p-3 font-medium">Notes</th>
                                <th className="p-3 font-medium">Received</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feedback.data.map((item) => {
                                const meta = RATING_META[item.rating] ?? {
                                    label: item.rating,
                                    emoji: '',
                                    variant: 'secondary' as const,
                                };
                                return (
                                    <tr key={item.id} className="border-t">
                                        <td className="p-3">
                                            <Badge variant={meta.variant}>
                                                <span className="mr-1">
                                                    {meta.emoji}
                                                </span>
                                                {meta.label}
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            {item.mobile ? (
                                                <a
                                                    href={`tel:${item.mobile}`}
                                                    className="text-primary underline-offset-2 hover:underline"
                                                >
                                                    {item.mobile}
                                                </a>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="max-w-md whitespace-pre-wrap p-3 text-muted-foreground">
                                            {item.notes ?? '—'}
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {new Date(
                                                item.created_at,
                                            ).toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                            {feedback.data.length === 0 && (
                                <tr>
                                    <td
                                        className="p-3 text-muted-foreground"
                                        colSpan={4}
                                    >
                                        No feedback yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {feedback.links.length > 3 && (
                    <div className="flex flex-wrap gap-2">
                        {feedback.links.map((link, i) => (
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

FeedbackIndex.layout = {
    breadcrumbs: [
        { title: 'Feedback', href: feedbackIndex() },
    ] satisfies BreadcrumbItem[],
};
