import { LayoutGrid, Stethoscope } from 'lucide-react';
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

export default function DoctorsHero({ onBrowseDepartments, onBrowseDoctors }) {
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
            <div className="cin-hero">
                {slides.map((src, i) => (
                    <img
                        key={src}
                        src={src}
                        alt=""
                        className="cin-hero-photo"
                        style={{ opacity: i === index ? 1 : 0 }}
                    />
                ))}
                <div className="cin-overlay" />
                <div className="cin-content">
                    <div className="cin-tag">
                        <span className="cin-dot" />
                        {t('doctorsHero.tag')}
                    </div>
                    <h1>
                        {t('doctorsHero.titleLines').map((line) => (
                            <span key={line}>{line}</span>
                        ))}
                    </h1>
                    <p className="cin-sub">{t('doctorsHero.sub')}</p>
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
            </div>
            <div className="cin-gold-line" />
        </>
    );
}
