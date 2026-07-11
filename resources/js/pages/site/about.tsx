import bannerPhoto from '@/site/assets/slider/slider1.jpg'
import PageBanner from '@/site/components/PageBanner'
import Pearls from '@/site/components/Pearls'
import { useLanguage } from '@/site/i18n/LanguageContext'

const VALUE_ICONS = [
  <svg key="0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 21C12 21 3 14.5 3 8.75C3 5.75 5.5 3.5 8.5 3.5C10.5 3.5 12 5 12 5C12 5 13.5 3.5 15.5 3.5C18.5 3.5 21 5.75 21 8.75C21 14.5 12 21 12 21Z" />
  </svg>,
  <svg key="1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2l2.6 6.6L22 9l-5.3 4.6L18 21l-6-3.9L6 21l1.3-7.4L2 9l7.4-.4L12 2Z" />
  </svg>,
  <svg key="2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.9v.7h5v-.7c0-.8.4-1.5 1-1.9A6 6 0 0 0 12 2Z" />
  </svg>,
  <svg key="3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="8" cy="8" r="3.2" />
    <circle cx="17" cy="9" r="2.6" />
    <path d="M2.5 20c.6-3.6 3-5.6 5.5-5.6s4.9 2 5.5 5.6M14.8 20c.4-2.6 1.9-4.2 3.6-4.5" />
  </svg>,
]

const MISSION_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 21C12 21 3 14.5 3 8.75C3 5.75 5.5 3.5 8.5 3.5C10.5 3.5 12 5 12 5C12 5 13.5 3.5 15.5 3.5C18.5 3.5 21 5.75 21 8.75C21 14.5 12 21 12 21Z" />
    <path d="M9 12h2l1-2 2 4 1-2h2" />
  </svg>
)

const VISION_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="3" />
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
  </svg>
)

export default function About() {
  const { t } = useLanguage()
  const values = t('about.values.items')
  const milestones = t('about.journey.items')

  return (
    <>
      <PageBanner eyebrow={t('about.eyebrow')} title={t('about.title')} intro={t('about.intro')} image={bannerPhoto} />

      <section className="about-mv">
        <div className="container about-mv__grid">
          <div className="about-card">
            <div className="about-card__icon">{MISSION_ICON}</div>
            <h3>{t('about.mission.heading')}</h3>
            <p>{t('about.mission.body')}</p>
          </div>
          <div className="about-card">
            <div className="about-card__icon about-card__icon--coral">{VISION_ICON}</div>
            <h3>{t('about.vision.heading')}</h3>
            <p>{t('about.vision.body')}</p>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="container">
          <p className="eyebrow about-values__eyebrow">
            <Pearls /> {t('about.values.heading')}
          </p>
          <h2>{t('about.values.sub')}</h2>
          <div className="about-values__grid">
            {values.map((v, i) => (
              <div className="feature-card" key={v.title}>
                <div className="feature-card__icon">{VALUE_ICONS[i]}</div>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="journey">
        <div className="container">
          <p className="eyebrow journey__eyebrow">
            <Pearls /> {t('about.journey.heading')}
          </p>
          <h2>{t('about.journey.sub')}</h2>

          <div className="journey__list">
            {milestones.map((m) => (
              <div className="journey__item" key={m.year}>
                <div className="journey__node">
                  <span>{m.year}</span>
                </div>
                <div className="journey__card">
                  <p>{m.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="leadership">
        <div className="container leadership__inner">
          <h2>{t('about.leadership.heading')}</h2>
          <blockquote>“{t('about.leadership.quote')}”</blockquote>
          <p className="leadership__attribution">{t('about.leadership.attribution')}</p>
        </div>
      </section>
    </>
  )
}
