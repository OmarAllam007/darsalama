import Pearls from '@/site/components/Pearls'
import { useSlider } from '@/site/hooks/useSlider'
import { useLanguage } from '@/site/i18n/LanguageContext'

const slides = Object.entries(
  import.meta.glob('../../site/assets/images/offers/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' }),
)
  .sort(([a], [b]) => {
    const numA = parseInt(a.match(/(\d+)\.\w+$/)[1], 10)
    const numB = parseInt(b.match(/(\d+)\.\w+$/)[1], 10)

    return numA - numB
  })
  .map(([, src]) => src)

export default function Offers() {
  const { t } = useLanguage()
  const { index, setIndex, goPrev, goNext } = useSlider(slides.length)

  return (
    <section className="offers-page">
      <div className="container">
        <div className="section-intro">
          <p className="eyebrow">
            <Pearls /> {t('offers.eyebrow')}
          </p>
          <h1>{t('offers.title')}</h1>
          <p>{t('offers.intro')}</p>
        </div>

        <div className="offers-slider">
          <div className="offers-slider__frame">
            {slides.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${t('offers.title')} ${i + 1}`}
                className={`offers-slider__slide${i === index ? ' is-active' : ''}`}
              />
            ))}
          </div>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                className="offers-slider__arrow offers-slider__arrow--prev"
                aria-label="Previous offer"
                onClick={goPrev}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className="offers-slider__arrow offers-slider__arrow--next"
                aria-label="Next offer"
                onClick={goNext}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>

        {slides.length > 1 && (
          <div className="offers-slider__dots">
            {slides.map((src, i) => (
              <button
                key={src}
                type="button"
                className={`offers-slider__dot${i === index ? ' is-active' : ''}`}
                aria-label={`Show offer ${i + 1}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
