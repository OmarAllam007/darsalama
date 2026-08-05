import { Head } from '@inertiajs/react';
import {
    Activity,
    Apple,
    ArrowLeft,
    Baby,
    BedDouble,
    Brain,
    CalendarHeart,
    ChevronsDown,
    CloudRain,
    Construction,
    Crown,
    Droplet,
    Heart,
    HeartPulse,
    Link as LinkIcon,
    Lock,
    Moon,
    Repeat2,
    Ruler,
    Scale,
    Smile,
    Sparkles,
    Stethoscope,
    Syringe,
    Thermometer,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import dentalEnglish from '@/site/assets/images/services/sv-dental-en.jpg';
import dentalArabic from '@/site/assets/images/services/sv-dental.jpg';
import dietaryPhoto from '@/site/assets/images/services/sv-diet.jpg';
import obgynPhoto from '@/site/assets/images/services/sv-obgyn.jpg';
import pediatricsPhoto from '@/site/assets/images/services/sv-pedia.jpg';
import psychiatryEnglish from '@/site/assets/images/services/sv-psych-en.jpg';
import psychiatryArabic from '@/site/assets/images/services/sv-psych.jpg';
import { tour as departmentTourRoute } from '@/routes/departments';
import BookingModal from '@/site/components/BookingModal';
import { useLanguage } from '@/site/i18n/LanguageContext';
import '@/site/services.css';

type Language = 'en' | 'ar' | 'ur' | 'tl';
type DepartmentId = 'obgyn' | 'pedia' | 'dental' | 'psych' | 'diet';
type Localized = Record<Language, string>;

type Department = {
    id: DepartmentId;
    tab: Localized;
    alternate: Localized;
    kick: Localized;
    title: Localized;
    tagline: Localized;
    lead: Localized;
    body: Localized;
    features: Array<{ icon: LucideIcon; label: Localized }>;
    icon: LucideIcon;
    image: string | Partial<Record<Language, string>>;
    /** Page the tour frame loads; omitted while a department tour does not exist yet. */
    tourUrl?: string;
    tourTitle?: string;
    underConstruction?: boolean;
};

type TourBookingDoctor = {
    id: number;
    name: string;
    name_ar: string;
    has_online_booking: boolean;
    department: {
        name: string;
        name_ar: string;
    };
};

const copy = {
    eyebrow: {
        en: 'Services · Department Tours',
        ar: 'الخدمات · جولات الأقسام',
        ur: 'خدمات · شعبہ جات کے دورے',
        tl: 'Serbisyo · Mga Tour',
    },
    titleLead: {
        en: 'Take the tour.',
        ar: 'خُذ جولة،',
        ur: 'دورہ کیجیے،',
        tl: 'Mag-tour ka.',
    },
    titleEmphasis: {
        en: 'Find your care.',
        ar: 'واختر رعايتك.',
        ur: 'اپنا علاج پائیے.',
        tl: 'Hanapin ang tamang alaga.',
    },
    intro: {
        en: 'Open any department below and start the tour.',
        ar: 'افتح باب أي قسم بالأسفل، وابدأ الجولة.',
        ur: 'نیچے کسی بھی شعبے کا دروازہ کھولیں اور دورہ شروع کریں۔',
        tl: 'Buksan ang alinmang departamento sa ibaba at simulan ang tour.',
    },
    takeTour: {
        en: 'Take the Tour',
        ar: 'تجوّل في القسم',
        ur: 'دورہ کریں',
        tl: 'Mag-tour',
    },
    preparing: {
        en: 'Department page in preparation',
        ar: 'صفحة القسم قيد التجهيز',
        ur: 'شعبے کا صفحہ تیاری میں',
        tl: 'Inihahanda pa',
    },
    construction: {
        en: 'Under construction',
        ar: 'قيد الإنشاء',
        ur: 'زیرِ تعمیر',
        tl: 'Ginagawa pa',
    },
    keepScrolling: {
        en: 'Keep scrolling to walk through this department',
        ar: 'واصل التمرير للتجوّل داخل القسم',
        ur: 'شعبے میں داخل ہونے کے لیے اسکرول جاری رکھیں',
        tl: 'Mag-scroll pa para pumasok sa departamento',
    },
    back: {
        en: 'Services',
        ar: 'الخدمات',
        ur: 'خدمات',
        tl: 'Serbisyo',
    },
    closeTour: {
        en: 'Close the tour',
        ar: 'إغلاق الجولة',
        ur: 'دورہ بند کریں',
        tl: 'Isara ang tour',
    },
} satisfies Record<string, Localized>;

/** Wheel/touch distance that has to pile up at the hang point before the tour opens. */
const PUSH_NEEDED = 260;
/** …and the distance that has to pile up scrolling back up before it closes again. */
const EXIT_NEEDED = 520;
const PUSH_IDLE = 600;

/** Scroll Y where `.services-tour` sits flush with the viewport — footer stays out of reach. */
function servicesEndY(root: HTMLElement): number {
    const bottom = window.scrollY + root.getBoundingClientRect().bottom;

    return Math.max(0, bottom - window.innerHeight);
}

function isAtServicesEnd(root: HTMLElement): boolean {
    return window.scrollY >= servicesEndY(root) - 4;
}

function onPhone(): boolean {
    return window.matchMedia('(max-width: 980px)').matches;
}

const departments: Department[] = [
    {
        id: 'obgyn',
        icon: HeartPulse,
        image: obgynPhoto,
        tourUrl: departmentTourRoute.url('obgyn'),
        tourTitle: 'OB/GYN Department — Dar As Salama',
        tab: {
            en: 'OB / GYN',
            ar: 'النساء والولادة',
            ur: 'زچگی',
            tl: 'OB / GYN',
        },
        alternate: {
            en: 'النساء والولادة',
            ar: 'OB / GYN',
            ur: 'OB / GYN',
            tl: 'النساء والولادة',
        },
        kick: {
            en: 'Safe Motherhood',
            ar: 'أمومة آمنة',
            ur: 'محفوظ زچگی',
            tl: 'Safe Motherhood',
        },
        title: {
            en: 'Obstetrics & Gynecology',
            ar: 'النساء والولادة',
            ur: 'زچہ و بچہ',
            tl: 'OB / GYN',
        },
        tagline: {
            en: 'Where the story begins',
            ar: 'حيث تبدأ الحكاية',
            ur: 'جہاں کہانی شروع ہوتی ہے',
            tl: 'Kung saan nagsisimula ang kuwento',
        },
        lead: {
            en: 'Where the story begins.',
            ar: 'حيث تبدأ الحكاية.',
            ur: 'جہاں کہانی شروع ہوتی ہے۔',
            tl: 'Dito nagsisimula ang kwento.',
        },
        body: {
            en: 'Delivery packages, prenatal care and lady consultants — everything for a safe, gentle motherhood.',
            ar: 'باقات الولادة ومتابعة الحمل واستشاريات نساء، وكل ما تحتاجينه لأمومة آمنة ومطمئنة.',
            ur: 'ڈیلیوری پیکجز، دورانِ حمل نگہداشت اور لیڈی کنسلٹنٹس۔',
            tl: 'Delivery packages, prenatal care at lady consultants.',
        },
        features: [
            {
                icon: Baby,
                label: {
                    en: 'Delivery packages',
                    ar: 'باقات الولادة',
                    ur: 'ڈیلیوری پیکجز',
                    tl: 'Delivery packages',
                },
            },
            {
                icon: Stethoscope,
                label: {
                    en: 'Lady consultants',
                    ar: 'استشاريات نساء',
                    ur: 'لیڈی کنسلٹنٹس',
                    tl: 'Lady consultants',
                },
            },
            {
                icon: CalendarHeart,
                label: {
                    en: 'Prenatal follow-up',
                    ar: 'متابعة الحمل',
                    ur: 'حمل کی نگرانی',
                    tl: 'Prenatal follow-up',
                },
            },
            {
                icon: BedDouble,
                label: {
                    en: 'Private suites',
                    ar: 'أجنحة خاصة',
                    ur: 'پرائیویٹ کمرے',
                    tl: 'Private suites',
                },
            },
        ],
    },
    {
        id: 'pedia',
        icon: Baby,
        image: pediatricsPhoto,
        tourUrl: departmentTourRoute.url('pediatrics'),
        tourTitle: 'Pediatrics — Dar As Salama',
        tab: { en: 'Pediatrics', ar: 'الأطفال', ur: 'اطفال', tl: 'Pedia' },
        alternate: {
            en: 'الأطفال',
            ar: 'Pediatrics',
            ur: 'Pediatrics',
            tl: 'الأطفال',
        },
        kick: {
            en: 'Little Heroes',
            ar: 'أبطال صغار',
            ur: 'ننھے ہیرو',
            tl: 'Little Heroes',
        },
        title: {
            en: 'Pediatrics',
            ar: 'طب الأطفال',
            ur: 'اطفال',
            tl: 'Pediatrics',
        },
        tagline: {
            en: 'For our little heroes',
            ar: 'لأبطالنا الصغار',
            ur: 'ہمارے ننھے ہیروز کے لیے',
            tl: 'Para sa maliliit na bayani',
        },
        lead: {
            en: 'For our little heroes.',
            ar: 'لأبطالنا الصغار.',
            ur: 'ہمارے ننھے ہیروز کے لیے۔',
            tl: 'Para sa maliliit na bayani.',
        },
        body: {
            en: 'Checkups, vaccinations and growth follow-up in a place children actually like to visit.',
            ar: 'فحوصات وتطعيمات ومتابعة نمو في مكان يحبّ الأطفال زيارته.',
            ur: 'چیک اپ، ویکسینیشن اور نشوونما کی نگرانی۔',
            tl: 'Checkups, bakuna at growth follow-up.',
        },
        features: [
            {
                icon: Syringe,
                label: {
                    en: 'Vaccinations',
                    ar: 'التطعيمات',
                    ur: 'ویکسینیشن',
                    tl: 'Bakuna',
                },
            },
            {
                icon: Ruler,
                label: {
                    en: 'Growth follow-up',
                    ar: 'متابعة النمو',
                    ur: 'نشوونما',
                    tl: 'Growth follow-up',
                },
            },
            {
                icon: Thermometer,
                label: {
                    en: 'Same-day visits',
                    ar: 'مواعيد فورية',
                    ur: 'فوری وزٹ',
                    tl: 'Same-day visits',
                },
            },
        ],
    },
    {
        id: 'dental',
        icon: Smile,
        image: {
            en: dentalEnglish,
            tl: dentalEnglish,
            ar: dentalArabic,
            ur: dentalArabic,
        },
        tourUrl: departmentTourRoute.url('dental'),
        tourTitle: 'Dental Center — Dar As Salama',
        tab: { en: 'Dental', ar: 'الأسنان', ur: 'دانت', tl: 'Ngipin' },
        alternate: { en: 'الأسنان', ar: 'Dental', ur: 'Dental', tl: 'الأسنان' },
        kick: {
            en: 'Restorative Dentistry',
            ar: 'طب أسنان ترميمي',
            ur: 'بحالی دندان سازی',
            tl: 'Restorative Dentistry',
        },
        title: {
            en: 'Dental Center',
            ar: 'مركز الأسنان',
            ur: 'ڈینٹل سینٹر',
            tl: 'Dental Center',
        },
        tagline: {
            en: 'A smile worth showing',
            ar: 'ابتسامة تستحقّ أن تُرى',
            ur: 'قابلِ فخر مسکراہٹ',
            tl: 'Ngiting ipagmamalaki',
        },
        lead: {
            en: 'Thoughtful care, modern techniques, and personalized treatment plans',
            ar: 'رعاية مدروسة، وتقنيات حديثة، وخطط علاج مخصّصة.',
            ur: 'سوچی سمجھی نگہداشت، جدید تکنیک، اور ذاتی نوعیت کے علاج کے منصوبے۔',
            tl: 'Maingat na pangangalaga, makabagong pamamaraan, at personalisadong plano ng paggamot',
        },
        body: {
            en: '— with the best tools on the market — designed to protect your smile and your dental health for years to come.',
            ar: 'بأفضل الأجهزة المتوفرة، لحماية ابتسامتك وصحة أسنانك لسنوات قادمة.',
            ur: 'مارکیٹ کے بہترین آلات کے ساتھ، تاکہ آپ کی مسکراہٹ اور دانتوں کی صحت برسوں محفوظ رہے۔',
            tl: '— gamit ang pinakamahusay na kagamitan sa merkado — upang maprotektahan ang iyong ngiti at kalusugan ng ngipin sa mga darating na taon.',
        },
        features: [
            {
                icon: Activity,
                label: {
                    en: 'Root canal',
                    ar: 'علاج الجذور',
                    ur: 'روٹ کینال',
                    tl: 'Root canal',
                },
            },
            {
                icon: Crown,
                label: {
                    en: 'Zirconia & E-max crowns',
                    ar: 'تلبيسات الزيركون والإيماكس',
                    ur: 'زرکونیا کراؤن',
                    tl: 'Zirconia & E-max crowns',
                },
            },
            {
                icon: LinkIcon,
                label: {
                    en: 'Dental bridges',
                    ar: 'جسور الأسنان',
                    ur: 'ڈینٹل برجز',
                    tl: 'Dental bridges',
                },
            },
            {
                icon: Sparkles,
                label: {
                    en: 'Cosmetic fillings',
                    ar: 'الحشو التجميلي',
                    ur: 'کاسمیٹک فلنگ',
                    tl: 'Cosmetic fillings',
                },
            },
        ],
    },
    {
        id: 'psych',
        icon: Brain,
        image: {
            en: psychiatryEnglish,
            tl: psychiatryEnglish,
            ar: psychiatryArabic,
            ur: psychiatryArabic,
        },
        tourUrl: departmentTourRoute.url('psych'),
        tourTitle: 'Psychiatry — Dar As Salama',
        tab: {
            en: 'Psychiatry',
            ar: 'الطب النفسي',
            ur: 'نفسیات',
            tl: 'Psychiatry',
        },
        alternate: {
            en: 'الطب النفسي',
            ar: 'Psychiatry',
            ur: 'Psychiatry',
            tl: 'الطب النفسي',
        },
        kick: {
            en: 'A Quiet Start',
            ar: 'بداية هادئة',
            ur: 'پُرسکون آغاز',
            tl: 'A Quiet Start',
        },
        title: {
            en: 'Psychiatry',
            ar: 'الطب النفسي',
            ur: 'نفسیات',
            tl: 'Psychiatry',
        },
        tagline: {
            en: 'Your first step toward ease',
            ar: 'خطوتك الأولى نحو الراحة',
            ur: 'سکون کی طرف پہلا قدم',
            tl: 'Unang hakbang tungo sa ginhawa',
        },
        lead: {
            en: 'A quiet place to start.',
            ar: 'مكان هادئ للبداية.',
            ur: 'آغاز کے لیے ایک پُرسکون جگہ۔',
            tl: 'Isang tahimik na simula.',
        },
        body: {
            en: 'Confidential consultations for depression, anxiety, sleep and OCD — with a specialist, at your own pace.',
            ar: 'استشارات سرية للاكتئاب والقلق واضطرابات النوم والوسواس القهري، مع أخصائي وبالوتيرة التي تناسبك.',
            ur: 'ڈپریشن، بے چینی، نیند اور او سی ڈی کے لیے خفیہ مشاورت۔',
            tl: 'Kompidensyal na konsultasyon para sa depresyon, pagkabalisa, tulog at OCD.',
        },
        features: [
            {
                icon: CloudRain,
                label: {
                    en: 'Depression & anxiety',
                    ar: 'الاكتئاب والقلق',
                    ur: 'ڈپریشن اور بے چینی',
                    tl: 'Depresyon at pagkabalisa',
                },
            },
            {
                icon: Moon,
                label: {
                    en: 'Sleep disorders',
                    ar: 'اضطرابات النوم',
                    ur: 'نیند کے مسائل',
                    tl: 'Sleep disorders',
                },
            },
            {
                icon: Repeat2,
                label: {
                    en: 'OCD & phobias',
                    ar: 'الوسواس القهري والرهاب',
                    ur: 'او سی ڈی اور فوبیا',
                    tl: 'OCD at phobias',
                },
            },
            {
                icon: Lock,
                label: {
                    en: 'Fully confidential',
                    ar: 'سرية تامة',
                    ur: 'مکمل رازداری',
                    tl: 'Ganap na kompidensyal',
                },
            },
        ],
    },
    {
        id: 'diet',
        icon: Apple,
        image: dietaryPhoto,
        underConstruction: true,
        tab: { en: 'Dietary', ar: 'التغذية', ur: 'غذائیت', tl: 'Nutrisyon' },
        alternate: {
            en: 'التغذية',
            ar: 'Dietary',
            ur: 'Dietary',
            tl: 'التغذية',
        },
        kick: {
            en: 'Clinical Nutrition',
            ar: 'تغذية علاجية',
            ur: 'طبی غذائیت',
            tl: 'Clinical Nutrition',
        },
        title: {
            en: 'Dietary & Nutrition',
            ar: 'التغذية العلاجية',
            ur: 'غذائیت',
            tl: 'Nutrisyon',
        },
        tagline: {
            en: 'Food is part of the treatment',
            ar: 'الغذاء جزء من العلاج',
            ur: 'غذا علاج کا حصہ ہے',
            tl: 'Bahagi ng lunas ang pagkain',
        },
        lead: {
            en: 'Nutrition care, planned around you.',
            ar: 'رعاية غذائية مصمّمة لك.',
            ur: 'آپ کے مطابق غذائی منصوبہ۔',
            tl: 'Planong nutrisyon na akma sa iyo.',
        },
        body: {
            en: 'A dietitian looks at your health, your habits and what you are aiming for, then writes a plan you can actually keep to.',
            ar: 'يطّلع أخصائي التغذية على حالتك وعاداتك وما تسعى إليه، ثم يضع خطة يمكنك الالتزام بها فعلاً.',
            ur: 'ماہرِ غذائیت آپ کی صحت، عادات اور اہداف دیکھ کر ایسا پلان بناتا ہے جس پر آپ واقعی عمل کر سکیں۔',
            tl: 'Titingnan ng dietitian ang iyong kalusugan, gawi at layunin, tapos gagawa ng planong kaya mong sundin.',
        },
        features: [
            {
                icon: Scale,
                label: {
                    en: 'Weight management',
                    ar: 'إدارة الوزن',
                    ur: 'وزن کا انتظام',
                    tl: 'Pamamahala ng timbang',
                },
            },
            {
                icon: Droplet,
                label: {
                    en: 'Diabetes nutrition',
                    ar: 'تغذية مرضى السكري',
                    ur: 'ذیابیطس کی غذائیت',
                    tl: 'Nutrisyon sa diabetes',
                },
            },
            {
                icon: Heart,
                label: {
                    en: 'Pregnancy nutrition',
                    ar: 'تغذية الحوامل',
                    ur: 'حمل کی غذائیت',
                    tl: 'Nutrisyon sa pagbubuntis',
                },
            },
            {
                icon: Baby,
                label: {
                    en: 'Child nutrition',
                    ar: 'تغذية الأطفال',
                    ur: 'بچوں کی غذائیت',
                    tl: 'Nutrisyon ng bata',
                },
            },
        ],
    },
];

function imageFor(department: Department, language: Language): string {
    if (typeof department.image === 'string') {
        return department.image;
    }

    return department.image[language] ?? department.image.en ?? '';
}

export default function Services() {
    const { lang, isRtl } = useLanguage();
    const language = lang as Language;
    const [activeDepartment, setActiveDepartment] =
        useState<DepartmentId | null>('obgyn');
    const [notice, setNotice] = useState<string | null>(null);
    const [tour, setTour] = useState<DepartmentId | null>(null);
    /** Frames stay mounted once opened, so switching tabs never reloads a tour. */
    const [loadedTours, setLoadedTours] = useState<DepartmentId[]>([]);
    const [progress, setProgress] = useState(0);
    const [atBottom, setAtBottom] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [bookingDoctor, setBookingDoctor] = useState<TourBookingDoctor | null>(
        null,
    );
    const rootRef = useRef<HTMLElement>(null);
    const introRef = useRef<HTMLElement>(null);
    const panelsRef = useRef<HTMLDivElement>(null);
    const tourTabsRef = useRef<HTMLDivElement>(null);
    const push = useRef(0);
    const pushAt = useRef(0);
    const armed = useRef(true);

    const tourUrl = departments.find(
        (department) => department.id === activeDepartment,
    )?.tourUrl;

    const openTour = (id: DepartmentId) => {
        setActiveDepartment(id);
        setTour(id);
        setLoadedTours((loaded) =>
            loaded.includes(id) ? loaded : [...loaded, id],
        );
        window.scrollTo(0, 0);
    };

    const closeTour = () => setTour(null);

    useEffect(() => {
        if (!notice) {
            return;
        }

        const timeout = window.setTimeout(() => setNotice(null), 2400);

        return () => window.clearTimeout(timeout);
    }, [notice]);

    useEffect(() => {
        const resetPush = () => {
            push.current = 0;
            setProgress(0);
        };

        const clampToServicesEnd = () => {
            const root = rootRef.current;

            if (!root || !tourUrl || tour) {
                return;
            }

            const endY = servicesEndY(root);

            if (window.scrollY > endY + 1) {
                window.scrollTo(0, endY);
            }
        };

        /** Feeds scroll distance into the gauge that walks into — or back out of — a tour. */
        const feed = (delta: number) => {
            if (!armed.current) {
                return false;
            }

            const now = Date.now();
            const root = rootRef.current;

            if (tour) {
                if (delta >= 0 || window.scrollY > 2) {
                    push.current = 0;

                    return false;
                }

                if (now - pushAt.current > PUSH_IDLE) {
                    push.current = 0;
                }

                pushAt.current = now;
                push.current -= delta;

                if (push.current >= EXIT_NEEDED) {
                    resetPush();
                    closeTour();
                }

                return false;
            }

            // Hang downward scroll at the end of the services block — progress, not footer.
            if (
                delta > 0 &&
                tourUrl &&
                root &&
                isAtServicesEnd(root)
            ) {
                if (now - pushAt.current > PUSH_IDLE) {
                    push.current = 0;
                }

                pushAt.current = now;
                push.current += delta;
                setProgress(Math.min(1, push.current / PUSH_NEEDED));

                if (push.current >= PUSH_NEEDED) {
                    resetPush();
                    armed.current = false;
                    openTour(activeDepartment as DepartmentId);
                    window.setTimeout(() => {
                        armed.current = true;
                    }, 1100);
                }

                return true;
            }

            resetPush();

            return false;
        };

        const onWheel = (event: WheelEvent) => {
            if (feed(event.deltaY)) {
                event.preventDefault();
                clampToServicesEnd();
            }
        };

        let touchY = 0;

        const onTouchStart = (event: TouchEvent) => {
            touchY = event.touches[0].clientY;
            pushAt.current = Date.now();
        };

        const onTouchMove = (event: TouchEvent) => {
            const y = event.touches[0].clientY;
            const delta = (touchY - y) * 2.4;
            touchY = y;

            if (feed(delta)) {
                event.preventDefault();
                clampToServicesEnd();
            }
        };

        const syncBottom = () => {
            clampToServicesEnd();

            const root = rootRef.current;

            setAtBottom(root ? isAtServicesEnd(root) : false);
        };

        /** Wheeling over a closed panel opens it instead of scrolling the page. */
        const onPanelWheel = (event: WheelEvent) => {
            const panel = (event.target as HTMLElement).closest<HTMLElement>(
                '.department-panel',
            );

            if (
                !armed.current ||
                !panel ||
                panel.classList.contains('is-active') ||
                Math.abs(event.deltaY) < 10
            ) {
                return;
            }

            event.preventDefault();
            armed.current = false;
            resetPush();
            setActiveDepartment(panel.dataset.dept as DepartmentId);
            window.setTimeout(() => {
                armed.current = true;
            }, 700);
        };

        const panels = panelsRef.current;

        panels?.addEventListener('wheel', onPanelWheel, { passive: false });
        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('scroll', syncBottom, { passive: true });
        window.addEventListener('resize', syncBottom);

        const idle = window.setInterval(() => {
            if (push.current && Date.now() - pushAt.current > PUSH_IDLE) {
                resetPush();
            }
        }, 300);

        syncBottom();

        return () => {
            panels?.removeEventListener('wheel', onPanelWheel);
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('scroll', syncBottom);
            window.removeEventListener('resize', syncBottom);
            window.clearInterval(idle);
        };
    }, [tourUrl, tour, activeDepartment]);

    // Escape leaves the tour, the way the close button does.
    useEffect(() => {
        if (!tour) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeTour();
            }
        };

        document.addEventListener('keydown', onKeyDown);

        return () => document.removeEventListener('keydown', onKeyDown);
    }, [tour]);

    // The overlay strip is narrower than its tabs on phones, so centre the live one.
    useEffect(() => {
        const strip = tourTabsRef.current;
        const active = strip?.querySelector<HTMLElement>('.tour-tab.is-active');

        if (!tour || !strip || !active) {
            return;
        }

        const stripBox = strip.getBoundingClientRect();
        const activeBox = active.getBoundingClientRect();

        strip.scrollBy({
            left:
                activeBox.left -
                stripBox.left -
                (stripBox.width - activeBox.width) / 2,
            behavior: 'smooth',
        });
    }, [tour, language]);

    // The framed tours run their own language switch, so keep them in step with ours,
    // and let their in-page back button close the frame.
    useEffect(() => {
        document
            .querySelectorAll<HTMLIFrameElement>('.services-tour__frame iframe')
            .forEach((frame) =>
                frame.contentWindow?.postMessage({ lang: language }, '*'),
            );

        const onMessage = (event: MessageEvent) => {
            if (event.data === 'tour:back') {
                closeTour();

                return;
            }

            if (event.data?.type === 'tour:book' && event.data.doctor) {
                const doctor = event.data.doctor as Partial<TourBookingDoctor>;
                const doctorId = Number(doctor.id);

                if (!doctorId) {
                    return;
                }

                setBookingDoctor({
                    id: doctorId,
                    name: String(doctor.name ?? ''),
                    name_ar: String(doctor.name_ar ?? doctor.name ?? ''),
                    has_online_booking: Boolean(doctor.has_online_booking),
                    department: {
                        name: String(doctor.department?.name ?? ''),
                        name_ar: String(
                            doctor.department?.name_ar ??
                                doctor.department?.name ??
                                '',
                        ),
                    },
                });
            }
        };

        window.addEventListener('message', onMessage);

        return () => window.removeEventListener('message', onMessage);
    }, [language, tour, loadedTours]);

    // While a tour is up the page behind it is frozen and the frame owns the viewport.
    useEffect(() => {
        document.body.classList.toggle('services-tour-open', tour !== null);

        const header = document.querySelector('.nav');
        const bar = document.querySelector<HTMLElement>('.services-tour__fs');

        document.documentElement.style.setProperty(
            '--tour-top',
            `${(header?.clientHeight ?? 78) + (bar?.offsetHeight ?? 58)}px`,
        );

        return () => document.body.classList.remove('services-tour-open');
    }, [tour]);

    useEffect(() => {
        const syncHeaderHeight = () => {
            const header = document.querySelector('.nav');
            document.documentElement.style.setProperty(
                '--tour-hdr',
                `${header?.clientHeight ?? 78}px`,
            );
        };

        syncHeaderHeight();
        window.addEventListener('resize', syncHeaderHeight);

        const intro = introRef.current;
        const observer = new IntersectionObserver(
            ([entry]) => setScrolled(!entry.isIntersecting),
            { threshold: 0 },
        );

        if (intro) {
            observer.observe(intro);
        }

        return () => {
            window.removeEventListener('resize', syncHeaderHeight);
            observer.disconnect();
        };
    }, []);

    // Phone: every panel starts closed and the stack walks itself until the visitor touches it.
    useEffect(() => {
        if (!onPhone()) {
            return;
        }

        // Closed after mount, not during: keeps the server-rendered markup hydratable.
        const close = window.setTimeout(() => setActiveDepartment(null), 0);

        let walk: number | null = null;
        let idle: number | null = null;

        const step = () => {
            if (!onPhone()) {
                walk = null;

                return;
            }

            setActiveDepartment((current) => {
                const index = departments.findIndex(
                    (department) => department.id === current,
                );

                return departments[(index + 1) % departments.length].id;
            });

            walk = window.setTimeout(step, 5000);
        };

        const stop = () => {
            if (walk) {
                window.clearTimeout(walk);
                walk = null;
            }

            if (idle) {
                window.clearTimeout(idle);
            }

            idle = window.setTimeout(() => {
                if (!walk) {
                    step();
                }
            }, 30000);
        };

        walk = window.setTimeout(step, 3000);

        const events = ['pointerdown', 'touchstart', 'keydown'] as const;

        events.forEach((event) =>
            window.addEventListener(event, stop, { passive: true }),
        );

        return () => {
            events.forEach((event) => window.removeEventListener(event, stop));
            window.clearTimeout(close);

            if (walk) {
                window.clearTimeout(walk);
            }

            if (idle) {
                window.clearTimeout(idle);
            }
        };
    }, []);

    const showPreparingNotice = () => setNotice(copy.preparing[language]);

    const openDepartment = (department: Department) => {
        if (onPhone() && department.underConstruction) {
            showPreparingNotice();

            return;
        }

        setActiveDepartment(department.id);
    };

    return (
        <>
            <Head title={copy.eyebrow[language]}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <main
                ref={rootRef}
                className={[
                    'services-tour',
                    scrolled && 'is-scrolled',
                    tour && 'is-touring',
                ]
                    .filter(Boolean)
                    .join(' ')}
                dir={isRtl ? 'rtl' : 'ltr'}
            >
                {tour && (
                    <div className="services-tour__fs">
                        <button
                            type="button"
                            className="services-tour__fs-back"
                            onClick={closeTour}
                        >
                            <ArrowLeft aria-hidden="true" />
                            {copy.back[language]}
                        </button>

                        <div
                            className="services-tour__fs-tabs"
                            role="tablist"
                            ref={tourTabsRef}
                        >
                            {departments.map((department) => {
                                const Icon = department.icon;
                                const isActive = department.id === tour;

                                return (
                                    <button
                                        type="button"
                                        key={department.id}
                                        className={[
                                            'tour-tab',
                                            `tour-tab--${department.id}`,
                                            isActive && 'is-active',
                                            department.underConstruction &&
                                                'is-muted',
                                        ]
                                            .filter(Boolean)
                                            .join(' ')}
                                        role="tab"
                                        aria-selected={isActive}
                                        onClick={() =>
                                            department.underConstruction
                                                ? showPreparingNotice()
                                                : openTour(department.id)
                                        }
                                    >
                                        <span className="department-tab__dot" />
                                        <Icon aria-hidden="true" />
                                        <span>{department.tab[language]}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            className="services-tour__fs-close"
                            onClick={closeTour}
                            aria-label={copy.closeTour[language]}
                        >
                            <X aria-hidden="true" />
                        </button>
                    </div>
                )}

                {loadedTours.map((id) => {
                    const department = departments.find(
                        (candidate) => candidate.id === id,
                    );

                    if (!department?.tourUrl) {
                        return null;
                    }

                    return (
                        <div
                            key={id}
                            className={[
                                'services-tour__frame',
                                id === tour && 'is-active',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            <iframe
                                src={department.tourUrl}
                                title={
                                    department.tourTitle ?? department.title.en
                                }
                                loading="lazy"
                                onLoad={(event) =>
                                    event.currentTarget.contentWindow?.postMessage(
                                        { lang: language },
                                        '*',
                                    )
                                }
                            />
                        </div>
                    );
                })}

                <section className="services-tour__intro" ref={introRef}>
                    <div className="services-tour__eyebrow">
                        <span className="services-tour__pulse" />
                        {copy.eyebrow[language]}
                    </div>
                    <h1>
                        {copy.titleLead[language]}{' '}
                        <em>{copy.titleEmphasis[language]}</em>
                    </h1>
                    <p>{copy.intro[language]}</p>
                </section>

                <section
                    className="department-tour"
                    aria-label={copy.eyebrow[language]}
                >
                    <div className="department-tour__tabs" role="tablist">
                        {departments.map((department) => {
                            const Icon = department.icon;
                            const isActive = department.id === activeDepartment;

                            return (
                                <button
                                    type="button"
                                    key={department.id}
                                    className={[
                                        'department-tab',
                                        `department-tab--${department.id}`,
                                        isActive && 'is-active',
                                        department.underConstruction &&
                                            'is-muted',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    role="tab"
                                    aria-selected={isActive}
                                    aria-controls={`department-panel-${department.id}`}
                                    onClick={() =>
                                        setActiveDepartment(department.id)
                                    }
                                >
                                    <span className="department-tab__dot" />
                                    <Icon aria-hidden="true" />
                                    <span>{department.tab[language]}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="department-tour__panels" ref={panelsRef}>
                        {departments.map((department) => {
                            const Icon = department.icon;
                            const isActive = department.id === activeDepartment;
                            const panelStyle = {
                                '--tour-image': `url("${imageFor(department, language)}")`,
                            } as CSSProperties;

                            return (
                                <article
                                    key={department.id}
                                    id={`department-panel-${department.id}`}
                                    className={[
                                        'department-panel',
                                        `department-panel--${department.id}`,
                                        isActive && 'is-active',
                                        department.underConstruction &&
                                            'is-muted',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    role="tabpanel"
                                    aria-hidden={!isActive}
                                    data-dept={department.id}
                                    style={panelStyle}
                                    onClick={() => openDepartment(department)}
                                >
                                    <span
                                        className="department-panel__push"
                                        aria-hidden="true"
                                    >
                                        <span
                                            style={{
                                                transform: `scaleX(${isActive ? progress : 0})`,
                                            }}
                                        />
                                    </span>

                                    {department.underConstruction &&
                                        isActive && (
                                            <span className="department-panel__status">
                                                <Construction aria-hidden="true" />
                                                {copy.construction[language]}
                                            </span>
                                        )}

                                    <div className="department-panel__closed">
                                        <div className="department-panel__vertical-title">
                                            <span>
                                                {department.tab[language]}
                                            </span>
                                            <span>
                                                {department.alternate[language]}
                                            </span>
                                        </div>
                                        <span className="department-panel__icon">
                                            <Icon aria-hidden="true" />
                                        </span>
                                    </div>

                                    <div className="department-panel__open">
                                        <div className="department-panel__content">
                                            <span className="department-panel__kick">
                                                <span />
                                                {department.kick[language]}
                                            </span>
                                            <h2>
                                                {department.title[language]}
                                                <small>
                                                    {
                                                        department.tagline[
                                                            language
                                                        ]
                                                    }
                                                </small>
                                            </h2>
                                            <p>
                                                <strong>
                                                    {department.lead[language]}
                                                </strong>{' '}
                                                {department.body[language]}
                                            </p>

                                            <div className="department-panel__features">
                                                {department.features.map(
                                                    (feature) => {
                                                        const FeatureIcon =
                                                            feature.icon;

                                                        return (
                                                            <span
                                                                key={
                                                                    feature
                                                                        .label
                                                                        .en
                                                                }
                                                            >
                                                                <FeatureIcon aria-hidden="true" />
                                                                {
                                                                    feature
                                                                        .label[
                                                                        language
                                                                    ]
                                                                }
                                                            </span>
                                                        );
                                                    },
                                                )}
                                            </div>

                                            <div className="department-panel__action">
                                                {department.underConstruction ? (
                                                    <span>
                                                        {
                                                            copy.preparing[
                                                                language
                                                            ]
                                                        }
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            openTour(
                                                                department.id,
                                                            );
                                                        }}
                                                    >
                                                        <ChevronsDown aria-hidden="true" />
                                                        {
                                                            copy.takeTour[
                                                                language
                                                            ]
                                                        }
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <p
                    className={[
                        'services-tour__hint',
                        atBottom && 'is-visible',
                        activeDepartment && !tourUrl && 'is-soon',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    {!activeDepartment || tourUrl
                        ? copy.keepScrolling[language]
                        : copy.preparing[language]}
                </p>

                <div
                    className={['services-tour__notice', notice && 'is-visible']
                        .filter(Boolean)
                        .join(' ')}
                    role="status"
                    aria-live="polite"
                >
                    <Construction aria-hidden="true" />
                    {notice}
                </div>

                <BookingModal
                    doctor={bookingDoctor}
                    hasOnlineBooking={bookingDoctor?.has_online_booking}
                    open={bookingDoctor !== null}
                    onOpenChange={(open) => !open && setBookingDoctor(null)}
                />
            </main>
        </>
    );
}
