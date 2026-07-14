import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

const CARD_WIDTH = 1080;
const FLAT_BREAKPOINT = 600;

/**
 * The .dp card is a fixed 1080px-wide "poster" (see DoctorProfileCard).
 * On wider screens this scales it down via CSS transform to fit its
 * container. Below FLAT_BREAKPOINT the transform is dropped entirely and
 * the card switches to a "dp-flat" layout that flows at its real width —
 * scaling the full poster down that far would shrink all its text to an
 * unreadable size.
 */
export default function ScaledDoctorCard({
    children,
    dense = false,
}: {
    children: ReactNode;
    dense?: boolean;
}) {
    const outerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.3);
    const [height, setHeight] = useState<number | 'auto'>(320);
    const [width, setWidth] = useState<number | undefined>(undefined);
    const [flat, setFlat] = useState(false);

    useLayoutEffect(() => {
        const outer = outerRef.current;
        const inner = innerRef.current;

        if (!outer || !inner) {
            return;
        }

        const recalc = () => {
            if (!dense && window.innerWidth <= FLAT_BREAKPOINT) {
                setFlat(true);
                setHeight('auto');
                setWidth(undefined);

                return;
            }

            setFlat(false);
            const cardHeight = inner.scrollHeight || CARD_WIDTH;

            if (dense) {
                // Idle screensaver: fit the whole card within the available
                // stage (both width AND height) so nothing is clipped —
                // matches the reference's min(w/1080, h/cardHeight) scaling.
                const box = outer.parentElement;
                const availWidth = box ? box.clientWidth : window.innerWidth;
                const availHeight = box
                    ? box.clientHeight
                    : window.innerHeight;
                const nextScale = Math.min(
                    availWidth / CARD_WIDTH,
                    availHeight / cardHeight,
                );
                setScale(nextScale);
                setWidth(CARD_WIDTH * nextScale);
                setHeight(cardHeight * nextScale);

                return;
            }

            const outerWidth = outer.clientWidth || CARD_WIDTH;
            const nextScale = outerWidth / CARD_WIDTH;
            setScale(nextScale);
            setWidth(undefined);
            setHeight(cardHeight * nextScale);
        };

        recalc();
        const ro = new ResizeObserver(recalc);
        ro.observe(outer);
        ro.observe(inner);

        if (dense && outer.parentElement) {
            ro.observe(outer.parentElement);
        }

        window.addEventListener('resize', recalc);

        return () => {
            ro.disconnect();
            window.removeEventListener('resize', recalc);
        };
    }, [children, dense]);

    return (
        <div
            className={dense ? 'dp dp-dense' : `dp${flat ? ' dp-flat' : ''}`}
            ref={outerRef}
            style={{ height, width }}
        >
            <div
                className="dp-scaler"
                ref={innerRef}
                style={{ transform: flat ? 'none' : `scale(${scale})` }}
            >
                {children}
            </div>
        </div>
    );
}
