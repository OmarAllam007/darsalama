import { useMemo } from 'react';

const VAR_NAMES = [
    'chart-1',
    'chart-2',
    'chart-3',
    'chart-4',
    'chart-5',
    'success',
    'warning',
    'destructive',
    'muted-foreground',
    'border',
] as const;

type ColorName = (typeof VAR_NAMES)[number];

/** Reads the app's CSS theme variables so charts stay in sync with the active (light/dark) theme. */
export function useThemeColors(): Record<ColorName, string> {
    return useMemo(() => {
        if (typeof window === 'undefined') {
            return Object.fromEntries(
                VAR_NAMES.map((name) => [name, '#666']),
            ) as Record<ColorName, string>;
        }

        const styles = getComputedStyle(document.documentElement);

        return Object.fromEntries(
            VAR_NAMES.map((name) => [
                name,
                styles.getPropertyValue(`--${name}`).trim(),
            ]),
        ) as Record<ColorName, string>;
    }, []);
}

/** Applies an alpha channel to a hex or oklch() theme color for area-fill washes. */
export function withAlpha(color: string, alpha: number): string {
    if (color.startsWith('#')) {
        const alphaHex = Math.round(alpha * 255)
            .toString(16)
            .padStart(2, '0');

        return `${color}${alphaHex}`;
    }

    return color.replace(/\)\s*$/, ` / ${alpha})`);
}
