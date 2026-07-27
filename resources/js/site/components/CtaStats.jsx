import { Link } from '@inertiajs/react';
import { ArrowUpRight, PhoneCall, Sparkles } from 'lucide-react';
import { doctors } from '@/routes';
import Pearls from './Pearls';
import doctorPhoto from '../assets/images/doctors/doc2.jpg';
import { useLanguage } from '../i18n/LanguageContext';
import { PHONE, PHONE_TEL } from '../i18n/constants';

export default function CtaStats() {
    const { t } = useLanguage();
    const stats = t('cta.stats');

    return (
        <section className="home-cta-wrap" id="book">
            <div className="container">
                <div className="cta home-cta">
                    <Sparkles className="home-cta__mark" aria-hidden="true" />
                    <div className="cta__inner">
                        <div className="cta__photo">
                            <img
                                src={doctorPhoto}
                                alt="Physician at Dar As Salama Medical Hospital"
                            />
                            <span>{t('cta.photoLabel')}</span>
                        </div>
                        <div className="home-cta__copy">
                            <p className="eyebrow cta__eyebrow home-dsm__eyebrow">
                                <Pearls /> {t('cta.eyebrow')}
                            </p>
                            <h2>{t('cta.heading')}</h2>
                            <p>{t('cta.body')}</p>
                            <div className="cta__actions">
                                <Link
                                    className="home-dsm__primary"
                                    href={doctors()}
                                >
                                    {t('cta.cta1')}
                                    <ArrowUpRight size={17} />
                                </Link>
                                <a
                                    className="home-dsm__secondary"
                                    href={PHONE_TEL}
                                >
                                    <PhoneCall size={17} />
                                    <span>{t('cta.cta2')}</span>
                                    <bdi dir="ltr">{PHONE}</bdi>
                                </a>
                            </div>
                        </div>
                        <div className="cta__divider" />
                        <div className="stats">
                            {stats.map((s) => (
                                <div key={s.label}>
                                    <div className="stat__num">{s.num}</div>
                                    <div className="stat__label">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
