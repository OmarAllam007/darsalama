import { Head, Link } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUpRight,
    Award,
    Eye,
    HeartHandshake,
    HeartPulse,
    Lightbulb,
    Quote,
    ShieldCheck,
    Sparkles,
    UsersRound,
} from 'lucide-react';
import { services } from '@/routes';
import carePhoto from '@/site/assets/images/slider/slider2.jpeg';
import receptionPhoto from '@/site/assets/images/slider/slider4.jpeg';
import heroPhoto from '@/site/assets/slider/slider1.jpg';
import { useLanguage } from '@/site/i18n/LanguageContext';

type Value = {
    title: string;
    body: string;
};

type Milestone = {
    year: string;
    body: string;
};

const VALUE_ICONS = [HeartHandshake, Award, Lightbulb, UsersRound];

export default function About() {
    const { t } = useLanguage();
    const values = t('about.values.items') as Value[];
    const milestones = t('about.journey.items') as Milestone[];
    const stats = t('about.stats') as Array<{
        value: string;
        label: string;
    }>;

    return (
        <>
            <Head title={t('about.title')} />

            <div className="about-dsm">
                <section className="about-dsm__hero">
                    <img
                        src={heroPhoto}
                        alt=""
                        className="about-dsm__hero-photo"
                    />
                    <div className="about-dsm__hero-overlay" />
                    <Sparkles
                        className="about-dsm__hero-mark"
                        aria-hidden="true"
                    />

                    <div className="about-dsm__hero-inner container">
                        <p className="about-dsm__eyebrow">
                            <span />
                            {t('about.eyebrow')}
                        </p>
                        <h1>{t('about.title')}</h1>
                        <p className="about-dsm__hero-intro">
                            {t('about.intro')}
                        </p>
                        <div className="about-dsm__hero-actions">
                            <a
                                href="#about-story"
                                className="about-dsm__primary"
                            >
                                {t('about.discoverStory')}
                                <ArrowDown size={16} />
                            </a>
                            <Link
                                href={services()}
                                className="about-dsm__secondary"
                            >
                                {t('about.exploreServices')}
                                <ArrowUpRight size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className="about-dsm__gold-line" />
                </section>

                <section
                    className="about-dsm__stats"
                    aria-label={t('about.eyebrow')}
                >
                    <div className="about-dsm__stats-grid container">
                        {stats.map((stat) => (
                            <div key={stat.label}>
                                <strong>{stat.value}</strong>
                                <span>{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <main className="about-dsm__paper">
                    <section className="about-dsm__story" id="about-story">
                        <div className="about-dsm__story-grid container">
                            <div className="about-dsm__visual">
                                <div className="about-dsm__visual-main">
                                    <img src={carePhoto} alt="" />
                                </div>
                                <div className="about-dsm__visual-inset">
                                    <img src={receptionPhoto} alt="" />
                                </div>
                                <div className="about-dsm__since">
                                    <ShieldCheck size={20} />
                                    <span>
                                        <small>{t('about.established')}</small>
                                        1976
                                    </span>
                                </div>
                            </div>

                            <div className="about-dsm__story-copy">
                                <p className="about-dsm__section-kicker">
                                    <span />
                                    {t('about.storyEyebrow')}
                                </p>
                                <h2>{t('about.storyHeading')}</h2>
                                <p className="about-dsm__story-lead">
                                    {t('about.intro')}
                                </p>

                                <div className="about-dsm__purpose">
                                    <article>
                                        <div className="about-dsm__purpose-icon">
                                            <HeartPulse size={22} />
                                        </div>
                                        <div>
                                            <span>
                                                {t('about.missionLabel')}
                                            </span>
                                            <h3>
                                                {t('about.mission.heading')}
                                            </h3>
                                            <p>{t('about.mission.body')}</p>
                                        </div>
                                    </article>
                                    <article>
                                        <div className="about-dsm__purpose-icon">
                                            <Eye size={22} />
                                        </div>
                                        <div>
                                            <span>
                                                {t('about.visionLabel')}
                                            </span>
                                            <h3>{t('about.vision.heading')}</h3>
                                            <p>{t('about.vision.body')}</p>
                                        </div>
                                    </article>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="about-dsm__values">
                        <div className="container">
                            <div className="about-dsm__section-head">
                                <div>
                                    <p className="about-dsm__section-kicker">
                                        <span />
                                        {t('about.values.heading')}
                                    </p>
                                    <h2>{t('about.values.sub')}</h2>
                                </div>
                                <p>{t('about.valuesIntro')}</p>
                            </div>

                            <div className="about-dsm__values-grid">
                                {values.map((value, index) => {
                                    const Icon =
                                        VALUE_ICONS[index] ?? HeartHandshake;

                                    return (
                                        <article key={value.title}>
                                            <span className="about-dsm__value-number">
                                                0{index + 1}
                                            </span>
                                            <div className="about-dsm__value-icon">
                                                <Icon size={24} />
                                            </div>
                                            <h3>{value.title}</h3>
                                            <p>{value.body}</p>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="about-dsm__journey">
                        <div className="container">
                            <div className="about-dsm__journey-head">
                                <p className="about-dsm__section-kicker">
                                    <span />
                                    {t('about.journey.heading')}
                                </p>
                                <h2>{t('about.journey.sub')}</h2>
                            </div>

                            <div className="about-dsm__timeline">
                                {milestones.map((milestone, index) => (
                                    <article key={milestone.year}>
                                        <div className="about-dsm__timeline-year">
                                            <span>{milestone.year}</span>
                                        </div>
                                        <div className="about-dsm__timeline-card">
                                            <span>0{index + 1}</span>
                                            <p>{milestone.body}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="about-dsm__leadership">
                        <div className="about-dsm__leadership-inner container">
                            <Quote
                                className="about-dsm__quote-mark"
                                aria-hidden="true"
                            />
                            <div>
                                <p className="about-dsm__section-kicker">
                                    <span />
                                    {t('about.leadership.heading')}
                                </p>
                                <blockquote>
                                    “{t('about.leadership.quote')}”
                                </blockquote>
                                <p className="about-dsm__attribution">
                                    {t('about.leadership.attribution')}
                                </p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
