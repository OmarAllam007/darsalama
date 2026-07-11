import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarPlus,
    Check,
    Clock,
    Globe,
    Maximize2,
    Phone,
    PhoneCall,
} from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { doctors as doctorsIndex } from '@/routes';
import BookingModal from '@/site/components/BookingModal';
import CallbackModal from '@/site/components/CallbackModal';
import OffersModal from '@/site/components/OffersModal';
import WhatsAppIcon from '@/site/components/WhatsAppIcon';
import {
    EMERGENCY_PHONE,
    EMERGENCY_TEL,
    HOSPITAL_NAME_AR,
    HOSPITAL_NAME_EN,
    WHATSAPP_LINK,
} from '@/site/i18n/constants';
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
};

type Package = {
    id: number;
    name: string;
    name_ar: string;
    description: string;
    price: string;
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
    department: {
        id: number;
        name: string;
        name_ar: string;
        offers: Offer[];
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

function workingDaysLabel(
    weekdays: number[],
    lang: 'en' | 'ar',
): string | null {
    if (weekdays.length === 0) {
        return null;
    }

    const sorted = [...new Set(weekdays)].sort((a, b) => a - b);
    const names = WEEKDAY_NAMES[lang];
    const isContiguous =
        sorted[sorted.length - 1] - sorted[0] + 1 === sorted.length;

    if (isContiguous && sorted.length > 1) {
        return `${names[sorted[0]]} – ${names[sorted[sorted.length - 1]]}`;
    }

    return sorted.map((day) => names[day]).join(', ');
}

export default function DoctorProfile({ doctor }: { doctor: Doctor }) {
    const { t, lang } = useLanguage();
    const [photoOpen, setPhotoOpen] = useState(false);
    const [bookingOpen, setBookingOpen] = useState(false);
    const [callbackOpen, setCallbackOpen] = useState(false);
    const [offersOpen, setOffersOpen] = useState(false);
    const BackArrow = lang === 'ar' ? ArrowRight : ArrowLeft;
    const doctorName = lang === 'ar' ? doctor.name_ar : doctor.name;

    const days = workingDaysLabel(
        doctor.availabilities.map((a) => a.weekday),
        lang,
    );

    const offerCards = [
        ...doctor.department.offers.map((offer) => ({
            id: `offer-${offer.id}`,
            image: offer.image,
            title: offer.title,
            subtitle: null as string | null,
            description: offer.description,
            price: null as string | null,
            tag: t('doctorProfile.offer'),
        })),
        ...doctor.department.packages.map((pkg) => ({
            id: `package-${pkg.id}`,
            image: null as string | null,
            title: lang === 'ar' ? pkg.name_ar : pkg.name,
            subtitle: lang === 'ar' ? pkg.name : pkg.name_ar,
            description: pkg.description,
            price: pkg.price,
            tag: t('doctorProfile.package'),
        })),
    ];

    const whatsappHref = (offerTitle: string) =>
        `${WHATSAPP_LINK}?text=${encodeURIComponent(
            lang === 'ar'
                ? `مرحباً، أرغب بالحجز مع ${doctorName} - ${offerTitle}`
                : `Hi, I'd like to book with ${doctorName} - ${offerTitle}`,
        )}`;

    return (
        <>
            <Head title={lang === 'ar' ? doctor.name_ar : doctor.name} />

            <section className="doctor-profile">
                <div className="container">
                    <div className="doctor-profile__crumbs">
                        <span>
                            {lang === 'ar'
                                ? doctor.department.name_ar
                                : doctor.department.name}
                            {' / '}
                            {lang === 'ar' ? doctor.name_ar : doctor.name}
                        </span>
                        <Link
                            href={doctorsIndex()}
                            className="doctor-profile__back"
                        >
                            <BackArrow size={15} />
                            {t('doctors.tabDoctors')}
                        </Link>
                    </div>

                    <div className="doctor-profile__card">
                        <div className="doctor-profile__header">
                            <h2>{HOSPITAL_NAME_AR}</h2>
                            <p>{HOSPITAL_NAME_EN}</p>
                            <i />
                        </div>

                        {doctor.image && (
                            <button
                                type="button"
                                className="doctor-profile__enlarge"
                                onClick={() => setPhotoOpen(true)}
                            >
                                <Maximize2 size={13} />
                                {t('doctorProfile.enlargePhoto')}
                            </button>
                        )}

                        <div className="doctor-profile__body">
                            <div className="doctor-profile__photo">
                                {doctor.image ? (
                                    <img
                                        src={`/storage/${doctor.image}`}
                                        alt={doctorName}
                                    />
                                ) : (
                                    <div className="doctor-profile__photo-fallback">
                                        {doctorName.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="doctor-profile__info">
                                {doctor.nationality && (
                                    <div className="doctor-profile__flag">
                                        {doctor.nationality.flag && (
                                            <span>
                                                {doctor.nationality.flag}
                                            </span>
                                        )}
                                        {lang === 'ar'
                                            ? doctor.nationality.name_ar
                                            : doctor.nationality.name}
                                    </div>
                                )}

                                <h1 className="doctor-profile__name">
                                    {lang === 'ar'
                                        ? doctor.name_ar
                                        : doctor.name}
                                </h1>
                                <p className="doctor-profile__name-alt">
                                    {lang === 'ar'
                                        ? doctor.name
                                        : doctor.name_ar}
                                </p>

                                <p className="doctor-profile__job">
                                    {lang === 'ar' ? doctor.job_ar : doctor.job}
                                </p>
                                <p className="doctor-profile__job-alt">
                                    {lang === 'ar' ? doctor.job : doctor.job_ar}
                                </p>

                                <span className="doctor-profile__badge">
                                    {lang === 'ar'
                                        ? doctor.department.name_ar
                                        : doctor.department.name}
                                    <i />
                                    {lang === 'ar'
                                        ? doctor.department.name
                                        : doctor.department.name_ar}
                                </span>

                                {doctor.qualifications.length > 0 && (
                                    <div className="doctor-profile__section">
                                        <p className="doctor-profile__section-head">
                                            {t('doctorProfile.qualifications')}
                                        </p>
                                        <ul className="doctor-profile__quals">
                                            {doctor.qualifications.map(
                                                (item, index) => (
                                                    <li key={index}>
                                                        <span className="doctor-profile__check">
                                                            <Check size={12} />
                                                        </span>
                                                        <span>
                                                            <strong>
                                                                {lang === 'ar'
                                                                    ? item.name_ar
                                                                    : item.name}
                                                            </strong>
                                                            <em>
                                                                {lang === 'ar'
                                                                    ? item.name
                                                                    : item.name_ar}
                                                            </em>
                                                        </span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}

                                {doctor.services.length > 0 && (
                                    <div className="doctor-profile__section">
                                        <p className="doctor-profile__section-head">
                                            {t('doctorProfile.services')}
                                        </p>
                                        <div className="doctor-profile__services-grid">
                                            {doctor.services.map(
                                                (item, index) => (
                                                    <div
                                                        className="doctor-profile__service-card"
                                                        key={index}
                                                    >
                                                        <strong>
                                                            {lang === 'ar'
                                                                ? item.name_ar
                                                                : item.name}
                                                        </strong>
                                                        <span>
                                                            {lang === 'ar'
                                                                ? item.name
                                                                : item.name_ar}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="doctor-profile__contact-row">
                            <a
                                href="https://www.dasmh.sa"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Globe size={15} />
                                www.dasmh.sa
                            </a>
                            <a
                                href={EMERGENCY_TEL}
                                className="doctor-profile__phone"
                            >
                                <span>
                                    <small>
                                        {t('doctorProfile.forInquiries')}
                                    </small>
                                    <bdi dir="ltr">{EMERGENCY_PHONE}</bdi>
                                </span>
                                <i>
                                    <Phone size={16} />
                                </i>
                            </a>
                        </div>

                        <div className="doctor-profile__section">
                            <p className="doctor-profile__section-head">
                                {t('doctorProfile.workingHours')}
                            </p>
                            <div className="doctor-profile__hours">
                                <span className="tag">
                                    {days ?? t('doctorProfile.hoursVary')}
                                </span>
                                <span className="doctor-profile__hours-days">
                                    {days ?? t('doctorProfile.checkBooking')}
                                </span>
                                <i>
                                    <Clock size={16} />
                                </i>
                            </div>
                        </div>

                        <div className="doctor-profile__cta-row doctor-profile__cta-row--stacked">
                            <button
                                type="button"
                                className="btn btn--ink"
                                onClick={() => setBookingOpen(true)}
                            >
                                <CalendarPlus size={16} />
                                {t('doctors.bookNow')}
                            </button>
                            <button
                                type="button"
                                className="btn btn--maroon"
                                onClick={() => setCallbackOpen(true)}
                            >
                                <PhoneCall size={16} />
                                {t('doctorProfile.requestCallback')}
                            </button>
                        </div>

                        {offerCards.length > 0 && (
                            <div className="doctor-profile__section">
                                <p className="doctor-profile__section-head">
                                    {t('doctors.offers')}
                                </p>
                                <div className="doctor-profile__offers-grid">
                                    {offerCards.map((offer) => (
                                        <div
                                            className="doctor-profile__offer-card"
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
                                            {offer.image && (
                                                <img
                                                    src={`/storage/${offer.image}`}
                                                    alt={offer.title}
                                                />
                                            )}
                                            <div>
                                                <span className="doctor-profile__offer-tag">
                                                    {offer.tag}
                                                </span>
                                                <strong>{offer.title}</strong>
                                                {offer.subtitle && (
                                                    <span className="doctor-profile__offer-subtitle">
                                                        {offer.subtitle}
                                                    </span>
                                                )}
                                                <p className="doctor-profile__offer-excerpt">
                                                    {offer.description}
                                                </p>
                                                {offer.price && (
                                                    <span className="doctor-profile__offer-price">
                                                        {offer.price}{' '}
                                                        {t('doctorProfile.sar')}
                                                    </span>
                                                )}
                                                <a
                                                    href={whatsappHref(
                                                        offer.title,
                                                    )}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                    className="btn btn--whatsapp btn--sm doctor-profile__offer-whatsapp"
                                                >
                                                    <WhatsAppIcon size={14} />
                                                    {t(
                                                        'doctorProfile.bookViaWhatsapp',
                                                    )}
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
                <DialogContent className="max-h-[90vh] overflow-hidden border-none bg-transparent p-0 shadow-none sm:max-w-2xl [&>button]:text-white">
                    {doctor.image && (
                        <img
                            src={`/storage/${doctor.image}`}
                            alt={lang === 'ar' ? doctor.name_ar : doctor.name}
                            className="max-h-[90vh] w-full rounded-lg object-contain"
                        />
                    )}
                </DialogContent>
            </Dialog>

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
                offers={offerCards}
                open={offersOpen}
                onOpenChange={setOffersOpen}
            />
        </>
    );
}
