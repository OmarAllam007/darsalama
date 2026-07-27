import { LayoutGrid, Sparkles, Stethoscope } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const slides = Object.entries(
    import.meta.glob('../assets/images/slider/*.{jpg,jpeg,png,webp}', {
        eager: true,
        import: 'default',
    }),
)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, src]) => src);

export default function DoctorsHero({
    eyebrow = undefined,
    title = undefined,
    intro = undefined,
    onBrowseDepartments,
    onBrowseDoctors,
}) {
    const { t } = useLanguage();
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (slides.length < 2) return;
        const id = setInterval(
            () => setIndex((i) => (i + 1) % slides.length),
            5000,
        );
        return () => clearInterval(id);
    }, []);

    return (
        <>
            <section className="cin-hero page-banner page-banner--doctors">
                {slides.map((src, i) => (
                    <img
                        key={src}
                        src={src}
                        alt=""
                        className="cin-hero-photo page-banner__img"
                        style={{ opacity: i === index ? 1 : 0 }}
                    />
                ))}
                <div className="cin-overlay page-banner__scrim" />
                <Sparkles className="page-banner__mark" aria-hidden="true" />
                <div className="cin-content page-banner__inner container">
                    <p className="cin-tag page-banner__eyebrow">
                        <span className="cin-dot" />
                        {eyebrow ?? t('doctorsHero.tag')}
                    </p>
                    <h1>
                        {title ??
                            t('doctorsHero.titleLines').map((line) => (
                                <span key={line}>{line}</span>
                            ))}
                    </h1>
                    <p className="cin-sub page-banner__intro">
                        {intro ?? t('doctorsHero.sub')}
                    </p>
                    <div className="cin-cta">
                        <button
                            type="button"
                            className="cin-btn"
                            onClick={onBrowseDepartments}
                        >
                            <LayoutGrid size={16} />
                            {t('doctorsHero.browseDepartments')}
                        </button>
                        <button
                            type="button"
                            className="cin-ghost"
                            onClick={onBrowseDoctors}
                        >
                            <Stethoscope size={16} />
                            {t('doctorsHero.browseDoctors')}
                        </button>
                    </div>
                </div>
                <div className="page-banner__gold-line" />
            </section>
        </>
    );
}
