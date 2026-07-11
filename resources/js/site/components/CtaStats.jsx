import Pearls from './Pearls'
import doctorPhoto from '../assets/images/doctors/doc2.jpg'
import { useLanguage } from '../i18n/LanguageContext'
import { PHONE, PHONE_TEL } from '../i18n/constants'

export default function CtaStats() {
  const { t } = useLanguage()
  const stats = t('cta.stats')

  return (
    <section className="container">
      <div className="cta" id="book">
        <div className="cta__inner">
          <div className="cta__photo">
            <img src={doctorPhoto} alt="Physician at Dar As Salama Medical Hospital" />
          </div>
          <div>
            <p className="eyebrow cta__eyebrow">
              <Pearls /> {t('cta.eyebrow')}
            </p>
            <h2>{t('cta.heading')}</h2>
            <p>{t('cta.body')}</p>
            <div className="cta__actions">
              <a className="btn btn--coral" href="#top">
                {t('cta.cta1')}
              </a>
              <a className="btn btn--ghost-light" href={PHONE_TEL}>
                {t('cta.cta2')} <bdi dir="ltr">{PHONE}</bdi>
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
    </section>
  )
}
