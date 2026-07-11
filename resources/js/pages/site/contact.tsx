import { useState } from 'react'
import bannerPhoto from '@/site/assets/slider/slider1.jpg'
import PageBanner from '@/site/components/PageBanner'
import { PHONE, PHONE_TEL, EMERGENCY_PHONE, EMERGENCY_TEL } from '@/site/i18n/constants'
import { useLanguage } from '@/site/i18n/LanguageContext'

const MAP_QUERY = encodeURIComponent('Dar As-Salama Hospital, Al Khobar Al Shamalia, Khobar, Saudi Arabia')
const MAP_SRC = `https://www.google.com/maps?q=${MAP_QUERY}&output=embed`

const PIN_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 21s7-6.4 7-11.5a7 7 0 1 0-14 0C5 14.6 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </svg>
)

const PHONE_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.6 21 3 12.4 3 2.9c0-.5.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8Z" />
  </svg>
)

const MAIL_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2.4" />
    <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CLOCK_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.2 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ALERT_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5" strokeLinecap="round" />
    <circle cx="12" cy="16.2" r="0.9" fill="currentColor" stroke="none" />
  </svg>
)

export default function Contact() {
  const { t } = useLanguage()
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target))
    // ponytail: static form for now — POST `data` to the real endpoint when the API is ready.
    console.log('contact form submit', data)
    setSent(true)
  }

  return (
    <>
      <PageBanner eyebrow={t('contact.eyebrow')} title={t('contact.title')} intro={t('contact.intro')} image={bannerPhoto} />

      <section className="contact-body">
        <div className="container">
          <div className="contact-info__grid">
            <div className="info-tile">
              <span className="info-tile__icon">{PIN_ICON}</span>
              <h3>{t('contact.addressLabel')}</h3>
              <p>{t('contact.addressValue')}</p>
            </div>
            <div className="info-tile">
              <span className="info-tile__icon">{PHONE_ICON}</span>
              <h3>{t('contact.phoneLabel')}</h3>
              <p>
                <a href={PHONE_TEL}>
                  <bdi dir="ltr">{PHONE}</bdi>
                </a>
              </p>
            </div>
            <div className="info-tile">
              <span className="info-tile__icon">{MAIL_ICON}</span>
              <h3>{t('contact.mailLabel')}</h3>
              <p>
                <a href={`mailto:${t('contact.mailValue')}`}>
                  <bdi dir="ltr">{t('contact.mailValue')}</bdi>
                </a>
              </p>
            </div>
            <div className="info-tile">
              <span className="info-tile__icon">{CLOCK_ICON}</span>
              <h3>{t('contact.hoursLabel')}</h3>
              <ul className="info-tile__hours">
                <li>
                  <span>{t('contact.hoursEmergencyLabel')}</span>
                  <bdi dir="ltr">{t('contact.hoursEmergencyValue')}</bdi>
                </li>
                <li className="info-tile__hours-group">
                  <span>{t('contact.hoursOutpatientLabel')}</span>
                  {t('contact.hoursOutpatientLines').map((line) => (
                    <bdi dir="ltr" key={line}>
                      {line}
                    </bdi>
                  ))}
                </li>
              </ul>
            </div>
          </div>

          <div className="contact-form-card">
            {sent ? (
              <div className="contact-form__sent">
                <h2>{t('contact.form.sentHeading')}</h2>
                <p>{t('contact.form.sentBody')}</p>
              </div>
            ) : (
              <>
                <h2>{t('contact.form.heading')}</h2>
                <p className="contact-form-card__sub">{t('contact.form.sub')}</p>
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="contact-form__row">
                    <input name="name" required placeholder={t('contact.form.name')} />
                    <input name="email" type="email" required placeholder={t('contact.form.email')} />
                  </div>
                  <div className="contact-form__row">
                    <input name="phone" type="tel" required placeholder={t('contact.form.phone')} />
                    <input name="subject" required placeholder={t('contact.form.subject')} />
                  </div>
                  <textarea name="message" rows={5} required placeholder={t('contact.form.message')} />
                  <button type="submit" className="btn btn--coral">
                    {t('contact.form.submit')}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="emergency-banner">
        <div className="container">
          <div className="emergency-banner__card">
            <span className="emergency-banner__icon">{ALERT_ICON}</span>
            <div className="emergency-banner__text">
              <h3>{t('contact.emergencyLabel')}</h3>
              <p>{t('contact.emergencyNote')}</p>
            </div>
            <a className="emergency-banner__cta" href={EMERGENCY_TEL}>
              {PHONE_ICON}
              <bdi dir="ltr">{EMERGENCY_PHONE}</bdi>
            </a>
          </div>
        </div>
      </section>

      <section className="contact-map">
        <iframe
          src={MAP_SRC}
          title="Dar As Salama Medical Hospital location"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </>
  )
}
