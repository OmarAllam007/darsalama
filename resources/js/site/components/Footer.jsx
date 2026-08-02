import { Link } from '@inertiajs/react';
import {
    ArrowUp,
    ArrowUpRight,
    Clock3,
    Mail,
    MapPin,
    PhoneCall,
    ShieldCheck,
} from 'lucide-react';
import { about, contact, home, offers, services } from '@/routes';
import { MAP_URL, PHONE, PHONE_TEL } from '../i18n/constants';
import androidBadge from '../assets/images/app_download/android_download.png';
import appleBadge from '../assets/images/app_download/apple_download.png';
import logo from '../assets/images/logo.png';
import { useLanguage } from '../i18n/LanguageContext';
import { useVisibleSitePages } from '../hooks/useVisibleSitePages';

const SOCIAL = [
    {
        label: 'Facebook',
        d: 'M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5Z',
    },
    {
        label: 'Instagram',
        d: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.5-1.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
    },
    {
        label: 'LinkedIn',
        d: 'M4.98 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1c.5-.9 1.8-1.9 3.7-1.9 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4V9Z',
    },
];

export default function Footer() {
    const { t } = useLanguage();
    const linkLabels = t('footer.exploreLinks');
    const email = t('footer.email');
    const visiblePages = useVisibleSitePages();
    const links = [
        { href: home(), label: linkLabels[0].label },
        { href: about(), slug: 'about', label: linkLabels[1].label },
        { href: services(), slug: 'services', label: linkLabels[2].label },
        { href: offers(), slug: 'offers', label: linkLabels[3].label },
        { href: contact(), slug: 'contact', label: linkLabels[4].label },
        { href: `${home.url()}#book`, label: linkLabels[5].label },
    ].filter((link) => !link.slug || visiblePages.has(link.slug));

    return (
        <footer className="footer" id="footer">
            <div
                className="footer__glow footer__glow--one"
                aria-hidden="true"
            />
            <div
                className="footer__glow footer__glow--two"
                aria-hidden="true"
            />

            <div className="footer__inner container">
                <section className="footer__care">
                    <div className="footer__care-copy">
                        <span className="footer__eyebrow">
                            <span className="footer__pulse" />
                            {t('footer.careEyebrow')}
                        </span>
                        <h2>{t('footer.careHeading')}</h2>
                        <p>{t('footer.careBody')}</p>
                    </div>

                    <div className="footer__care-actions">
                        <a className="footer__call" href={PHONE_TEL}>
                            <span className="footer__action-icon">
                                <PhoneCall size={18} />
                            </span>
                            <span>
                                <small>{t('footer.callNow')}</small>
                                <bdi dir="ltr">{PHONE}</bdi>
                            </span>
                        </a>
                        <Link
                            className="footer__book"
                            href={`${home.url()}#book`}
                        >
                            {t('footer.bookNow')}
                            <ArrowUpRight size={17} />
                        </Link>
                    </div>
                </section>

                <div className="footer__grid">
                    <div className="footer__brand">
                        <Link
                            className="footer__logo"
                            href={home()}
                            aria-label={t('nav.home')}
                        >
                            <img
                                src={logo}
                                alt={`${t('nav.logoPrimaryLead')} ${t('nav.logoPrimaryEm')}`}
                            />
                        </Link>
                        <p className="footer__tag">{t('footer.tag')}</p>
                        <div className="footer__trust">
                            <ShieldCheck size={15} />
                            <span>{t('footer.trustNote')}</span>
                        </div>
                        <div className="footer__social">
                            {SOCIAL.map((social) => (
                                <a
                                    key={social.label}
                                    href="#top"
                                    aria-label={social.label}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d={social.d} />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="footer__column">
                        <h3>{t('footer.exploreHeading')}</h3>
                        <ul className="footer__links">
                            {links.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href}>
                                        <span>{link.label}</span>
                                        <ArrowUpRight size={13} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer__column footer__contact">
                        <h3>{t('footer.contactHeading')}</h3>
                        <ul>
                            <li>
                                <span className="footer__contact-icon">
                                    <PhoneCall size={16} />
                                </span>
                                <a href={PHONE_TEL}>
                                    <small>{t('footer.phoneLabel')}</small>
                                    <bdi dir="ltr">{PHONE}</bdi>
                                </a>
                            </li>
                            <li>
                                <span className="footer__contact-icon">
                                    <Mail size={16} />
                                </span>
                                <a href={`mailto:${email}`}>
                                    <small>{t('footer.emailLabel')}</small>
                                    <bdi dir="ltr">{email}</bdi>
                                </a>
                            </li>
                            <li>
                                <span className="footer__contact-icon">
                                    <MapPin size={16} />
                                </span>
                                <a
                                    href={MAP_URL}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <small>{t('footer.locationLabel')}</small>
                                    <span>{t('footer.address')}</span>
                                </a>
                            </li>
                            <li>
                                <span className="footer__contact-icon">
                                    <Clock3 size={16} />
                                </span>
                                <div>
                                    <small>{t('footer.emergencyLabel')}</small>
                                    <span>{t('footer.openAllDay')}</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="footer__column footer__apps">
                        <h3>{t('footer.appHeading')}</h3>
                        <p>{t('footer.appBody')}</p>
                        <div className="footer__stores">
                            <a href="#" aria-label="Download on the App Store">
                                <img
                                    src={appleBadge}
                                    alt="Download on the App Store"
                                />
                            </a>
                            <a href="#" aria-label="Get it on Google Play">
                                <img
                                    src={androidBadge}
                                    alt="Get it on Google Play"
                                />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer__bottom">
                    <span>{t('footer.copyright')}</span>
                    <a href={MAP_URL} target="_blank" rel="noreferrer">
                        <MapPin size={13} />
                        {t('footer.address')}
                    </a>
                    <a className="footer__top" href="#">
                        {t('footer.backToTop')}
                        <ArrowUp size={14} />
                    </a>
                </div>
            </div>
        </footer>
    );
}
