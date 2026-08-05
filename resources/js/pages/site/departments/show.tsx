import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarCheck, Construction, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import BookingModal from '@/site/components/BookingModal';
import { WHATSAPP_LINK } from '@/site/i18n/constants';
import { useLanguage } from '@/site/i18n/LanguageContext';
import '@/site/department.css';

type Language = 'en' | 'ar' | 'ur' | 'tl';
type Localized = Record<Language, string>;
type NamePair = { name: string; name_ar: string };

type Doctor = {
    id: number;
    name: string;
    name_ar: string;
    job: string | null;
    job_ar: string | null;
    image: string | null;
    has_online_booking: boolean;
    department: NamePair;
    nationality: { name: string; name_ar: string; flag: string | null } | null;
    qualifications: NamePair[];
    services: NamePair[];
};

type Department = {
    id: number;
    slug: string;
    name: string;
    name_ar: string;
    doctors: Doctor[];
};

const copy = {
    eyebrow: {
        en: 'Services · Department',
        ar: 'الخدمات · القسم',
        ur: 'خدمات · شعبہ',
        tl: 'Serbisyo · Departamento',
    },
    back: {
        en: 'Services',
        ar: 'الخدمات',
        ur: 'خدمات',
        tl: 'Serbisyo',
    },
    teamTitle: {
        en: 'Meet the doctors',
        ar: 'تعرّف على أطبائنا',
        ur: 'ہمارے ڈاکٹرز سے ملیں',
        tl: 'Makilala ang mga doktor',
    },
    credentials: {
        en: 'Credentials',
        ar: 'المؤهلات',
        ur: 'اسناد',
        tl: 'Kwalipikasyon',
    },
    services: {
        en: 'Services',
        ar: 'الخدمات',
        ur: 'خدمات',
        tl: 'Mga serbisyo',
    },
    book: {
        en: 'Book Appointment',
        ar: 'احجز موعداً',
        ur: 'اپائنٹمنٹ بک کریں',
        tl: 'Mag-book',
    },
    whatsapp: {
        en: 'WhatsApp',
        ar: 'واتساب',
        ur: 'واٹس ایپ',
        tl: 'WhatsApp',
    },
    bookingOpen: {
        en: 'Online booking open',
        ar: 'الحجز الإلكتروني متاح',
        ur: 'آن لائن بکنگ دستیاب',
        tl: 'Bukas ang online booking',
    },
    bookingByRequest: {
        en: 'Booking by callback request',
        ar: 'الحجز عبر طلب اتصال',
        ur: 'کال بیک کے ذریعے بکنگ',
        tl: 'Booking sa pamamagitan ng callback',
    },
    empty: {
        en: 'This department’s roster is being updated. Please call us and we will point you to the right consultant.',
        ar: 'يجري تحديث قائمة أطباء هذا القسم. يسعدنا مساعدتك هاتفياً لاختيار الاستشاري المناسب.',
        ur: 'اس شعبے کے ڈاکٹروں کی فہرست اپ ڈیٹ ہو رہی ہے۔ براہِ کرم ہمیں کال کریں۔',
        tl: 'Ina-update ang listahan ng mga doktor. Tawagan kami at tutulungan ka namin.',
    },
} satisfies Record<string, Localized>;

/** Doctor counts read better as prose than as a bare number. */
function teamLead(count: number, language: Language): string {
    const lead: Localized = {
        en: `${count} ${count === 1 ? 'doctor' : 'doctors'} in this department. Availability comes straight from the clinic schedule.`,
        ar: `${count} من الأطباء في هذا القسم، والمواعيد مأخوذة مباشرة من جدول العيادة.`,
        ur: `اس شعبے میں ${count} ڈاکٹرز۔ اوقات کلینک کے شیڈول سے لیے گئے ہیں۔`,
        tl: `${count} na doktor sa departamentong ito. Ang availability ay mula mismo sa iskedyul ng klinika.`,
    };

    return lead[language];
}

