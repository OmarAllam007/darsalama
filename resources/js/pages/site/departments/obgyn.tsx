import { Form, Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import CallbackRequestController from '@/actions/App/Http/Controllers/CallbackRequestController';
import {
    EMERGENCY_PHONE,
    EMERGENCY_TEL,
    MAP_EMBED_SRC,
    MAP_URL,
    WHATSAPP_LINK,
} from '@/site/i18n/constants';
import { useLanguage } from '@/site/i18n/LanguageContext';
import { translations } from '@/site/i18n/translations';
import '@/site/obgyn.css';

type Feature = {
    id: number;
    is_highlighted: boolean;
    label_en: string;
    label_ar: string;
    label_ur: string | null;
    label_tl: string | null;
};

type PriceTier = {
    id: number;
    label_en: string;
    label_ar: string;
    label_ur: string | null;
    label_tl: string | null;
    amount: string;
};

type StageTest = {
    id: number;
    name: string;
    code: string | null;
};

type Stage = {
    id: number;
    name_en: string;
    name_ar: string;
    name_ur: string | null;
    name_tl: string | null;
    subtitle_en: string | null;
    subtitle_ar: string | null;
    subtitle_ur: string | null;
    subtitle_tl: string | null;
    free_consultations: number;
    tests: StageTest[];
};

type Package = {
    id: number;
    slug: string;
    type: 'delivery' | 'care' | 'transport';
    name_en: string;
    name_ar: string;
    name_ur: string | null;
    name_tl: string | null;
    category_label_en: string | null;
    category_label_ar: string | null;
    category_label_ur: string | null;
    category_label_tl: string | null;
    description_en: string | null;
    description_ar: string | null;
    description_ur: string | null;
    description_tl: string | null;
    tagline_en: string | null;
    tagline_ar: string | null;
    tagline_ur: string | null;
    tagline_tl: string | null;
    image: string | null;
    price: string | null;
    original_price: string | null;
    features: Feature[];
    price_tiers: PriceTier[];
    stages: Stage[];
};

type NamePair = { name: string; name_ar: string };

type Doctor = {
    id: number;
    name: string;
    name_ar: string;
    job: string;
    job_ar: string;
    image: string | null;
    nationality: { name: string; name_ar: string; flag: string | null } | null;
    qualifications: NamePair[];
    services: NamePair[];
};

type Department = {
    id: number;
    slug: string;
    name: string;
    name_ar: string;
    packages: Package[];
    doctors: Doctor[];
};

const RIYAL = '\u{FDFC}'; // ﷼

function num(amount: string | number | null): string {
    if (amount === null || amount === undefined) {
        return '';
    }

    return Number(amount).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export default function ObgynDepartment({
    department,
}: {
    department: Department;
}) {
    const { t, lang, dir } = useLanguage();
    const isRtl = dir === 'rtl';

    // Arabic titles stay Arabic regardless of the active language (the design is
    // Arabic-first with a localized secondary line), so we read them directly.
    const AR = translations.ar.obgyn as unknown as Record<string, string>;
    const EN = translations.en.obgyn as unknown as Record<string, string>;

    const pick = (row: Record<string, unknown>, base: string): string => {
        const localized = row[`${base}_${lang}`];
        if (typeof localized === 'string' && localized.length > 0) {
            return localized;
        }
        const fallback = row[`${base}_en`];
        return typeof fallback === 'string' ? fallback : '';
    };

    // Reveal-on-scroll + active side-dot, mirroring the reference behaviour.
    useEffect(() => {
        const root = document.querySelector('.obgyn-page');
        if (!root) {
            return;
        }

        const reveals = Array.from(root.querySelectorAll<HTMLElement>('.reveal'));
        const revealIn = () => {
            const vh = window.innerHeight || document.documentElement.clientHeight;
            reveals.forEach((el) => {
                const r = el.getBoundingClientRect();
                if (r.top < vh * 1.1 && r.bottom > 0) {
                    el.classList.add('in');
                }
            });
        };

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in');
                    }
                });
            },
            { threshold: 0.05, rootMargin: '0px 0px -5% 0px' },
        );
        reveals.forEach((el) => io.observe(el));
        revealIn();
        // Safety net: never leave content invisible.
        const fallback = window.setTimeout(() => {
            reveals.forEach((el) => el.classList.add('in'));
        }, 1400);

        const dots = Array.from(root.querySelectorAll<HTMLElement>('.dots a'));
        const sections = Array.from(
            root.querySelectorAll<HTMLElement>('section.snap'),
        );
        const secObs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
                        dots.forEach((d) =>
                            d.classList.toggle(
                                'active',
                                d.getAttribute('href') === `#${entry.target.id}`,
                            ),
                        );
                    }
                });
            },
            { threshold: [0.4, 0.7] },
        );
        sections.forEach((s) => secObs.observe(s));

        return () => {
            io.disconnect();
            secObs.disconnect();
            window.clearTimeout(fallback);
        };
    }, [lang]);

    const packages = department.packages;

    const dots = [
        { id: 'hero', label: t('obgyn.kicker') },
        ...packages.map((p) => ({ id: `pkg-${p.slug}`, label: pick(p, 'name') })),
        { id: 'doctors', label: t('obgyn.doctorsTitle') },
        { id: 'rooms', label: t('obgyn.roomsTitle') },
        { id: 'contact', label: t('obgyn.contactTitle') },
    ];

    const roomsStats = t('obgyn.roomsStats') as { value: string; label: string }[];
    const roomImages = ['room-deluxe.jpg', 'room-waiting.jpg', 'room-door.jpg'];
    const roomCaptions = t('obgyn.rooms') as string[];
    const roomCaptionsAr = AR.rooms as unknown as string[];

    const packageImage = (pkg: Package): string | null => {
        if (pkg.image) {
            return `/storage/${pkg.image}`;
        }
        const map: Record<string, string> = {
            'normal-delivery': 'post-normal.jpg',
            'cesarean-first': 'post-c-first.jpg',
            'cesarean-repeat': 'post-c-repeat.jpg',
            'maternity-care': 'post-followup.jpg',
            'transport-after-delivery': 'post-transport.jpg',
        };
        return map[pkg.slug] ? `/obgyn-media/packages/${map[pkg.slug]}` : null;
    };

    const packageOptions = packages.map((pkg) =>
        pkg.type === 'care'
            ? `${pick(pkg, 'name')} — ${RIYAL} ${num(pkg.price_tiers[0]?.amount ?? null)}+`
            : `${pick(pkg, 'name')} — ${RIYAL} ${num(pkg.price)}`,
    );

    // Grid packages (delivery + transport) share the alternating media layout;
    // `care` packages render the 3-trimester layout instead.
    let gridIndex = -1;

    const renderGridPackage = (pkg: Package, overallIndex: number) => {
        gridIndex += 1;
        const reverse = gridIndex % 2 === 1;
        const bg = overallIndex % 2 === 0 ? 'bg-paper' : 'bg-cream';
        const img = packageImage(pkg);
        const isTransport = pkg.type === 'transport';

        return (
            <section
                key={pkg.id}
                id={`pkg-${pkg.slug}`}
                className={`snap ${bg}`}
            >
                <div className="wrap">
                    <div className={`pkg-grid${reverse ? ' reverse' : ''}`}>
                        <div className="pkg-media reveal">
                            <div className="pkg-index">
                                <span className="num">
                                    {String(overallIndex + 1).padStart(2, '0')}
                                </span>{' '}
                                · {pick(pkg, 'name')}
                            </div>
                            {img && <img loading="lazy" src={img} alt={pick(pkg, 'name')} />}
                        </div>
                        <div>
                            <div className="pkg-meta reveal">
                                <span className="ar">{pkg.category_label_ar}</span>
                                <span className="sep" />
                                <span>{pkg.category_label_en}</span>
                            </div>
                            <h2 className="h2-ar reveal d1">{pkg.name_ar}</h2>
                            {lang !== 'ar' && (
                                <div className="h2-en reveal d2">{pick(pkg, 'name')}</div>
                            )}
                            <span className="h2-rule reveal d2" />
                            {(pkg.name_tl || pkg.name_ur) && (
                                <div className="h2-third reveal d3">
                                    <bdi>
                                        {[pkg.name_tl, pkg.name_ur]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </bdi>
                                </div>
                            )}
                            <div className="chips reveal d3">
                                {pkg.features.map((feature) => (
                                    <span
                                        key={feature.id}
                                        className={`chip${feature.is_highlighted ? ' gold' : ''}`}
                                    >
                                        <span className={isRtl ? 'ar' : undefined}>
                                            {pick(feature, 'label')}
                                        </span>
                                    </span>
                                ))}
                            </div>
                            <div
                                className={`price-card reveal d4${isTransport ? ' slim' : ''}`}
                            >
                                <div className="label">PRICE</div>
                                <div className="body">
                                    {pkg.original_price && (
                                        <div className="old">
                                            {RIYAL} {num(pkg.original_price)}
                                        </div>
                                    )}
                                    <div className="now">
                                        <span className="cur">{RIYAL}</span>{' '}
                                        {num(pkg.price)}
                                    </div>
                                </div>
                            </div>
                            <div className="pkg-tagline reveal d5">
                                <span className="ar">{pkg.tagline_ar}</span>
                                <span className="sep" />
                                <span>{pick(pkg, 'tagline')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    };

    const renderCarePackage = (pkg: Package, overallIndex: number) => {
        const bg = overallIndex % 2 === 0 ? 'bg-paper' : 'bg-cream';
        const img = packageImage(pkg);

        return (
            <section
                key={pkg.id}
                id={`pkg-${pkg.slug}`}
                className={`snap ${bg} short`}
            >
                <div className="wrap">
                    <div className="tri-intro">
                        <div className="pkg-media reveal">
                            <div className="pkg-index">
                                <span className="num">
                                    {String(overallIndex + 1).padStart(2, '0')}
                                </span>{' '}
                                · {pick(pkg, 'name')}
                            </div>
                            {img && <img loading="lazy" src={img} alt={pick(pkg, 'name')} />}
                        </div>
                        <div>
                            <div className="pkg-meta reveal">
                                <span className="ar">{pkg.category_label_ar}</span>
                                <span className="sep" />
                                <span>{pkg.category_label_en}</span>
                            </div>
                            <h2 className="h2-ar reveal d1">{pkg.name_ar}</h2>
                            {lang !== 'ar' && (
                                <div className="h2-en reveal d2">{pick(pkg, 'name')}</div>
                            )}
                            <span className="h2-rule reveal d2" />
                            {pick(pkg, 'description') && (
                                <p
                                    className="reveal d3"
                                    style={{
                                        margin: '18px 0 0',
                                        maxWidth: 440,
                                        fontSize: 15,
                                        lineHeight: 1.7,
                                        color: '#3a4262',
                                    }}
                                >
                                    {pick(pkg, 'description')}
                                </p>
                            )}
                            <div
                                className="chips reveal d3"
                                style={{ margin: '22px 0 22px' }}
                            >
                                {pkg.features.map((feature) => (
                                    <span
                                        key={feature.id}
                                        className={`chip${feature.is_highlighted ? ' gold' : ''}`}
                                    >
                                        <span className={isRtl ? 'ar' : undefined}>
                                            {pick(feature, 'label')}
                                        </span>
                                    </span>
                                ))}
                            </div>
                            {pkg.price_tiers.length > 0 && (
                                <div
                                    className="price-card dual reveal d4"
                                    style={{ maxWidth: 440 }}
                                >
                                    <div className="label">PRICE</div>
                                    <div className="body">
                                        {pkg.price_tiers.map((tier) => (
                                            <div key={tier.id} className="row">
                                                <span className="tier">
                                                    {pick(tier, 'label')}
                                                </span>
                                                <span className="amt">
                                                    <span className="cur">{RIYAL}</span>{' '}
                                                    {num(tier.amount)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="tri-grid">
                        {pkg.stages.map((stage, i) => (
                            <article
                                key={stage.id}
                                className={`tri reveal d${Math.min(i + 2, 5)}`}
                            >
                                <header className="tri-head">
                                    <div className="num">
                                        {String(i + 1).padStart(2, '0')} ·{' '}
                                        {stage.name_en}
                                    </div>
                                    <h3>{pick(stage, 'name')}</h3>
                                    {pick(stage, 'subtitle') && (
                                        <div className={isRtl ? 'ar' : undefined}>
                                            {pick(stage, 'subtitle')}
                                        </div>
                                    )}
                                </header>
                                <div className="tri-tests">
                                    {stage.tests.map((test, ti) => (
                                        <div key={test.id} className="tri-row">
                                            <span className="n">{ti + 1}</span>
                                            <span className="nm">{test.name}</span>
                                            {test.code && (
                                                <span className="cd">{test.code}</span>
                                            )}
                                        </div>
                                    ))}
                                    {stage.free_consultations > 0 && (
                                        <div className="tri-row free">
                                            <span className="n">✓</span>
                                            <span className="nm">
                                                {t('obgyn.consultationsRow')}
                                            </span>
                                            <span className="cd">
                                                {stage.free_consultations} ·{' '}
                                                {t('obgyn.free')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <footer className="tri-foot">
                                    <span className="gold-line">
                                        {t('obgyn.freeConsultationsNote')}
                                    </span>
                                </footer>
                            </article>
                        ))}
                    </div>

                    {pick(pkg, 'tagline') && (
                        <div
                            className="pkg-tagline reveal d5"
                            style={{ justifyContent: 'center', marginTop: 32 }}
                        >
                            <span className="ar">{pkg.tagline_ar}</span>
                            <span className="sep" />
                            <span>{pick(pkg, 'tagline')}</span>
                        </div>
                    )}
                </div>
            </section>
        );
    };

    return (
        <>
            <Head title={t('obgyn.kicker') as string}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin=""
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Inter:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@500;700&family=Tajawal:wght@400;500;700;800;900&display=swap"
                />
            </Head>

            <div className={`obgyn-page obgyn-page--${lang}`} dir={dir}>
                {/* side dot nav */}
                <nav className="dots" aria-label={t('obgyn.kicker') as string}>
                    {dots.map((d) => (
                        <a key={d.id} href={`#${d.id}`} data-label={d.label}>
                            <span className="lab">{d.label}</span>
                        </a>
                    ))}
                </nav>

                <main className="obgyn-main">
                    {/* HERO */}
                    <section className="snap bg-paper" id="hero">
                        <div className="wrap">
                            <div className="hero-grid">
                                <div>
                                    <div className="section-eyebrow reveal">
                                        <span className="dot" />
                                        <span className="ar">{AR.kicker}</span>
                                        <span>{EN.kicker}</span>
                                    </div>
                                    <h1 className="h2-ar reveal d1">{AR.heroTitle}</h1>
                                    <div className="h2-en reveal d2">{EN.heroTitle}</div>
                                    <p className="lead-text reveal d3">
                                        {t('obgyn.heroLead')}
                                    </p>
                                    <div className="hero-ctas reveal d4">
                                        <a className="btn btn-primary" href="#pkg-normal-delivery">
                                            {t('obgyn.explorePackages')}
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.4"
                                            >
                                                <path d="M5 12h14M13 5l7 7-7 7" />
                                            </svg>
                                        </a>
                                        <a className="btn btn-ghost" href="#doctors">
                                            {t('obgyn.meetDoctors')}
                                        </a>
                                        <a className="btn btn-ghost" href="#contact">
                                            {t('obgyn.bookConsultation')}
                                        </a>
                                    </div>
                                </div>

                                <div className="hero-panel reveal d2">
                                    <div className="hp-title">{t('obgyn.atAGlance')}</div>
                                    <ul className="hp-list">
                                        {packages.map((pkg) => (
                                            <li key={pkg.id} className="hp-row">
                                                <div className="nm">
                                                    {pick(pkg, 'name')}
                                                    {lang !== 'en' && (
                                                        <small>{pkg.name_en}</small>
                                                    )}
                                                </div>
                                                {pkg.type === 'care' ? (
                                                    <div className="pr stacked">
                                                        {pkg.price_tiers.map((tier) => (
                                                            <span key={tier.id}>
                                                                {num(tier.amount)}{' '}
                                                                <span className="rs">
                                                                    SR
                                                                </span>{' '}
                                                                <small>
                                                                    {pick(tier, 'label')}
                                                                </small>
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="pr">
                                                        {pkg.original_price && (
                                                            <span className="old">
                                                                {num(pkg.original_price)}
                                                            </span>
                                                        )}
                                                        {num(pkg.price)}{' '}
                                                        <span className="rs">SR</span>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* PACKAGES */}
                    {packages.map((pkg, i) =>
                        pkg.type === 'care'
                            ? renderCarePackage(pkg, i)
                            : renderGridPackage(pkg, i),
                    )}

                    {/* DOCTORS */}
                    {department.doctors.length > 0 && (
                        <section
                            className="snap bg-cream short"
                            id="doctors"
                            style={{ paddingTop: 88, paddingBottom: 88 }}
                        >
                            <div className="wrap">
                                <div className="section-head">
                                    <div className="pkg-meta reveal pink-meta">
                                        <span className="ar">{AR.kicker}</span>
                                        <span className="sep" />
                                        <span>{EN.ourSpecialists}</span>
                                    </div>
                                    <h2 className="h2-ar reveal d1">{AR.doctorsTitle}</h2>
                                    {lang !== 'ar' && (
                                        <div className="h2-en reveal d2">
                                            {t('obgyn.doctorsTitle')}
                                        </div>
                                    )}
                                    <span className="h2-rule reveal d2" />
                                    <p className="lead reveal d3">
                                        {t('obgyn.doctorsLead')}
                                    </p>
                                </div>

                                <div className="docs-grid">
                                    {department.doctors.map((doctor, i) => (
                                        <article
                                            key={doctor.id}
                                            className={`doc reveal d${Math.min(i + 2, 4)}`}
                                        >
                                            {doctor.image ? (
                                                <div className="doc-portrait">
                                                    <img
                                                        loading="lazy"
                                                        src={`/storage/${doctor.image}`}
                                                        alt={doctor.name}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="doc-portrait empty">
                                                    <span className="empty-icon">🌸</span>
                                                </div>
                                            )}
                                            <div
                                                className={`doc-nameplate${i === 0 ? '' : ' pink'}`}
                                            >
                                                {doctor.nationality?.flag && (
                                                    <span className="doc-flag">
                                                        <img
                                                            src={doctor.nationality.flag}
                                                            alt={doctor.nationality.name}
                                                            loading="lazy"
                                                        />
                                                    </span>
                                                )}
                                                <div className="ar-name">
                                                    {doctor.name_ar}
                                                </div>
                                                <div className="en-name">{doctor.name}</div>
                                                <div className="role">
                                                    {doctor.job_ar}
                                                    <span className="role-en">
                                                        {doctor.job}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="doc-body">
                                                {doctor.qualifications.length > 0 && (
                                                    <>
                                                        <h4>
                                                            {EN.credentials} ·{' '}
                                                            {AR.credentials}
                                                        </h4>
                                                        <ul
                                                            className={`doc-list${isRtl ? ' ar-list' : ''}`}
                                                        >
                                                            {doctor.qualifications.map(
                                                                (q, qi) => (
                                                                    <li key={qi}>
                                                                        {isRtl
                                                                            ? q.name_ar ||
                                                                              q.name
                                                                            : q.name}
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </>
                                                )}
                                                {doctor.services.length > 0 && (
                                                    <>
                                                        <h4>
                                                            {EN.services} · {AR.services}
                                                        </h4>
                                                        <ul
                                                            className={`doc-list${isRtl ? ' ar-list' : ''}`}
                                                        >
                                                            {doctor.services.map(
                                                                (s, si) => (
                                                                    <li key={si}>
                                                                        {isRtl
                                                                            ? s.name_ar ||
                                                                              s.name
                                                                            : s.name}
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </>
                                                )}
                                                <div className="doc-cta">
                                                    <Link
                                                        className="book"
                                                        href={`/book/${doctor.id}`}
                                                    >
                                                        {t('obgyn.bookAppointment')}
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2.4"
                                                            width="13"
                                                            height="13"
                                                        >
                                                            <path d="M5 12h14M13 5l7 7-7 7" />
                                                        </svg>
                                                    </Link>
                                                    <a
                                                        className="wa"
                                                        href={WHATSAPP_LINK}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        {t('obgyn.whatsapp')}
                                                    </a>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ROOMS */}
                    <section
                        className="snap bg-paper short"
                        id="rooms"
                        style={{ paddingTop: 88, paddingBottom: 88 }}
                    >
                        <div className="wrap">
                            <div className="rooms-wrap">
                                <div>
                                    <div className="pkg-meta reveal">
                                        <span className="ar">{AR.roomsEyebrow}</span>
                                        <span className="sep" />
                                        <span>{EN.roomsEyebrow}</span>
                                    </div>
                                    <h2 className="h2-ar reveal d1">{AR.roomsTitle}</h2>
                                    {lang !== 'ar' && (
                                        <div className="h2-en reveal d2">
                                            {t('obgyn.roomsTitle')}
                                        </div>
                                    )}
                                    <span className="h2-rule reveal d2" />
                                    <p
                                        className="reveal d3"
                                        style={{
                                            margin: '20px 0 0',
                                            maxWidth: 440,
                                            fontSize: 15,
                                            lineHeight: 1.7,
                                            color: '#3a4262',
                                        }}
                                    >
                                        {t('obgyn.roomsLead')}
                                    </p>
                                    <div className="rooms-stats reveal d4">
                                        {roomsStats.map((stat) => (
                                            <div key={stat.label} className="stat">
                                                <div className="v">{stat.value}</div>
                                                <div className="l">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="rooms-grid reveal d2">
                                    {roomImages.map((file, i) => (
                                        <div
                                            key={file}
                                            className={`room${i === 0 ? ' big' : ''}`}
                                        >
                                            <img
                                                loading="lazy"
                                                src={`/obgyn-media/rooms/${file}`}
                                                alt={roomCaptions[i]}
                                            />
                                            <div className="room-cap">
                                                {roomCaptionsAr?.[i] && (
                                                    <span className="ar">
                                                        {roomCaptionsAr[i]}
                                                    </span>
                                                )}
                                                <span className="gold">
                                                    {roomCaptions[i]}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CONTACT */}
                    <section className="snap bg-cream" id="contact">
                        <div className="wrap">
                            <div className="contact-grid">
                                <div>
                                    <h2 className="h2-ar reveal">{AR.contactTitle}</h2>
                                    {lang !== 'ar' && (
                                        <div
                                            className="h2-en reveal"
                                            style={{
                                                fontSize: 'clamp(28px,3.5vw,48px)',
                                                margin: '0 0 4px',
                                                direction: 'ltr',
                                            }}
                                        >
                                            {t('obgyn.contactTitle')}
                                        </div>
                                    )}
                                    <span className="h2-rule reveal d1" />
                                    <p
                                        className="reveal d2"
                                        style={{
                                            margin: '20px 0 0',
                                            maxWidth: 400,
                                            fontSize: 16,
                                            lineHeight: 1.7,
                                            color: '#3a4262',
                                        }}
                                    >
                                        {t('obgyn.contactLead')}
                                    </p>
                                    <div className="contact-quick reveal d3">
                                        <a className="qrow" href={EMERGENCY_TEL}>
                                            <div className="qicon">
                                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                                    <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.4-1.1-.6-2.3-.6-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z" />
                                                </svg>
                                            </div>
                                            <div className="qmeta">
                                                <div className="l">
                                                    {t('obgyn.forInquiries')}
                                                </div>
                                                <div className="v">
                                                    <bdi dir="ltr">{EMERGENCY_PHONE}</bdi>
                                                </div>
                                            </div>
                                        </a>
                                        <a
                                            className="qrow"
                                            href={WHATSAPP_LINK}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <div className="qicon wa">
                                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                                    <path d="M17.5 14.4c-.3-.1-1.8-.9-2.1-1s-.5-.1-.7.2-.8 1-.9 1.1-.3.2-.6.1c-.9-.4-1.8-1-2.5-1.7-.7-.7-1.3-1.5-1.8-2.4-.2-.3 0-.4.1-.6l.5-.6c.1-.2.2-.3.2-.5 0-.2 0-.3-.1-.4l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1 2.8 1.1 3 2 3 4.8 4.2c1.8.7 2.5.8 3.4.6.5-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4M12 22h-.1c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4 1 1.1-3.9-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.7 0-5.9 4.8-10.7 10.7-10.7 2.9 0 5.5 1.1 7.6 3.1 2 2 3.1 4.7 3.1 7.6 0 5.9-4.8 10.7-10.6 10.7M20.5 3.5C18.2 1.2 15.2 0 12 0 5.4 0 .1 5.3.1 11.9c0 2.1.6 4.2 1.6 6L0 24l6.3-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 12-5.4 12-12 0-3.2-1.3-6.2-3.5-8.4" />
                                                </svg>
                                            </div>
                                            <div className="qmeta">
                                                <div className="l">
                                                    {t('obgyn.whatsapp')}
                                                </div>
                                                <div className="v">
                                                    {t('obgyn.whatsappChat')}
                                                </div>
                                            </div>
                                        </a>
                                        <div className="map-box">
                                            <iframe
                                                src={MAP_EMBED_SRC}
                                                title="Dar As Salama Hospital location"
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            />
                                            <a
                                                className="map-open"
                                                href={MAP_URL}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    width="13"
                                                    height="13"
                                                    style={{ fill: '#EA4335' }}
                                                >
                                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                                </svg>
                                                {t('obgyn.openInMaps')}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Form
                                        {...CallbackRequestController.storeForDepartment.form(
                                            department.slug,
                                        )}
                                        resetOnSuccess
                                        className="form-card reveal d2"
                                    >
                                        {({ processing, errors, wasSuccessful }) =>
                                            wasSuccessful ? (
                                                <div className="success-box">
                                                    <div className="check">
                                                        <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
                                                            <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                                                        </svg>
                                                    </div>
                                                    <h3>
                                                        {t('obgyn.callback.thankYouTitle')}
                                                    </h3>
                                                    <p>
                                                        {t('obgyn.callback.thankYouBody')}
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="form-title">
                                                        {t('obgyn.callback.title')}
                                                    </h3>
                                                    <p className="form-sub">
                                                        {t('obgyn.callback.sub')}
                                                    </p>

                                                    <div className="form-grid">
                                                        <div className="f">
                                                            <label htmlFor="og-name">
                                                                {t('obgyn.callback.fullName')}{' '}
                                                                *
                                                            </label>
                                                            <input
                                                                id="og-name"
                                                                name="name"
                                                                required
                                                                placeholder="Jane Doe"
                                                            />
                                                            {errors.name && (
                                                                <span className="field-error">
                                                                    {errors.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="f">
                                                            <label htmlFor="og-phone">
                                                                {t('obgyn.callback.phone')}{' '}
                                                                *
                                                            </label>
                                                            <div className="phone-row">
                                                                <span className="cc">
                                                                    +966
                                                                </span>
                                                                <input
                                                                    id="og-phone"
                                                                    name="phone"
                                                                    required
                                                                    placeholder="5XXXXXXXX"
                                                                    inputMode="numeric"
                                                                    maxLength={9}
                                                                />
                                                            </div>
                                                            {errors.phone && (
                                                                <span className="field-error">
                                                                    {errors.phone}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="f full">
                                                            <label htmlFor="og-package">
                                                                {t(
                                                                    'obgyn.callback.packageOfInterest',
                                                                )}
                                                            </label>
                                                            <select
                                                                id="og-package"
                                                                name="package_of_interest"
                                                                defaultValue=""
                                                            >
                                                                <option value="">
                                                                    {t(
                                                                        'obgyn.callback.selectPackage',
                                                                    )}
                                                                </option>
                                                                {packageOptions.map(
                                                                    (label) => (
                                                                        <option
                                                                            key={label}
                                                                            value={label}
                                                                        >
                                                                            {label}
                                                                        </option>
                                                                    ),
                                                                )}
                                                                <option
                                                                    value={
                                                                        t(
                                                                            'obgyn.callback.notSure',
                                                                        ) as string
                                                                    }
                                                                >
                                                                    {t(
                                                                        'obgyn.callback.notSure',
                                                                    )}
                                                                </option>
                                                            </select>
                                                        </div>
                                                        <div className="f">
                                                            <label htmlFor="og-contact">
                                                                {t(
                                                                    'obgyn.callback.preferredContact',
                                                                )}
                                                            </label>
                                                            <select
                                                                id="og-contact"
                                                                name="preferred_contact"
                                                                defaultValue="phone"
                                                            >
                                                                <option value="phone">
                                                                    {t(
                                                                        'obgyn.callback.phoneCall',
                                                                    )}
                                                                </option>
                                                                <option value="whatsapp">
                                                                    {t(
                                                                        'obgyn.callback.whatsapp',
                                                                    )}
                                                                </option>
                                                            </select>
                                                        </div>
                                                        <div className="f">
                                                            <label htmlFor="og-time">
                                                                {t(
                                                                    'obgyn.callback.bestTime',
                                                                )}
                                                            </label>
                                                            <select
                                                                id="og-time"
                                                                name="best_time"
                                                                defaultValue={
                                                                    t(
                                                                        'obgyn.callback.morning',
                                                                    ) as string
                                                                }
                                                            >
                                                                <option
                                                                    value={
                                                                        t(
                                                                            'obgyn.callback.morning',
                                                                        ) as string
                                                                    }
                                                                >
                                                                    {t(
                                                                        'obgyn.callback.morning',
                                                                    )}
                                                                </option>
                                                                <option
                                                                    value={
                                                                        t(
                                                                            'obgyn.callback.afternoon',
                                                                        ) as string
                                                                    }
                                                                >
                                                                    {t(
                                                                        'obgyn.callback.afternoon',
                                                                    )}
                                                                </option>
                                                                <option
                                                                    value={
                                                                        t(
                                                                            'obgyn.callback.evening',
                                                                        ) as string
                                                                    }
                                                                >
                                                                    {t(
                                                                        'obgyn.callback.evening',
                                                                    )}
                                                                </option>
                                                            </select>
                                                        </div>
                                                        <div className="f full">
                                                            <label htmlFor="og-notes">
                                                                {t('obgyn.callback.notes')}
                                                            </label>
                                                            <textarea
                                                                id="og-notes"
                                                                name="notes"
                                                                placeholder={
                                                                    t(
                                                                        'obgyn.callback.notesPlaceholder',
                                                                    ) as string
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="form-foot">
                                                        <div className="consent">
                                                            {t('obgyn.callback.consent')}
                                                        </div>
                                                        <button
                                                            className="submit-btn"
                                                            type="submit"
                                                            disabled={processing}
                                                        >
                                                            {processing
                                                                ? t('obgyn.callback.sending')
                                                                : t('obgyn.callback.submit')}
                                                            <svg
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2.4"
                                                                width="15"
                                                                height="15"
                                                            >
                                                                <path d="M5 12h14M13 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </>
                                            )
                                        }
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* floating actions */}
                <div className="float-actions">
                    <a
                        className="fab wa"
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noreferrer"
                        data-label={t('floatActions.whatsapp') as string}
                        aria-label={t('floatActions.whatsapp') as string}
                    >
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                            <path d="M17.5 14.4c-.3-.1-1.8-.9-2.1-1s-.5-.1-.7.2-.8 1-.9 1.1-.3.2-.6.1c-.9-.4-1.8-1-2.5-1.7-.7-.7-1.3-1.5-1.8-2.4-.2-.3 0-.4.1-.6l.5-.6c.1-.2.2-.3.2-.5 0-.2 0-.3-.1-.4l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1 2.8 1.1 3 2 3 4.8 4.2c1.8.7 2.5.8 3.4.6.5-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4M12 22h-.1c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4 1 1.1-3.9-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.7 0-5.9 4.8-10.7 10.7-10.7 2.9 0 5.5 1.1 7.6 3.1 2 2 3.1 4.7 3.1 7.6 0 5.9-4.8 10.7-10.6 10.7M20.5 3.5C18.2 1.2 15.2 0 12 0 5.4 0 .1 5.3.1 11.9c0 2.1.6 4.2 1.6 6L0 24l6.3-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 12-5.4 12-12 0-3.2-1.3-6.2-3.5-8.4" />
                        </svg>
                    </a>
                    <a
                        className="fab tel"
                        href={EMERGENCY_TEL}
                        data-label={t('floatActions.call') as string}
                        aria-label={t('floatActions.call') as string}
                    >
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                            <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.4-1.1-.6-2.3-.6-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z" />
                        </svg>
                    </a>
                </div>

                {/* footer banner */}
                <footer className="obgyn-footer">
                    <div className="obgyn-footer-inner">
                        <div className="bf-left">
                            www.dasmh.sa
                            <small>Dar As Salama Medical Hospital</small>
                        </div>
                        <div className="bf-center">
                            <div className="tag">{EN.heroTitle}</div>
                            <div className="ar">{AR.heroTitle}</div>
                        </div>
                        <div className="bf-right">
                            <div className="l">{t('obgyn.forInquiries')}</div>
                            <div className="num">
                                <bdi dir="ltr">{EMERGENCY_PHONE}</bdi>
                            </div>
                        </div>
                    </div>
                    <div className="bf-bottom">
                        <span>© 2026 Dar As Salama Medical Hospital · All rights reserved</span>
                        <span>Prices exclude VAT · T&amp;C apply · Transport within Khobar area</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
