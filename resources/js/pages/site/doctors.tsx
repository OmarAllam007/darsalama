import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Baby,
    Bandage,
    Bone,
    Brain,
    BrainCircuit,
    CalendarPlus,
    Dna,
    Droplet,
    Ear,
    Eye,
    HeartPulse,
    LayoutGrid,
    RotateCcw,
    Search,
    ShieldPlus,
    Smile,
    Sparkles,
    Stethoscope,
    Tag,
    Users,
    UserRound,
    UserX,
    Venus,
    Wind,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { show as doctorProfileShow } from '@/routes/doctors';
import BookingModal from '@/site/components/BookingModal';
import DoctorsHero from '@/site/components/DoctorsHero';
import DoctorsIdleScreensaver from '@/site/components/DoctorsIdleScreensaver';
import FloatActions from '@/site/components/FloatActions';
import OffersModal from '@/site/components/OffersModal';
import { useLanguage } from '@/site/i18n/LanguageContext';

type Service = {
    name: string;
    name_ar: string;
};

type Doctor = {
    id: number;
    name: string;
    name_ar: string;
    job: string;
    job_ar: string;
    image: string | null;
    nationality: { name: string; name_ar: string; flag: string | null } | null;
    services: Service[];
    availabilities: { weekday: number }[];
};

type Offer = {
    id: number;
    title: string;
    description: string;
    image: string | null;
    price: string | null;
    original_price: string | null;
    is_expired: boolean;
};

type Department = {
    id: number;
    name: string;
    name_ar: string;
    doctors: Doctor[];
    offers: Offer[];
    offers_count: number;
};

const DEPARTMENT_ICONS: Record<string, LucideIcon> = {
    Gynecology: Venus,
    OBGyn: Venus,
    Pediatrics: Baby,
    'Internal Medicine': Stethoscope,
    'General Surgery': Bandage,
    Orthopedics: Bone,
    Dermatology: Sparkles,
    Cardiology: HeartPulse,
    ENT: Ear,
    Ophthalmology: Eye,
    Urology: Droplet,
    Dental: Smile,
    'Spine Surgery & Neurology': Brain,
    Rheumatology: Bandage,
    Pulmonology: Wind,
    'Family Medicine': Users,
    'General Practice': UserRound,
    Endocrinology: Dna,
    Psychiatry: BrainCircuit,
};

function departmentIcon(name: string): LucideIcon {
    return DEPARTMENT_ICONS[name] ?? ShieldPlus;
}

function departmentServiceLabels(
    department: Department,
    lang: 'en' | 'ar',
): string[] {
    const seen = new Set<string>();

    for (const doctor of department.doctors) {
        for (const service of doctor.services) {
            seen.add(lang === 'ar' ? service.name_ar : service.name);
        }
    }

    return [...seen];
}

function departmentServices(department: Department): Service[] {
    const seen = new Map<string, Service>();

    for (const doctor of department.doctors) {
        for (const service of doctor.services) {
            if (!seen.has(service.name)) {
                seen.set(service.name, service);
            }
        }
    }

    return [...seen.values()];
}

function matches(haystack: string, needle: string): boolean {
    return haystack.toLowerCase().includes(needle.toLowerCase());
}

