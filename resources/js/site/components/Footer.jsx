import { Link } from '@inertiajs/react'
import androidBadge from '../assets/images/app_download/android_download.png'
import appleBadge from '../assets/images/app_download/apple_download.png'
import logo from '../assets/images/logo.png'
import { useLanguage } from '../i18n/LanguageContext'

const SOCIAL = [
  { label: 'Facebook', d: 'M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5Z' },
  {
    label: 'Instagram',
    d: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.5-1.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
  },
  {
    label: 'LinkedIn',
    d: 'M4.98 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1c.5-.9 1.8-1.9 3.7-1.9 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4V9Z',
  },
]

export default function Footer() {
  const { t } = useLanguage()
  const links = t('footer.exploreLinks')

  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__logo">
              <img
                src={logo}
                alt={`${t('nav.logoPrimaryLead')} ${t('nav.logoPrimaryEm')}`}
              />
            </div>
            <p className="footer__tag">{t('footer.tag')}</p>
            <div className="footer__social">
              {SOCIAL.map((s) => (
                <a key={s.label} href="#top" aria-label={s.label}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d={s.d} />
                  </svg>
                </a>
              ))}
            </div>

            <h4 className="footer__stores-heading">{t('footer.appHeading')}</h4>
            <div className="footer__stores">
              <a href="#" aria-label="Download on the App Store">
                <img src={appleBadge} alt="Download on the App Store" />
              </a>
              <a href="#" aria-label="Get it on Google Play">
                <img src={androidBadge} alt="Get it on Google Play" />
              </a>
            </div>
          </div>

          <div>
            <h4>{t('footer.contactHeading')}</h4>
            <ul className="footer__list">
              <li>
                <bdi dir="ltr">{t('footer.phone')}</bdi>
              </li>
              <li>{t('footer.email')}</li>
              <li>{t('footer.address')}</li>
            </ul>
          </div>

          <div>
            <h4>{t('footer.exploreHeading')}</h4>
            <ul className="footer__list">
              {links.map((l) => (
                <li key={l.label}>
                  <Link href={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>{t('footer.copyright')}</span>
          <span>{t('footer.address')}</span>
        </div>
      </div>
    </footer>
  )
}
