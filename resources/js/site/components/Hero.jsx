import Pearls from './Pearls'
import { useLanguage } from '../i18n/LanguageContext'
import { useSlider } from '../hooks/useSlider'

const slides = Object.entries(
  import.meta.glob('../assets/images/slider/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }),
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, src]) => src)

const LEFT_CHEVRON = 'M15 5l-7 7 7 7'
const RIGHT_CHEVRON = 'M9 5l7 7-7 7'

export default function Hero() {
  const { t, lang } = useLanguage()
  const { index, setIndex, goPrev, goNext } = useSlider(slides.length)
  const isRtl = lang === 'ar'
  const prevChevron = isRtl ? RIGHT_CHEVRON : LEFT_CHEVRON
  const nextChevron = isRtl ? LEFT_CHEVRON : RIGHT_CHEVRON

  return (
    <section className="hero" id="top">
      <div className="hero__slides">
        {slides.map((src, i) => (
          <img key={src} src={src} alt="" className={`hero__slide${i === index ? ' is-active' : ''}`} />
        ))}
        <div className="hero__scrim" />
      </div>

      {slides.length > 1 && (
        <>
          <button type="button" className="hero__arrow hero__arrow--prev" aria-label="Previous slide" onClick={goPrev}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={prevChevron} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className="hero__arrow hero__arrow--next" aria-label="Next slide" onClick={goNext}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={nextChevron} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      <div className="container hero__inner">
        <p className="eyebrow hero__eyebrow">
          <Pearls /> {t('hero.eyebrow')}
        </p>
        <h1 className="hero__title">
          {t('hero.titleLead')} <em>{t('hero.titleEm')}</em>
        </h1>
        <p className="hero__lede">{t('hero.lede')}</p>
        <div className="hero__actions">
          <a className="btn btn--coral" href="#book">
            {t('hero.cta1')}
          </a>
          {/* <a className="btn btn--ghost-light" href="tel:0512345678">
            {t('hero.cta2')}
          </a> */}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="hero__dots">
          {slides.map((src, i) => (
            <button
              key={src}
              type="button"
              className={`hero__dot${i === index ? ' is-active' : ''}`}
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
