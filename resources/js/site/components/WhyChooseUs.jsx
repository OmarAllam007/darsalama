import Pearls from './Pearls'
import doctorPhoto from '../assets/images/doctors/doc1.jpg'
import { useLanguage } from '../i18n/LanguageContext'

export default function WhyChooseUs() {
  const { t } = useLanguage()
  const points = t('why.points')

  return (
    <section className="why" id="why">
      <div className="container why__inner">
        <div className="why__panel">
          <img src={doctorPhoto} alt="Physician at Dar As Salama Medical Hospital" />
        </div>
        <div>
          <p className="eyebrow why__eyebrow">
            <Pearls /> {t('why.eyebrow')}
          </p>
          <h2>{t('why.heading')}</h2>
          <ul className="why__list">
            {points.map((p) => (
              <li key={p.title}>
                <Pearls />
                <div>
                  <h4>{p.title}</h4>
                  <p>{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
