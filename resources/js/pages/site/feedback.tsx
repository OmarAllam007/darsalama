import { useState } from 'react'
import Pearls from '@/site/components/Pearls'
import { useLanguage } from '@/site/i18n/LanguageContext'

const RATINGS = [
  { key: 'terrible', emoji: '😠' },
  { key: 'bad', emoji: '🙁' },
  { key: 'okay', emoji: '😐' },
  { key: 'good', emoji: '🙂' },
  { key: 'excellent', emoji: '😄' },
]

export default function Feedback() {
  const { t } = useLanguage()
  const [rating, setRating] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const ratingLabels = t('feedback.ratings')
  const mobileRequired = rating === 'terrible' || rating === 'bad'

  function handleSubmit(e) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target))
    // ponytail: static form for now — POST { rating, ...data } to the real endpoint when the API is ready.
    console.log('feedback submit', { rating, ...data })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section className="feedback-page">
        <div className="container feedback-thanks">
          <h1>{t('feedback.thanksHeading')}</h1>
          <p>{t('feedback.thanksBody')}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="feedback-page">
      <div className="container feedback-page__inner">
        <div className="section-intro">
          <p className="eyebrow">
            <Pearls /> {t('feedback.eyebrow')}
          </p>
          <h1>{t('feedback.title')}</h1>
          <p>{t('feedback.intro')}</p>
        </div>

        <div className="rating-picker">
          {RATINGS.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`rating-card${rating === r.key ? ' is-selected' : ''}`}
              onClick={() => setRating(r.key)}
            >
              <span className="rating-card__emoji">{r.emoji}</span>
              <span className="rating-card__label">{ratingLabels[r.key]}</span>
            </button>
          ))}
        </div>

        {rating && (
          <form className="feedback-form" onSubmit={handleSubmit}>
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
      </div>
    </section>
  )
}
