import { useLanguage } from '../i18n/LanguageContext'

const ICONS = [
  <svg key="0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 21C12 21 3 14.5 3 8.75C3 5.75 5.5 3.5 8.5 3.5C10.5 3.5 12 5 12 5C12 5 13.5 3.5 15.5 3.5C18.5 3.5 21 5.75 21 8.75C21 14.5 12 21 12 21Z" />
  </svg>,
  <svg key="1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="13" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>,
  <svg key="2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
  </svg>,
  <svg key="3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
  </svg>,
]

export default function Features() {
  const { t } = useLanguage()
  const items = t('features.items')

  return (
    <section className="features" id="features">
      <div className="container">
        <div className="features__grid">
          {items.map((f, i) => (
            <article className="feature-card" key={f.title}>
              <div className="feature-card__icon">{ICONS[i]}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
