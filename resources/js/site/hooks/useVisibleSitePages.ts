import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

const DEFAULT_PAGES = [
    'about',
    'doctors',
    'services',
    'obgyn',
    'contact',
    'offers',
];

export function useVisibleSitePages(): Set<string> {
    const { visibleSitePages = DEFAULT_PAGES } = usePage<{
        visibleSitePages?: string[];
    }>().props;

    return useMemo(() => new Set(visibleSitePages), [visibleSitePages]);
}
