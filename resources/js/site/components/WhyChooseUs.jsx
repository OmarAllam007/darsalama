import { Link } from '@inertiajs/react';
import { ArrowUpRight, BadgeCheck, ShieldCheck } from 'lucide-react';
import { doctors } from '@/routes';
import Pearls from './Pearls';
import doctorPhoto from '../assets/images/doctors/doc1.jpg';
import { useLanguage } from '../i18n/LanguageContext';

export default function WhyChooseUs() {
    const { t } = useLanguage();
    const points = t('why.points');

    return (
        <section className="why home-why" id="why">
            <div className="why__inner container">
                <div className="home-why__visual">
                    <div className="why__panel">
                        <img
                            src={doctorPhoto}
                            alt="Physician at Dar As Salama Medical Hospital"
                        />
                    </div>
                    <div className="home-why__badge">
                        <BadgeCheck size={20} />
                        <span>
                            <small>{t('why.proofLabel')}</small>
                            {t('why.proofValue')}
                        </span>
                    </div>
                    <ShieldCheck
                        className="home-why__watermark"
                        aria-hidden="true"
                    />
                </div>
                <div className="home-why__copy">
                    <p className="eyebrow why__eyebrow home-dsm__eyebrow">
                        <Pearls /> {t('why.eyebrow')}
                    </p>
                    <h2>{t('why.heading')}</h2>
                    <p className="home-why__intro">{t('why.intro')}</p>
                    <ul className="why__list">
                        {points.map((p, index) => (
                            <li key={p.title}>
                                <span className="home-why__number">
                                    0{index + 1}
                                </span>
                                <div>
                                    <h4>{p.title}</h4>
                                    <p>{p.body}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Link href={doctors()} className="home-why__link">
                        {t('why.cta')}
                        <ArrowUpRight size={17} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
