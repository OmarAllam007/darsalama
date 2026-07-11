import { router } from '@inertiajs/react';
import {
    Baby,
    Bandage,
    Bone,
    Brain,
    BrainCircuit,
    Dna,
    Droplet,
    Ear,
    Eye,
    HeartPulse,
    LayoutGrid,
    Search,
    SearchX,
    ShieldPlus,
    Smile,
    Sparkles,
    Stethoscope,
    Users,
    UserRound,
    UsersRound,
    Venus,
    Wind,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { show as doctorProfileShow } from '@/routes/doctors';
import bannerPhoto from '@/site/assets/images/doctors/doc1.jpg';
import BookingModal from '@/site/components/BookingModal';
import OffersModal from '@/site/components/OffersModal';
import PageBanner from '@/site/components/PageBanner';
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

function matches(haystack: string, needle: string): boolean {
    return haystack.toLowerCase().includes(needle.toLowerCase());
}

export default function Doctors({
    departments,
}: {
    departments: Department[];
}) {
    const { t, lang } = useLanguage();
    const [view, setView] = useState<'departments' | 'doctors'>('departments');
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<number | 'all'>('all');
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

    const visibleDoctorDepartments = useMemo(() => {
        const byDepartment =
            filter === 'all'
                ? staffedDepartments
                : staffedDepartments.filter(
                      (department) => department.id === filter,
                  );

        const q = query.trim();

        if (!q) {
            return byDepartment;
        }

        return byDepartment
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
    }, [staffedDepartments, filter, query]);

    const totalDoctors = visibleDoctorDepartments.reduce(
        (sum, department) => sum + department.doctors.length,
        0,
    );

    function exploreDepartment(id: number) {
        setView('doctors');
        setFilter(id);
        requestAnimationFrame(() => {
            document
                .getElementById(`department-${id}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    return (
        <>
            <PageBanner
                eyebrow={t('doctors.eyebrow')}
                title={t('doctors.title')}
                intro={t('doctors.intro')}
                image={bannerPhoto}
            />

            <section className="directory">
                <div className="container">
                    <div className="directory-toolbar">
                        <div
                            className={`directory-tabs ${view === 'doctors' ? 'is-doctors' : ''}`}
                        >
                            <span
                                className="directory-tabs__thumb"
                                aria-hidden="true"
                            />
                            <button
                                type="button"
                                className={`directory-tab ${view === 'departments' ? 'is-active' : ''}`}
                                onClick={() => setView('departments')}
                            >
                                <LayoutGrid size={16} />
                                {t('doctors.tabDepartments')}
                            </button>
                            <button
                                type="button"
                                className={`directory-tab ${view === 'doctors' ? 'is-active' : ''}`}
                                onClick={() => setView('doctors')}
                            >
                                <UsersRound size={16} />
                                {t('doctors.tabDoctors')}
                            </button>
                        </div>

                        <label className="directory-search">
                            <Search size={17} />
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t('doctors.searchPlaceholder')}
                            />
                            {query && (
                                <button
                                    type="button"
                                    className="directory-search__clear"
                                    aria-label={t('doctors.clearSearch')}
                                    onClick={() => setQuery('')}
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </label>

                        <span className="directory-count">
                            {view === 'departments'
                                ? `${filteredDepartments.length} ${t('doctors.allDepartmentsLabel')}`
                                : `${totalDoctors} ${t('doctors.doctorsAvailableLabel')}`}
                        </span>
                    </div>

                    {view === 'departments' ? (
                        <div
                            className="department-grid directory-view"
                            key="departments"
                        >
                            {filteredDepartments.map((department, index) => {
                                const Icon = departmentIcon(department.name);
                                const services = departmentServiceLabels(
                                    department,
                                    lang,
                                );

                                return (
                                    <article
                                        className="department-card"
                                        style={
                                            {
                                                '--i': index,
                                            } as React.CSSProperties
                                        }
                                        key={department.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() =>
                                            exploreDepartment(department.id)
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Enter' ||
                                                e.key === ' '
                                            ) {
                                                e.preventDefault();
                                                exploreDepartment(
                                                    department.id,
                                                );
                                            }
                                        }}
                                    >
                                        <header className="department-card__head">
                                            <span className="department-card__icon">
                                                <Icon size={22} />
                                            </span>
                                            <div>
                                                <h3>
                                                    {lang === 'ar'
                                                        ? department.name_ar
                                                        : department.name}
                                                </h3>
                                                <p
                                                    dir={
                                                        lang === 'ar'
                                                            ? 'ltr'
                                                            : 'rtl'
                                                    }
                                                >
                                                    {lang === 'ar'
                                                        ? department.name
                                                        : department.name_ar}
                                                </p>
                                            </div>
                                        </header>

                                        {services.length > 0 && (
                                            <div className="department-card__tags">
                                                {services
                                                    .slice(0, 3)
                                                    .map((label) => (
                                                        <span
                                                            className="tag"
                                                            key={label}
                                                        >
                                                            {label}
                                                        </span>
                                                    ))}
                                                {services.length > 3 && (
                                                    <span className="tag tag--muted">
                                                        +{services.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="department-card__footer">
                                            <div className="avatar-stack">
                                                {department.doctors
                                                    .slice(0, 4)
                                                    .map((doctor) => (
                                                        <span
                                                            className="avatar-stack__item"
                                                            key={doctor.id}
                                                        >
                                                            {doctor.image ? (
                                                                <img
                                                                    src={`/storage/${doctor.image}`}
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <span className="avatar-stack__fallback">
                                                                    {doctor.name
                                                                        .replace(
                                                                            'Dr. ',
                                                                            '',
                                                                        )
                                                                        .charAt(
                                                                            0,
                                                                        )}
                                                                </span>
                                                            )}
                                                        </span>
                                                    ))}
                                                <span className="department-card__count">
                                                    {department.doctors
                                                        .length === 1
                                                        ? `1 ${t('doctors.doctorLabel')}`
                                                        : `${department.doctors.length} ${t('doctors.doctorsLabel')}`}
                                                </span>
                                            </div>
                                            <span className="department-card__explore">
                                                {t('doctors.explore')}{' '}
                                                <span aria-hidden="true">
                                                    →
                                                </span>
                                            </span>
                                        </div>
                                    </article>
                                );
                            })}

                            {filteredDepartments.length === 0 && (
                                <div className="directory-empty">
                                    <SearchX size={32} strokeWidth={1.5} />
                                    <p>{t('doctors.noResults')}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="directory-view" key="doctors">
                            <div className="department-pills">
                                <button
                                    type="button"
                                    style={{ '--i': 0 } as React.CSSProperties}
                                    className={`department-pill ${filter === 'all' ? 'is-active' : ''}`}
                                    onClick={() => setFilter('all')}
                                >
                                    <span className="department-pill__icon">
                                        <LayoutGrid size={22} />
                                    </span>
                                    <span className="department-pill__label">
                                        {t('doctors.all')}
                                    </span>
                                </button>
                                {staffedDepartments.map((department, index) => {
                                    const Icon = departmentIcon(
                                        department.name,
                                    );

                                    return (
                                        <button
                                            type="button"
                                            key={department.id}
                                            style={
                                                {
                                                    '--i': index + 1,
                                                } as React.CSSProperties
                                            }
                                            className={`department-pill ${filter === department.id ? 'is-active' : ''}`}
                                            onClick={() =>
                                                setFilter(department.id)
                                            }
                                        >
                                            <span className="department-pill__icon">
                                                <Icon size={22} />
                                            </span>
                                            <span className="department-pill__label">
                                                {lang === 'ar'
                                                    ? department.name_ar
                                                    : department.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {visibleDoctorDepartments.map((department) => {
                                const Icon = departmentIcon(department.name);

                                return (
                                    <div
                                        className="department-section"
                                        id={`department-${department.id}`}
                                        key={department.id}
                                    >
                                        <div className="department-banner">
                                            <span className="department-banner__icon">
                                                <Icon size={22} />
                                            </span>
                                            <div className="department-banner__text">
                                                <h3>
                                                    {lang === 'ar'
                                                        ? department.name_ar
                                                        : department.name}
                                                </h3>
                                                <p
                                                    dir={
                                                        lang === 'ar'
                                                            ? 'ltr'
                                                            : 'rtl'
                                                    }
                                                >
                                                    {lang === 'ar'
                                                        ? department.name
                                                        : department.name_ar}
                                                </p>
                                            </div>
                                            <span className="department-banner__count">
                                                {department.doctors.length === 1
                                                    ? `1 ${t('doctors.doctorLabel')}`
                                                    : `${department.doctors.length} ${t('doctors.doctorsLabel')}`}
                                            </span>
                                            <button
                                                type="button"
                                                className="btn btn--ghost-light btn--sm"
                                                onClick={() =>
                                                    setFilter(department.id)
                                                }
                                            >
                                                {t('doctors.openDepartment')}
                                            </button>
                                        </div>

                                        <div className="doctors__grid">
                                            {department.doctors.map(
                                                (doctor, index) => (
                                                    <article
                                                        className="doctor-card"
                                                        style={
                                                            {
                                                                '--i': index,
                                                            } as React.CSSProperties
                                                        }
                                                        key={doctor.id}
                                                        role="link"
                                                        tabIndex={0}
                                                        onClick={() =>
                                                            router.visit(
                                                                doctorProfileShow(
                                                                    doctor.id,
                                                                ).url,
                                                            )
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                    'Enter' ||
                                                                e.key === ' '
                                                            ) {
                                                                e.preventDefault();
                                                                router.visit(
                                                                    doctorProfileShow(
                                                                        doctor.id,
                                                                    ).url,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <div className="doctor-card__photo">
                                                            {doctor.image && (
                                                                <img
                                                                    src={`/storage/${doctor.image}`}
                                                                    alt={
                                                                        lang ===
                                                                        'ar'
                                                                            ? doctor.name_ar
                                                                            : doctor.name
                                                                    }
                                                                />
                                                            )}
                                                            {doctor.nationality
                                                                ?.flag && (
                                                                <span
                                                                    className="doctor-card__flag"
                                                                    title={
                                                                        lang ===
                                                                        'ar'
                                                                            ? doctor
                                                                                  .nationality
                                                                                  .name_ar
                                                                            : doctor
                                                                                  .nationality
                                                                                  .name
                                                                    }
                                                                >
                                                                    {
                                                                        doctor
                                                                            .nationality
                                                                            .flag
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="doctor-card__body">
                                                            <span className="doctor-card__title-link">
                                                                <h3>
                                                                    {lang ===
                                                                    'ar'
                                                                        ? doctor.name_ar
                                                                        : doctor.name}
                                                                </h3>
                                                            </span>
                                                            <p
                                                                dir={
                                                                    lang ===
                                                                    'ar'
                                                                        ? 'ltr'
                                                                        : 'rtl'
                                                                }
                                                                className="doctor-card__name-alt"
                                                            >
                                                                {lang === 'ar'
                                                                    ? doctor.name
                                                                    : doctor.name_ar}
                                                            </p>
                                                            <span className="doctor-card__job">
                                                                {lang === 'ar'
                                                                    ? doctor.job_ar
                                                                    : doctor.job}
                                                            </span>
                                                            <div className="doctor-card__actions">
                                                                {department.offers_count >
                                                                    0 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn--sand btn--sm"
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            setOffersDepartment(
                                                                                {
                                                                                    doctorName:
                                                                                        lang ===
                                                                                        'ar'
                                                                                            ? doctor.name_ar
                                                                                            : doctor.name,
                                                                                    offers: department.offers,
                                                                                },
                                                                            );
                                                                        }}
                                                                    >
                                                                        {t(
                                                                            'doctors.offers',
                                                                        )}
                                                                        <span className="badge">
                                                                            {
                                                                                department.offers_count
                                                                            }
                                                                        </span>
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    className="btn btn--ink btn--sm"
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        setBookingDoctor(
                                                                            doctor,
                                                                        );
                                                                    }}
                                                                >
                                                                    {t(
                                                                        'doctors.bookNow',
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </article>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {visibleDoctorDepartments.length === 0 && (
                                <div className="directory-empty">
                                    <SearchX size={32} strokeWidth={1.5} />
                                    <p>{t('doctors.noResults')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

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
