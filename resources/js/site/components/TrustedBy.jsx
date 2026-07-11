import { useLanguage } from '../i18n/LanguageContext'

const logoModules = Object.entries(
  import.meta.glob('../assets/parteners/*.{jpg,jpeg,png,webp,svg}', { eager: true, import: 'default' }),
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, src]) => ({ src, file: path.split('/').pop() }))

export default function TrustedBy() {
  const { t } = useLanguage()
  const alts = t('trusted.alts')
  const logos = logoModules.map((logo) => ({ ...logo, alt: alts[logo.file] ?? 'Partner logo' }))

  return (
    <section className="trusted">
      <div className="container">
        <p className="trusted__label">{t('trusted.label')}</p>
      </div>
      <div className="trusted__marquee">
        <div className="trusted__track">
          {logos.map((logo) => (
            <span className="trusted__logo" key={`a-${logo.src}`}>
              <img src={logo.src} alt={logo.alt} />
            </span>
          ))}
          {logos.map((logo) => (
            <span className="trusted__logo" key={`b-${logo.src}`} aria-hidden="true">
              <img src={logo.src} alt="" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
