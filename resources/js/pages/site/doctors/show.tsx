import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarPlus,
    ChevronLeft,
    ChevronRight,
    Clock,
    PhoneCall,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { doctors as doctorsIndex } from '@/routes';
import BookingModal from '@/site/components/BookingModal';
import CallbackModal from '@/site/components/CallbackModal';
import DoctorProfileCard from '@/site/components/DoctorProfileCard';
import DoctorsHero from '@/site/components/DoctorsHero';
import OffersModal from '@/site/components/OffersModal';
import ScaledDoctorCard from '@/site/components/ScaledDoctorCard';
import { useLanguage } from '@/site/i18n/LanguageContext';

type NamePair = {
    name: string;
    name_ar: string;
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

type Package = {
    id: number;
    name_en: string;
    name_ar: string;
    name_ur: string | null;
    name_tl: string | null;
    description_en: string | null;
    description_ar: string | null;
    description_ur: string | null;
    description_tl: string | null;
    price: string | null;
};

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
    availabilities: { weekday: number }[];
    offers: Offer[];
    department: {
        id: number;
        name: string;
        name_ar: string;
        packages: Package[];
    };
};

const WEEKDAY_NAMES = {
    en: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
    ],
    ar: [
        'الإثنين',
        'الثلاثاء',
        'الأربعاء',
        'الخميس',
        'الجمعة',
        'السبت',
        'الأحد',
    ],
};

// The clinic week runs Saturday → Friday (Friday off), so day ranges are computed
// in that order rather than the Monday-first weekday numbering.
const CLINIC_WEEK_ORDER = [5, 6, 0, 1, 2, 3, 4];

function workingDaysLabel(
    weekdays: number[],
    lang: 'en' | 'ar',
): string | null {
    if (weekdays.length === 0) {
        return null;
    }

    const names = WEEKDAY_NAMES[lang] ?? WEEKDAY_NAMES.en;
    const positions = [...new Set(weekdays)]
        .map((day) => CLINIC_WEEK_ORDER.indexOf(day))
        .sort((a, b) => a - b);
    const isContiguous =
        positions[positions.length - 1] - positions[0] + 1 ===
        positions.length;

    if (isContiguous && positions.length > 1) {
        const first = CLINIC_WEEK_ORDER[positions[0]];
        const last = CLINIC_WEEK_ORDER[positions[positions.length - 1]];

        return `${names[first]} – ${names[last]}`;
    }

    return positions.map((p) => names[CLINIC_WEEK_ORDER[p]]).join(', ');
}