export default function DepartmentShow({
    department,
}: {
    department: Department;
}) {
    const { lang, dir } = useLanguage();
    const language = lang as Language;
    const { url } = usePage();
    const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

    // The services tour frames this page, so drop the duplicate site chrome there.
    const embedded = url.includes('embed=1');

    const localName = language === 'ar' ? department.name_ar : department.name;

    const leaveTour = () => window.parent?.postMessage('tour:back', '*');

    return (
        <>
            <Head title={department.name} />

            <main
                className={`department-page department-page--${department.slug}`}
                dir={dir}
            >
                <section className="department-hero">
                    <div className="department-hero__inner">
                        {embedded ? (
                            <button
                                type="button"
                                className="department-hero__back"
                                onClick={leaveTour}
                            >
                                <ArrowLeft aria-hidden="true" />
                                {copy.back[language]}
                            </button>
                        ) : (
                            <a className="department-hero__back" href="/services">
                                <ArrowLeft aria-hidden="true" />
                                {copy.back[language]}
                            </a>
                        )}

                        <div className="department-hero__eyebrow">
                            <span className="pip" />
                            {copy.eyebrow[language]}
                        </div>

                        <h1>
                            {localName}
                            {language !== 'ar' && (
                                <small>{department.name_ar}</small>
                            )}
                        </h1>

                        {department.doctors.length > 0 && (
                            <p>
                                {teamLead(department.doctors.length, language)}
                            </p>
                        )}
                    </div>
                </section>

                <section className="department-roster">
                    {department.doctors.length === 0 ? (
                        <div className="department-empty">
                            <Construction aria-hidden="true" />
                            <p>{copy.empty[language]}</p>
                        </div>
                    ) : (
                        <>
                            <div className="department-roster__head">
                                <h2>{copy.teamTitle[language]}</h2>
                            </div>

                            <div className="department-roster__grid">
                                {department.doctors.map((doctor) => (
                                    <article
                                        className="doctor-card"
                                        key={doctor.id}
                                    >
                                        <div className="doctor-card__portrait">
                                            {doctor.image ? (
                                                <img
                                                    src={`/storage/${doctor.image}`}
                                                    alt={doctor.name}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <span className="placeholder">
                                                    <Stethoscope aria-hidden="true" />
                                                </span>
                                            )}

                                            {doctor.nationality?.flag && (
                                                <span className="doctor-card__flag">
                                                    <img
                                                        src={
                                                            doctor.nationality
                                                                .flag
                                                        }
                                                        alt={
                                                            doctor.nationality
                                                                .name
                                                        }
                                                        loading="lazy"
                                                    />
                                                </span>
                                            )}
                                        </div>

                                        <div className="doctor-card__plate">
                                            <div className="ar-name">
                                                {doctor.name_ar}
                                            </div>
                                            <div className="en-name">
                                                {doctor.name}
                                            </div>
                                            {doctor.job && (
                                                <div className="role">
                                                    {doctor.job_ar}
                                                    <span>{doctor.job}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="doctor-card__body">
                                            {doctor.qualifications.length >
                                                0 && (
                                                <>
                                                    <h4>
                                                        {
                                                            copy.credentials[
                                                                language
                                                            ]
                                                        }
                                                    </h4>
                                                    <ul className="doctor-card__list">
                                                        {doctor.qualifications.map(
                                                            (
                                                                qualification,
                                                                index,
                                                            ) => (
                                                                <li key={index}>
                                                                    {dir ===
                                                                        'rtl' &&
                                                                    qualification.name_ar
                                                                        ? qualification.name_ar
                                                                        : qualification.name}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </>
                                            )}

                                            {doctor.services.length > 0 && (
                                                <>
                                                    <h4>
                                                        {copy.services[language]}
                                                    </h4>
                                                    <div className="doctor-card__chips">
                                                        {doctor.services.map(
                                                            (service, index) => (
                                                                <span
                                                                    key={index}
                                                                >
                                                                    {dir ===
                                                                        'rtl' &&
                                                                    service.name_ar
                                                                        ? service.name_ar
                                                                        : service.name}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            <div className="doctor-card__cta">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setBookingDoctor(doctor)
                                                    }
                                                >
                                                    <CalendarCheck aria-hidden="true" />
                                                    {copy.book[language]}
                                                </button>
                                                <a
                                                    href={WHATSAPP_LINK}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {copy.whatsapp[language]}
                                                </a>
                                            </div>

                                            <span
                                                className={[
                                                    'doctor-card__availability',
                                                    doctor.has_online_booking &&
                                                        'is-live',
                                                ]
                                                    .filter(Boolean)
                                                    .join(' ')}
                                            >
                                                <span className="pip" />
                                                {doctor.has_online_booking
                                                    ? copy.bookingOpen[language]
                                                    : copy.bookingByRequest[
                                                          language
                                                      ]}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </main>

            <BookingModal
                doctor={bookingDoctor}
                open={bookingDoctor !== null}
                onOpenChange={(open) => !open && setBookingDoctor(null)}
            />
        </>
    );
}
