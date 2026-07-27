import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    BadgeCheck,
    ChevronLeft,
    ChevronRight,
    PhoneCall,
    ShieldCheck,
    Sparkles,
    Tag,
} from 'lucide-react';
import { contact, home } from '@/routes';
import { useSlider } from '@/site/hooks/useSlider';
import { PHONE, PHONE_TEL } from '@/site/i18n/constants';
import { useLanguage } from '@/site/i18n/LanguageContext';

function offerNumber(path: string): number {
    const match = path.match(/(\d+)\.\w+$/);

    return match ? Number.parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
}

const offerModules = import.meta.glob<string>(
    '../../site/assets/images/offers/*.{png,jpg,jpeg,webp}',
    { eager: true, import: 'default' },
);

const slides = Object.entries(offerModules)
    .sort(([pathA], [pathB]) => offerNumber(pathA) - offerNumber(pathB))
    .map(([, source]) => source);

export default function Offers() {
    const { t, isRtl } = useLanguage();
    const { index, setIndex, goPrev, goNext } = useSlider(slides.length);
    const activeNumber = String(index + 1).padStart(2, '0');
    const total = String(slides.length).padStart(2, '0');

    return (
        <>
            <Head title={t('offers.title')} />

            <div className="offers-dsm">
                <section className="offers-dsm__hero">
                    <div className="offers-dsm__hero-orbit" />
                    <Tag className="offers-dsm__hero-mark" aria-hidden="true" />
                    <div className="offers-dsm__hero-inner container">
                        <div>
                            <p className="offers-dsm__eyebrow">
                                <span />
                                {t('offers.eyebrow')}
                            </p>
                            <h1>{t('offers.title')}</h1>
                            <p>{t('offers.intro')}</p>
                        </div>
                        <div className="offers-dsm__hero-stat">
                            <strong>{slides.length}</strong>
                            <span>{t('offers.liveOffers')}</span>
                        </div>
                    </div>
                    <div className="offers-dsm__gold-line" />
                </section>

                <main className="offers-dsm__paper">
                    <section className="offers-dsm__content container">
                        <div className="offers-dsm__section-head">
                            <div>
                                <p className="offers-dsm__section-kicker">
                                    <span />
                                    {t('offers.browseEyebrow')}
                                </p>
                                <h2>{t('offers.browseHeading')}</h2>
                            </div>
                            <p>{t('offers.browseBody')}</p>
                        </div>

                        {slides.length > 0 ? (
                            <>
                                <div className="offers-dsm__showcase">
                                    <div className="offers-dsm__stage">
                                        <div className="offers-dsm__frame">
                                            {slides.map(
                                                (source, slideIndex) => (
                                                    <img
                                                        key={source}
                                                        src={source}
                                                        alt={`${t('offers.offerLabel')} ${slideIndex + 1}`}
                                                        className={
                                                            slideIndex === index
                                                                ? 'is-active'
                                                                : undefined
                                                        }
                                                    />
                                                ),
                                            )}
                                            <span className="offers-dsm__image-badge">
                                                <BadgeCheck size={15} />
                                                {t('offers.current')}
                                            </span>
                                        </div>

                                        {slides.length > 1 && (
                                            <div className="offers-dsm__controls">
                                                <button
                                                    type="button"
                                                    onClick={goPrev}
                                                    aria-label={t(
                                                        'offers.previous',
                                                    )}
                                                >
                                                    {isRtl ? (
                                                        <ChevronRight
                                                            size={20}
                                                        />
                                                    ) : (
                                                        <ChevronLeft
                                                            size={20}
                                                        />
                                                    )}
                                                </button>
                                                <span>
                                                    <strong>
                                                        {activeNumber}
                                                    </strong>
                                                    / {total}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={goNext}
                                                    aria-label={t(
                                                        'offers.next',
                                                    )}
                                                >
                                                    {isRtl ? (
                                                        <ChevronLeft
                                                            size={20}
                                                        />
                                                    ) : (
                                                        <ChevronRight
                                                            size={20}
                                                        />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <aside className="offers-dsm__detail">
                                        <Sparkles
                                            className="offers-dsm__detail-mark"
                                            aria-hidden="true"
                                        />
                                        <div className="offers-dsm__detail-index">
                                            {activeNumber}
                                        </div>
                                        <p className="offers-dsm__detail-kicker">
                                            {t('offers.featured')}
                                        </p>
                                        <h2>
                                            {t('offers.offerLabel')}{' '}
                                            {activeNumber}
                                        </h2>
                                        <p>{t('offers.detailBody')}</p>

                                        <div className="offers-dsm__assurance">
                                            <ShieldCheck size={18} />
                                            <span>{t('offers.assurance')}</span>
                                        </div>

                                        <div className="offers-dsm__actions">
                                            <a href={PHONE_TEL}>
                                                <PhoneCall size={17} />
                                                <span>
                                                    <small>
                                                        {t('offers.callUs')}
                                                    </small>
                                                    <bdi dir="ltr">{PHONE}</bdi>
                                                </span>
                                            </a>
                                            <Link href={contact()}>
                                                {t('offers.enquire')}
                                                <ArrowUpRight size={17} />
                                            </Link>
                                        </div>

                                        <Link
                                            href={`${home.url()}#book`}
                                            className="offers-dsm__book"
                                        >
                                            {t('offers.bookAppointment')}
                                            <ArrowUpRight size={17} />
                                        </Link>
                                        <small className="offers-dsm__fineprint">
                                            {t('offers.fineprint')}
                                        </small>
                                    </aside>
                                </div>

                                {slides.length > 1 && (
                                    <div
                                        className="offers-dsm__rail"
                                        role="tablist"
                                        aria-label={t('offers.thumbnailLabel')}
                                    >
                                        {slides.map((source, slideIndex) => (
                                            <button
                                                key={source}
                                                type="button"
                                                role="tab"
                                                aria-selected={
                                                    slideIndex === index
                                                }
                                                className={
                                                    slideIndex === index
                                                        ? 'is-active'
                                                        : undefined
                                                }
                                                onClick={() =>
                                                    setIndex(slideIndex)
                                                }
                                            >
                                                <img
                                                    src={source}
                                                    alt=""
                                                    loading="lazy"
                                                />
                                                <span>
                                                    {String(
                                                        slideIndex + 1,
                                                    ).padStart(2, '0')}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="offers-dsm__empty">
                                <Tag size={26} />
                                <p>{t('offers.empty')}</p>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
}
