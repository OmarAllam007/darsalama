import { Link } from '@inertiajs/react'
import bannerPhoto from '@/site/assets/images/doctors/doc2.jpg'
import PageBanner from '@/site/components/PageBanner'
import { EMERGENCY_PHONE, EMERGENCY_TEL } from '@/site/i18n/constants'
import { useLanguage } from '@/site/i18n/LanguageContext'

const DEPT_ICONS = [
  // Cardiology
  <svg key="0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 21C12 21 3 14.5 3 8.75C3 5.75 5.5 3.5 8.5 3.5C10.5 3.5 12 5 12 5C12 5 13.5 3.5 15.5 3.5C18.5 3.5 21 5.75 21 8.75C21 14.5 12 21 12 21Z" />
    <path d="M5 12h3l1.4-2.8L11.5 13l1.3-2h4.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Dental
  <svg key="1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3c-1.6 0-2.6.9-3.8.9S6 3 4.6 3.6C2.9 4.4 2.7 7 3.5 9c.5 1.2.6 2.5.9 3.8.3 1.3.6 3.3 1.5 4.3.7.8 1.4-.3 1.8-1.5.3-1 .5-2.3 1.4-2.3s1.1 1.3 1.4 2.3c.4 1.2 1.1 2.3 1.8 1.5.9-1 1.2-3 1.5-4.3.3-1.3.4-2.6.9-3.8.8-2-.6-4.6-2.4-5.4C15 3 13.5 3 12 3Z" />
  </svg>,
  // Dermatology
  <svg key="2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2s6.2 7.4 6.2 12A6.2 6.2 0 1 1 5.8 14c0-4.6 6.2-12 6.2-12Z" />
  </svg>,
  // ENT
  <svg key="3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M8.5 12.5c-.5 1.5.2 2.5 1.5 2.5a2.7 2.7 0 0 0 2.7-2.7c0-1.5-.9-2-1.5-3.1a3.7 3.7 0 0 1-.2-3.2A5.3 5.3 0 0 1 16 3c3 0 5.3 2.5 5.3 5.8 0 2.2-1 3.4-2 4.6-1.1 1.2-1.8 2-1.8 3.6a3 3 0 0 1-6 0" />
  </svg>,
  // Orthopedics
  <svg key="4" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="6" cy="18" r="2.4" />
    <circle cx="18" cy="6" r="2.4" />
    <path d="M7.7 16.3 16.3 7.7" />
  </svg>,
  // Pediatrics
  <svg key="5" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="7.5" />
    <circle cx="9.3" cy="11" r="1" fill="currentColor" stroke="none" />
    <circle cx="14.7" cy="11" r="1" fill="currentColor" stroke="none" />
    <path d="M9 15c1 1 2 1.5 3 1.5s2-.5 3-1.5" strokeLinecap="round" />
  </svg>,
  // Ophthalmology
  <svg key="6" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="3" />
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
  </svg>,
  // Obstetrics & Gynecology
  <svg key="7" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="6" r="2.6" />
    <path d="M12 9v3M8 21l2-7h4l2 7M7 15h10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
]

const EMERGENCY_ICONS = [
  <svg key="0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" strokeLinejoin="round" />
  </svg>,
  <svg key="1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 18v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2M13 12h4a2 2 0 0 1 2 2v4" strokeLinecap="round" />
    <path d="M3 15h18M3 18v2M21 18v2" strokeLinecap="round" />
    <circle cx="7" cy="8.5" r="1.6" />
  </svg>,
  <svg key="2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.2 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
]

const PHONE_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.6 21 3 12.4 3 2.9c0-.5.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8Z" />
  </svg>
)

const CHEVRON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M9 5l6 7-6 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CHECK = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function Services() {
  const { t } = useLanguage()
  const departments = t('services.departments.items')
  const emergencyItems = t('services.emergency.items')
  const diagnostics = t('services.diagnostics.items')

  return (
    <>
      <PageBanner eyebrow={t('services.eyebrow')} title={t('services.title')} intro={t('services.intro')} image={bannerPhoto} />

      <section className="dept-section">
        <div className="container">
          <div className="section-intro">
            <h2>{t('services.departments.heading')}</h2>
            <p>{t('services.departments.sub')}</p>
          </div>
          <div className="dept-grid">
            {departments.map((d, i) => (
              <article className="dept-card" key={d.title}>
                <div className="dept-card__head">
                  <span className="dept-card__icon">{DEPT_ICONS[i]}</span>
                  <h3>{d.title}</h3>
                </div>
                <p className="dept-card__body">{d.body}</p>
                <ul className="dept-card__list">
                  {d.services.map((s) => (
                    <li key={s}>
                      {CHEVRON}
                      {s}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="emergency-section">
        <div className="container">
          <div className="section-intro">
            <h2>{t('services.emergency.heading')}</h2>
            <p>{t('services.emergency.sub')}</p>
          </div>
          <div className="emergency-grid">
            {emergencyItems.map((e, i) => (
              <div className="info-card" key={e.title}>
                <div className="info-card__head">
                  <h3>{e.title}</h3>
                  <span className="info-card__icon">{EMERGENCY_ICONS[i]}</span>
                </div>
                <p>{e.body}</p>
              </div>
            ))}
            <div className="info-card">
              <div className="info-card__head">
                <h3>{t('services.emergency.phoneLabel')}</h3>
                <span className="info-card__icon">{PHONE_ICON}</span>
              </div>
              <a className="info-card__phone" href={EMERGENCY_TEL}>
                <bdi dir="ltr">{EMERGENCY_PHONE}</bdi>
              </a>
              <p>{t('services.emergency.phoneNote')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="diagnostics-section">
        <div className="container">
          <div className="section-intro">
            <h2>{t('services.diagnostics.heading')}</h2>
            <p>{t('services.diagnostics.sub')}</p>
          </div>
          <div className="diagnostics-grid">
            {diagnostics.map((d) => (
              <div className="info-card" key={d.title}>
                <div className="info-card__head">
                  <h3>{d.title}</h3>
                  <span className="info-card__icon info-card__icon--check">{CHECK}</span>
                </div>
                <p>{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="services-cta">
        <div className="container services-cta__inner">
          <h2>{t('services.cta.heading')}</h2>
          <p>{t('services.cta.sub')}</p>
          <div className="services-cta__actions">
            <Link className="btn btn--coral" href="/#book">
              {t('services.cta.book')}
            </Link>
            <Link className="btn btn--ghost-ink" href="/doctors">
              {t('services.cta.findDoctor')}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
