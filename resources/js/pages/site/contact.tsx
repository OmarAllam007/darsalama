import { useState, type CSSProperties, type FormEvent } from 'react'
import bannerPhoto from '@/site/assets/slider/slider1.jpg'
import PageBanner from '@/site/components/PageBanner'
import Pearls from '@/site/components/Pearls'
import { PHONE, PHONE_TEL, EMERGENCY_PHONE, EMERGENCY_TEL } from '@/site/i18n/constants'
import { useLanguage } from '@/site/i18n/LanguageContext'

const MAP_DESTINATION = '26.2827618,50.2127421'
const MAP_SRC = `https://www.google.com/maps?q=${MAP_DESTINATION}&output=embed`
// Opens turn-by-turn navigation to the hospital in the Google Maps app / site.
const MAP_NAV_URL = `https://www.google.com/maps/dir/?api=1&destination=${MAP_DESTINATION}`

const RATINGS = [
  { key: 'terrible', emoji: '😡', tone: '#ea4335' },
  { key: 'bad', emoji: '🙁', tone: '#f97316' },
  { key: 'okay', emoji: '😐', tone: '#eab308' },
  { key: 'good', emoji: '🙂', tone: '#22c55e' },
  { key: 'excellent', emoji: '😄', tone: '#3b82f6' },
]

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
  const [rating, setRating] = useState<string | null>(null)
  const [feedbackSent, setFeedbackSent] = useState(false)

  const ratingLabels = t('feedback.ratings')
  const mobileRequired = rating === 'terrible' || rating === 'bad'

  function handleMessageSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    // ponytail: static form for now — POST `data` to the real endpoint when the API is ready.
    console.log('contact form submit', data)
    setSent(true)
  }

  function handleFeedbackSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    // ponytail: static form for now — POST { rating, ...data } to the real endpoint when the API is ready.
    console.log('feedback submit', { rating, ...data })
    setFeedbackSent(true)
  }

  return (
    <>
      <PageBanner eyebrow={t('contact.eyebrow')} title={t('contact.title')} intro={t('contact.intro')} image={bannerPhoto} />

      {/* Feedback experience — mirrors the "How was your experience today?" block on the reference site. */}
      <section className="contact-feedback">
        <div className="container">
          <div className="contact-feedback__card">
            <div className="section-intro">
              <p className="eyebrow">
                <Pearls /> {t('feedback.eyebrow')}
              </p>
              <h2>{t('feedback.title')}</h2>
              <p>{t('feedback.intro')}</p>
            </div>

            {feedbackSent ? (
              <div className="contact-feedback__thanks">
                <h3>{t('feedback.thanksHeading')}</h3>
                <p>{t('feedback.thanksBody')}</p>
              </div>
            ) : (
              <>
                <div className="rating-picker">
                  {RATINGS.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      style={{ '--rating-tone': r.tone } as CSSProperties}
                      className={`rating-card${rating === r.key ? ' is-selected' : ''}`}
                      onClick={() => setRating(r.key)}
                    >
                      <span className="rating-card__emoji">{r.emoji}</span>
                      <span className="rating-card__label">{ratingLabels[r.key]}</span>
                    </button>
                  ))}
                </div>

                {rating && (
                  <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                    <label className="feedback-form__label" htmlFor="fb-mobile">
                      {t('feedback.mobileLabel')}{' '}
                      <span className="feedback-form__hint">
                        {mobileRequired ? t('feedback.mobileRequiredNote') : `(${t('feedback.mobileOptional')})`}
                      </span>
                    </label>
                    <div className="feedback-form__phone">
                      <span className="feedback-form__code">+966</span>
                      <input
                        id="fb-mobile"
                        name="mobile"
                        type="tel"
                        placeholder={t('feedback.mobilePlaceholder')}
                        required={mobileRequired}
                      />
                    </div>

                    <label className="feedback-form__label" htmlFor="fb-notes">
                      {t('feedback.improveLabel')}
                    </label>
                    <textarea id="fb-notes" name="notes" rows={5} placeholder={t('feedback.improvePlaceholder')} />

                    <button type="submit" className="btn btn--coral">
                      {t('feedback.submit')}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </section>

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
                  {t('contact.hoursOutpatientLines').map((line: string) => (
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
                <form className="contact-form" onSubmit={handleMessageSubmit}>
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
        <div className="container">
          <a
            className="contact-map__link"
            href={MAP_NAV_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('contact.getDirections')}
          >
            <iframe
              src={MAP_SRC}
              title="Dar As Salama Medical Hospital location"
              loading="lazy"
              tabIndex={-1}
              referrerPolicy="no-referrer-when-downgrade"
            />
            <span className="contact-map__overlay">
              <span className="contact-map__cta">
                {PIN_ICON}
                {t('contact.getDirections')}
              </span>
            </span>
          </a>
        </div>
      </section>
    </>
  )
}