function DoctorCard({
    doctor,
    department,
    lang,
    t,
    matchedService,
    onBook,
    onOffers,
}: {
    doctor: Doctor;
    department: Department;
    lang: 'en' | 'ar';
    t: (key: string) => string;
    matchedService: string | null;
    onBook: () => void;
    onOffers: () => void;
}) {
    const initials = doctor.name
        .replace(/^Dr\.?\s*/i, '')
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <article
            className="doc"
            role="link"
            tabIndex={0}
            onClick={() => router.visit(doctorProfileShow(doctor.id).url)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.visit(doctorProfileShow(doctor.id).url);
                }
            }}
        >
            <div className={doctor.image ? 'doc-portrait' : 'doc-portrait mono'}>
                {doctor.image ? (
                    <img
                        src={`/storage/${doctor.image}`}
                        alt={lang === 'ar' ? doctor.name_ar : doctor.name}
                    />
                ) : (
                    <span className="initials">{initials}</span>
                )}
                {doctor.nationality?.flag && (
                    <span className="d2-flag">
                        <img
                            src={doctor.nationality.flag}
                            alt={doctor.nationality.name}
                            loading="lazy"
                        />
                    </span>
                )}
                <div className="d2-scrim" />
                <div className="d2-id">
                    <div className="nm">
                        {lang === 'ar' ? doctor.name_ar : doctor.name}
                    </div>
                    <div className="nm-ar">
                        {lang === 'ar' ? '' : doctor.name_ar}
                    </div>
                    <span className="rule" />
                    <div className="role">
                        {lang === 'ar' ? doctor.job_ar : doctor.job}
                    </div>
                </div>
            </div>
            <div className="doc-body">
                <div className="svc-tags">
                    {doctor.services.slice(0, 4).map((service) => (
                        <span
                            className={
                                service.name === matchedService
                                    ? 'svc-tag match'
                                    : 'svc-tag'
                            }
                            key={service.name}
                        >
                            {lang === 'ar' ? service.name_ar : service.name}
                        </span>
                    ))}
                </div>
                <div className="doc-cta">
                    <button
                        type="button"
                        className="btn-view"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.visit(doctorProfileShow(doctor.id).url);
                        }}
                    >
                        <Eye size={14} />
                        {t('doctors.viewProfile')}
                    </button>
                    <button
                        type="button"
                        className="btn-book"
                        onClick={(e) => {
                            e.stopPropagation();
                            onBook();
                        }}
                    >
                        <CalendarPlus size={14} />
                        {t('doctors.bookNow')}
                    </button>
                    {department.offers_count > 0 && (
                        <button
                            type="button"
                            className="btn-offers"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOffers();
                            }}
                        >
                            <Tag size={14} />
                            {t('doctors.offers')}
                            <span className="obadge">
                                {department.offers_count}
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function Doctors({
    departments,
}: {
    departments: Department[];
}) {
    const { t, lang } = useLanguage();
    const isRtl = lang === 'ar';
    const [view, setView] = useState<'departments' | 'doctors'>(() =>
        new URLSearchParams(window.location.search).get('mode') === 'docs'
            ? 'doctors'
            : 'departments',
    );
    const [query, setQuery] = useState('');
    const [detail, setDetail] = useState<Department | null>(null);
    const [selectedServices, setSelectedServices] = useState<Set<string>>(
        new Set(),
    );
    const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
    const [offersDepartment, setOffersDepartment] = useState<{
        doctorName: string;
        offers: Offer[];
    } | null>(null);

    const staffedDepartments = useMemo(
        () => departments.filter((department) => department.doctors.length > 0),
        [departments],
    );

    const filteredDepartments = useMemo(() => {
        const q = query.trim();

        if (!q) {
            return staffedDepartments;
        }

        return staffedDepartments.filter((department) => {
            if (matches(department.name, q) || matches(department.name_ar, q)) {
                return true;
            }

            return departmentServiceLabels(department, lang).some((label) =>
                matches(label, q),
            );
        });
    }, [staffedDepartments, query, lang]);

    const allDoctorsGroups = useMemo(() => {
        const q = query.trim();

        if (!q) {
            return staffedDepartments;
        }

        return staffedDepartments
            .map((department) => ({
                ...department,
                doctors: department.doctors.filter(
                    (doctor) =>
                        matches(doctor.name, q) ||
                        matches(doctor.name_ar, q) ||
                        matches(department.name, q) ||
                        matches(department.name_ar, q),
                ),
            }))
            .filter((department) => department.doctors.length > 0);
    }, [staffedDepartments, query]);

    const totalDoctors = staffedDepartments.reduce(
        (sum, department) => sum + department.doctors.length,
        0,
    );

    const openDetail = (department: Department) => {
        setSelectedServices(new Set());
        setDetail(department);
        requestAnimationFrame(() => {
            document
                .getElementById('crumb')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    useEffect(() => {
        const departmentId = new URLSearchParams(window.location.search).get(
            'department',
        );

        if (!departmentId) {
            return;
        }

        const department = staffedDepartments.find(
            (d) => String(d.id) === departmentId,
        );

        if (department) {
            setSelectedServices(new Set());
            setDetail(department);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [staffedDepartments]);

    const detailServices = detail ? departmentServices(detail) : [];
    const detailDoctors = detail
        ? detail.doctors.filter(
              (doctor) =>
                  selectedServices.size === 0 ||
                  doctor.services.some((s) => selectedServices.has(s.name)),
          )
        : [];

    function toggleService(name: string) {
        setSelectedServices((prev) => {
            const next = new Set(prev);

            if (next.has(name)) {
                next.delete(name);
            } else {
                next.add(name);
            }

            return next;
        });
    }

    const idleEnabled = !detail && !bookingDoctor && !offersDepartment;

    return (
        <>
            <Head title={t('doctors.title')}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin=""
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=Inter:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap"
                />
            </Head>

            <DoctorsHero
                onBrowseDepartments={() => {
                    setDetail(null);
                    setView('departments');
                    document
                        .getElementById('toolbar')
                        ?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                        });
                }}
                onBrowseDoctors={() => {
                    setDetail(null);
                    setView('doctors');
                    document
                        .getElementById('toolbar')
                        ?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                        });
                }}
            />

            <div className="dsm dsm-page" dir={isRtl ? 'rtl' : 'ltr'}>
                <section className="intro">
                    <div className="eyebrow">
                        <span className="dot" />
                        {t('doctors.eyebrow')}
                    </div>
                    <h1>{t('doctors.title')}</h1>
                    <p className="sub">{t('doctors.intro')}</p>
                    <span className="rule" />
                </section>

                <div className="toolbar" id="toolbar">
                    <div className="mode-toggle">
                        <button
                            type="button"
                            className={
                                view === 'departments' && !detail ? 'on' : ''
                            }
                            onClick={() => {
                                setDetail(null);
                                setView('departments');
                            }}
                        >
                            <LayoutGrid size={16} />
                            {t('doctors.tabDepartments')}
                        </button>
                        <button
                            type="button"
                            className={
                                view === 'doctors' && !detail ? 'on' : ''
                            }
                            onClick={() => {
                                setDetail(null);
                                setView('doctors');
                            }}
                        >
                            <Users size={16} />
                            {t('doctors.tabDoctors')}
                        </button>
                    </div>

                    <div className="search-box">
                        <Search size={19} />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('doctors.searchPlaceholder')}
                        />
                    </div>

                    <span className="result-count">
                        {detail
                            ? `${detailDoctors.length} ${detailDoctors.length === 1 ? t('doctors.doctorLabel') : t('doctors.doctorsLabel')}`
                            : view === 'departments'
                              ? `${filteredDepartments.length} ${t('doctors.allDepartmentsLabel')}`
                              : `${totalDoctors} ${t('doctors.doctorsAvailableLabel')}`}
                    </span>
                </div>

                <main>
                    {detail ? (
                        <div className="view">
                            <nav className="crumb" id="crumb">
                                <button
                                    type="button"
                                    onClick={() => setDetail(null)}
                                >
                                    {isRtl ? (
                                        <ArrowRight size={16} />
                                    ) : (
                                        <ArrowLeft size={16} />
                                    )}
                                    {t('doctors.tabDepartments')}
                                </button>
                                <span className="sep">/</span>
                                <span className="here">
                                    {lang === 'ar'
                                        ? detail.name_ar
                                        : detail.name}
                                </span>
                            </nav>

                            <div className="dhero">
                                <div className="dh-wm">
                                    {(() => {
                                        const Icon = departmentIcon(
                                            detail.name,
                                        );

                                        return <Icon size={160} />;
                                    })()}
                                </div>
                                <div className="dh-content">
                                    <div className="dh-ico">
                                        {(() => {
                                            const Icon = departmentIcon(
                                                detail.name,
                                            );

                                            return <Icon size={26} />;
                                        })()}
                                    </div>
                                    <div className="dh-en">
                                        {lang === 'ar'
                                            ? detail.name_ar
                                            : detail.name}
                                    </div>
                                    <div className="dh-ar">
                                        {lang === 'ar'
                                            ? detail.name
                                            : detail.name_ar}
                                    </div>
                                    <div className="dh-stats">
                                        <span className="st">
                                            <Users size={14} />
                                            <b>{detail.doctors.length}</b>{' '}
                                            {detail.doctors.length === 1
                                                ? t('doctors.doctorLabel')
                                                : t('doctors.doctorsLabel')}
                                        </span>
                                        {detail.offers_count > 0 && (
                                            <span className="st">
                                                <Tag size={14} />
                                                <b>
                                                    {detail.offers_count}
                                                </b>{' '}
                                                {t('doctors.offers')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="detail-layout">
                                <aside className="filter-panel">
                                    <div className="fp-head">
                                        <h3>
                                            {t('doctors.filterServicesTitle')}
                                        </h3>
                                    </div>
                                    <p className="fp-hint">
                                        {t('doctors.filterHint')}
                                    </p>
                                    <div className="svc-list">
                                        {detailServices.map((service) => {
                                            const count = detail.doctors.filter(
                                                (d) =>
                                                    d.services.some(
                                                        (s) =>
                                                            s.name ===
                                                            service.name,
                                                    ),
                                            ).length;
                                            const on = selectedServices.has(
                                                service.name,
                                            );

                                            return (
                                                <button
                                                    type="button"
                                                    key={service.name}
                                                    className={
                                                        on
                                                            ? 'svc-chip on'
                                                            : 'svc-chip'
                                                    }
                                                    onClick={() =>
                                                        toggleService(
                                                            service.name,
                                                        )
                                                    }
                                                >
                                                    <span className="check">
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="3"
                                                        >
                                                            <path d="M20 6 9 17l-5-5" />
                                                        </svg>
                                                    </span>
                                                    <span className="svc-tt">
                                                        {lang === 'ar'
                                                            ? service.name_ar
                                                            : service.name}
                                                    </span>
                                                    <span className="svc-cnt">
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        type="button"
                                        className="clear-filter"
                                        disabled={selectedServices.size === 0}
                                        onClick={() =>
                                            setSelectedServices(new Set())
                                        }
                                    >
                                        <RotateCcw size={14} />
                                        {t('doctors.clearFilters')}
                                    </button>
                                </aside>

                                <div>
                                    <div className="docs-head">
                                        <div className="lbl">
                                            {t('doctors.showing')}{' '}
                                            <b>{detailDoctors.length}</b>{' '}
                                            {t('doctors.of')}{' '}
                                            {detail.doctors.length}
                                        </div>
                                        {selectedServices.size > 0 && (
                                            <div className="active-filters">
                                                {[...selectedServices].map(
                                                    (name) => {
                                                        const svc =
                                                            detailServices.find(
                                                                (s) =>
                                                                    s.name ===
                                                                    name,
                                                            );

                                                        return (
                                                            <span
                                                                className="af"
                                                                key={name}
                                                            >
                                                                {svc
                                                                    ? lang ===
                                                                      'ar'
                                                                        ? svc.name_ar
                                                                        : svc.name
                                                                    : name}
                                                                <X
                                                                    size={12}
                                                                    onClick={() =>
                                                                        toggleService(
                                                                            name,
                                                                        )
                                                                    }
                                                                />
                                                            </span>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {detailDoctors.length > 0 ? (
                                        <div className="docs-grid">
                                            {detailDoctors.map((doctor) => (
                                                <DoctorCard
                                                    key={doctor.id}
                                                    doctor={doctor}
                                                    department={detail}
                                                    lang={lang}
                                                    t={t}
                                                    matchedService={
                                                        [
                                                            ...selectedServices,
                                                        ][0] ?? null
                                                    }
                                                    onBook={() =>
                                                        setBookingDoctor(doctor)
                                                    }
                                                    onOffers={() =>
                                                        setOffersDepartment({
                                                            doctorName:
                                                                lang === 'ar'
                                                                    ? doctor.name_ar
                                                                    : doctor.name,
                                                            offers: detail.offers,
                                                        })
                                                    }
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-state">
                                            <UserX
                                                size={32}
                                                strokeWidth={1.5}
                                            />
                                            <p>{t('doctors.comingSoon')}</p>
                                        </div>
                                    )}

                                    <div className="detail-back-wrap">
                                        <button
                                            type="button"
                                            className="detail-back"
                                            onClick={() => setDetail(null)}
                                        >
                                            {isRtl ? (
                                                <ArrowRight size={17} />
                                            ) : (
                                                <ArrowLeft size={17} />
                                            )}
                                            {t('doctors.backToDepartments')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : view === 'departments' ? (
                        <div className="view">
                            <div className="dept-grid">
                                {filteredDepartments.map((department) => {
                                    const Icon = departmentIcon(
                                        department.name,
                                    );
                                    const services = departmentServiceLabels(
                                        department,
                                        lang,
                                    );

                                    return (
                                        <button
                                            type="button"
                                            className="dept-card"
                                            key={department.id}
                                            onClick={() =>
                                                openDetail(department)
                                            }
                                        >
                                            <div className="dc-media">
                                                <span className="dc-wm">
                                                    <Icon size={104} />
                                                </span>
                                                <span className="dc-gold" />
                                                <div className="dc-titles">
                                                    <div className="nm-en">
                                                        {lang === 'ar'
                                                            ? department.name_ar
                                                            : department.name}
                                                    </div>
                                                    <div className="nm-ar">
                                                        {lang === 'ar'
                                                            ? department.name
                                                            : department.name_ar}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="dc-body">
                                                {services.length > 0 && (
                                                    <div className="dc-svcs">
                                                        {services
                                                            .slice(0, 3)
                                                            .map((label) => (
                                                                <span
                                                                    className="s"
                                                                    key={label}
                                                                >
                                                                    {label}
                                                                </span>
                                                            ))}
                                                        {services.length >
                                                            3 && (
                                                            <span className="s more">
                                                                +
                                                                {services.length -
                                                                    3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="dc-foot">
                                                <span className="dc-avs">
                                                    {department.doctors
                                                        .slice(0, 4)
                                                        .map((doctor) =>
                                                            doctor.image ? (
                                                                <img
                                                                    key={
                                                                        doctor.id
                                                                    }
                                                                    src={`/storage/${doctor.image}`}
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <span
                                                                    className="av-mono"
                                                                    key={
                                                                        doctor.id
                                                                    }
                                                                >
                                                                    {doctor.name
                                                                        .replace(
                                                                            'Dr. ',
                                                                            '',
                                                                        )
                                                                        .charAt(
                                                                            0,
                                                                        )}
                                                                </span>
                                                            ),
                                                        )}
                                                </span>
                                                <span className="dc-cnt">
                                                    <b>
                                                        {
                                                            department.doctors
                                                                .length
                                                        }
                                                    </b>{' '}
                                                    {department.doctors
                                                        .length === 1
                                                        ? t(
                                                              'doctors.doctorLabel',
                                                          )
                                                        : t(
                                                              'doctors.doctorsLabel',
                                                          )}
                                                </span>
                                                <span className="go">
                                                    {t('doctors.explore')}
                                                    {isRtl ? (
                                                        <ArrowLeft size={15} />
                                                    ) : (
                                                        <ArrowRight size={15} />
                                                    )}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {filteredDepartments.length === 0 && (
                                <div className="empty-state">
                                    <UserX size={32} strokeWidth={1.5} />
                                    <p>{t('doctors.noResults')}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="view">
                            {allDoctorsGroups.map((department) => {
                                const Icon = departmentIcon(department.name);

                                return (
                                    <div
                                        className="doc-group"
                                        id={`department-${department.id}`}
                                        key={department.id}
                                    >
                                        <div className="doc-group-head">
                                            <span className="ico">
                                                <Icon size={20} />
                                            </span>
                                            <div className="tt">
                                                <div className="en">
                                                    {lang === 'ar'
                                                        ? department.name_ar
                                                        : department.name}
                                                </div>
                                                <div className="ar">
                                                    {lang === 'ar'
                                                        ? department.name
                                                        : department.name_ar}
                                                </div>
                                            </div>
                                            <span className="cnt">
                                                {department.doctors.length}{' '}
                                                {department.doctors.length === 1
                                                    ? t('doctors.doctorLabel')
                                                    : t('doctors.doctorsLabel')}
                                            </span>
                                        </div>

                                        <div className="docs-grid">
                                            {department.doctors.map(
                                                (doctor) => (
                                                    <DoctorCard
                                                        key={doctor.id}
                                                        doctor={doctor}
                                                        department={department}
                                                        lang={lang}
                                                        t={t}
                                                        matchedService={null}
                                                        onBook={() =>
                                                            setBookingDoctor(
                                                                doctor,
                                                            )
                                                        }
                                                        onOffers={() =>
                                                            setOffersDepartment(
                                                                {
                                                                    doctorName:
                                                                        lang ===
                                                                        'ar'
                                                                            ? doctor.name_ar
                                                                            : doctor.name,
                                                                    offers: department.offers,
                                                                },
                                                            )
                                                        }
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {allDoctorsGroups.length === 0 && (
                                <div className="empty-state">
                                    <UserX size={32} strokeWidth={1.5} />
                                    <p>{t('doctors.noResults')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            <FloatActions />

            <DoctorsIdleScreensaver
                departments={staffedDepartments}
                enabled={idleEnabled}
            />

            <BookingModal
                doctor={bookingDoctor}
                open={bookingDoctor !== null}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setBookingDoctor(null);
                    }
                }}
            />

            <OffersModal
                doctorName={offersDepartment?.doctorName ?? null}
                offers={offersDepartment?.offers ?? []}
                open={offersDepartment !== null}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setOffersDepartment(null);
                    }
                }}
            />
        </>
    );
}