function to12Hour(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;

    return minute === 0
        ? `${hour12} ${period}`
        : `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

function formatWorkingHours(
    windows: { start: string; end: string }[],
): string {
    return windows
        .map((w) => `${to12Hour(w.start)} – ${to12Hour(w.end)}`)
        .join(' & ');
}

export default function DoctorProfile({
    doctor,
    workingWeekdays,
    workingHours,
}: {
    doctor: Doctor;
    workingWeekdays: number[];
    workingHours: { start: string; end: string }[] | null;
}) {
    const { t, lang, isRtl } = useLanguage();
    const pickField = (row: Package, base: string): string => {
        const fields = row as unknown as Record<string, string | null>;
        const value = fields[`${base}_${lang}`];

        if (typeof value === 'string' && value.length > 0) {
            return value;
        }

        return fields[`${base}_en`] ?? '';
    };
    const [expandOpen, setExpandOpen] = useState(false);
    const [bookingOpen, setBookingOpen] = useState(false);
    const [callbackOpen, setCallbackOpen] = useState(false);
    const [offersOpen, setOffersOpen] = useState(false);
    const BackArrow = isRtl ? ArrowRight : ArrowLeft;
    const DeptChevron = isRtl ? ChevronRight : ChevronLeft;
    const doctorName = lang === 'ar' ? doctor.name_ar : doctor.name;
    const departmentName =
        lang === 'ar' ? doctor.department.name_ar : doctor.department.name;

    useEffect(() => {
        if (!expandOpen) {
            return;
        }

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';
        };
    }, [expandOpen]);

    const days = workingDaysLabel(workingWeekdays, lang);
    const daysAlt = workingDaysLabel(
        workingWeekdays,
        lang === 'ar' ? 'en' : 'ar',
    );

    const offerCards = [
        ...doctor.offers.map((offer) => ({
            id: `offer-${offer.id}`,
            title: offer.title,
            description: offer.description,
            tag: t('doctorProfile.offer'),
        })),
        ...doctor.department.packages.map((pkg) => ({
            id: `package-${pkg.id}`,
            title: pickField(pkg, 'name'),
            description: pickField(pkg, 'description'),
            tag: t('doctorProfile.package'),
        })),
    ];

    const modalOfferCards = [
        ...doctor.offers.map((offer) => ({
            id: `offer-${offer.id}`,
            image: offer.image,
            title: offer.title,
            subtitle: null as string | null,
            description: offer.description,
            price: offer.price,
            original_price: offer.original_price,
            is_expired: offer.is_expired,
            tag: t('doctorProfile.offer'),
        })),
        ...doctor.department.packages.map((pkg) => ({
            id: `package-${pkg.id}`,
            image: null as string | null,
            title: pickField(pkg, 'name'),
            subtitle: pkg.name_en,
            description: pickField(pkg, 'description'),
            price: pkg.price,
            original_price: null as string | null,
            is_expired: false,
            tag: t('doctorProfile.package'),
        })),
    ];

    return (
        <>
            <Head title={doctorName}>
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
                onBrowseDepartments={() => router.visit(doctorsIndex())}
                onBrowseDoctors={() =>
                    router.visit(`${doctorsIndex().url}?mode=docs`)
                }
            />

            <div className="dsm dsm-page" dir={isRtl ? 'rtl' : 'ltr'}>
                <div
                    style={{
                        maxWidth: 1300,
                        margin: '0 auto',
                        padding: '34px 24px 80px',
                    }}
                >
                    <nav
                        className="crumb"
                        style={{
                            position: 'static',
                            background: 'transparent',
                            backdropFilter: 'none',
                        }}
                    >
                        <Link href={doctorsIndex()}>
                            <BackArrow size={16} />
                            {t('doctors.tabDoctors')}
                        </Link>
                        <span className="sep">/</span>
                        <Link
                            className="crumb-dept"
                            href={`${doctorsIndex().url}?department=${doctor.department.id}`}
                        >
                            <DeptChevron size={16} />
                            {departmentName}
                        </Link>
                        <span className="sep">/</span>
                        <span className="here">{doctorName}</span>
                    </nav>

                    <div className="profile-post">
                        <ScaledDoctorCard>
                            <DoctorProfileCard
                                doctor={doctor}
                                departmentName={doctor.department.name}
                                departmentNameAr={doctor.department.name_ar}
                                onExpand={() => setExpandOpen(true)}
                                expandLabel={t('doctorProfile.enlargePhoto')}
                            />
                        </ScaledDoctorCard>

                        <div className="p-extra">
                            <div>
                                <div className="xlabel">
                                    {t('doctorProfile.workingHours')}
                                    <span className="ar">أوقات العمل</span>
                                </div>
                                <div className="hours-card">
                                    <span className="h-ico">
                                        <Clock size={22} />
                                    </span>
                                    <div>
                                        <div className="h-days">
                                            {days ??
                                                t('doctorProfile.hoursVary')}
                                        </div>
                                        <span className="ar">
                                            {daysAlt ??
                                                t('doctorProfile.checkBooking')}
                                        </span>
                                    </div>
                                    <div className="h-shift">
                                        <span className="badge">
                                            {workingHours &&
                                            workingHours.length > 0
                                                ? formatWorkingHours(
                                                      workingHours,
                                                  )
                                                : t('doctorProfile.hoursVary')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="x-actions">
                                <button
                                    type="button"
                                    className="x-book"
                                    onClick={() => setBookingOpen(true)}
                                >
                                    <CalendarPlus size={18} />
                                    {t('doctors.bookNow')}
                                </button>
                            </div>
                            <div className="x-actions" style={{ marginTop: 10 }}>
                                <button
                                    type="button"
                                    className="x-call"
                                    onClick={() => setCallbackOpen(true)}
                                >
                                    <PhoneCall size={18} />
                                    {t('doctorProfile.requestCallback')}
                                </button>
                            </div>

                            <div>
                                <div className="xlabel">
                                    {t('doctors.offers')}
                                    <span className="ar">العروض</span>
                                </div>
                                {offerCards.length > 0 ? (
                                    <div className="x-offers">
                                        {offerCards.map((offer) => (
                                            <div
                                                className="offer"
                                                key={offer.id}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() =>
                                                    setOffersOpen(true)
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === 'Enter' ||
                                                        e.key === ' '
                                                    ) {
                                                        e.preventDefault();
                                                        setOffersOpen(true);
                                                    }
                                                }}
                                            >
                                                <span className="o-tag">
                                                    {offer.tag}
                                                </span>
                                                <div className="o-title">
                                                    {offer.title}
                                                </div>
                                                <div className="o-desc">
                                                    {offer.description}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="x-nooffers">
                                        {t('doctors.noOffers')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {expandOpen && (
                <div
                    className="dsm dp-expand-lb"
                    onClick={() => setExpandOpen(false)}
                >
                    <button
                        type="button"
                        className="olb-x"
                        aria-label="Close"
                        onClick={() => setExpandOpen(false)}
                    >
                        <X size={22} />
                    </button>
                    <div className="dp" onClick={(e) => e.stopPropagation()}>
                        <div className="dp-scaler">
                            <DoctorProfileCard
                                doctor={doctor}
                                departmentName={doctor.department.name}
                                departmentNameAr={doctor.department.name_ar}
                            />
                        </div>
                    </div>
                </div>
            )}

            <BookingModal
                doctor={bookingOpen ? doctor : null}
                open={bookingOpen}
                onOpenChange={setBookingOpen}
            />

            <CallbackModal
                doctor={callbackOpen ? doctor : null}
                open={callbackOpen}
                onOpenChange={setCallbackOpen}
                packageOptions={offerCards.map((offer) => offer.title)}
            />

            <OffersModal
                doctorName={doctorName}
                offers={modalOfferCards}
                open={offersOpen}
                onOpenChange={setOffersOpen}
            />
        </>
    );
}
