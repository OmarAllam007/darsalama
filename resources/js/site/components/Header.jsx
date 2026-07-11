import { useEffect, useRef, useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import logo from '../assets/images/logo.png'
import { useLanguage } from '../i18n/LanguageContext'
import SiteSearch from './SiteSearch'

function isActivePath(currentPath, linkPath) {
  if (linkPath === '/') return currentPath === '/'
  return currentPath === linkPath || currentPath.startsWith(`${linkPath}/`)
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const contactRef = useRef(null)
  const { t, toggleLang } = useLanguage()
  const currentPath = usePage().url.split('?')[0]

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/doctors', label: t('nav.doctors') },
    { to: '/services', label: t('nav.services') },
  ]

  const contactLinks = [
    { to: '/contact', label: t('nav.getInTouch') },
    { to: '/feedback', label: t('nav.feedback') },
  ]

  const contactActive = contactLinks.some((l) => isActivePath(currentPath, l.to))

  useEffect(() => {
    if (!contactOpen) return
    const onClickOutside = (e) => {
      if (contactRef.current && !contactRef.current.contains(e.target)) setContactOpen(false)
    }
    const onEscape = (e) => {
      if (e.key === 'Escape') setContactOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [contactOpen])

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link className="nav__logo" href="/">
          <img
            className="nav__logo-img"
            src={logo}
            alt={`${t('nav.logoPrimaryLead')} ${t('nav.logoPrimaryEm')}`}
          />
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.to}
              className={isActivePath(currentPath, l.to) ? 'is-active' : undefined}
              aria-current={isActivePath(currentPath, l.to) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}

          <div className={`nav__dropdown${contactOpen ? ' is-open' : ''}`} ref={contactRef}>
            <button
              type="button"
              className={`nav__dropdown-trigger${contactActive ? ' is-active' : ''}`}
              aria-haspopup="true"
              aria-expanded={contactOpen}
              onClick={() => setContactOpen((v) => !v)}
            >
              {t('nav.contact')}
              <svg className="nav__dropdown-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="nav__dropdown-menu" role="menu">
              {contactLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.to}
                  role="menuitem"
                  className={isActivePath(currentPath, l.to) ? 'is-active' : undefined}
                  aria-current={isActivePath(currentPath, l.to) ? 'page' : undefined}
                  onClick={() => setContactOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/offers"
            className={isActivePath(currentPath, '/offers') ? 'is-active' : undefined}
            aria-current={isActivePath(currentPath, '/offers') ? 'page' : undefined}
          >
            {t('nav.offers')}
          </Link>
        </nav>

        <div className="nav__actions">
          <SiteSearch />
          <button type="button" className="nav__lang" onClick={toggleLang}>
            {t('nav.langToggle')}
          </button>
          <Link className="btn btn--ghost-ink" href="/#book">
            {t('nav.book')}
          </Link>
        </div>

        <button
          type="button"
          className="nav__burger"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`nav__mobile${open ? ' is-open' : ''}`}>
        {links.map((l) => (
          <Link
            key={l.label}
            href={l.to}
            className={isActivePath(currentPath, l.to) ? 'is-active' : undefined}
            aria-current={isActivePath(currentPath, l.to) ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </Link>
        ))}

        <span className="nav__mobile-label">{t('nav.contact')}</span>
        {contactLinks.map((l) => (
          <Link
            key={l.label}
            href={l.to}
            className={`nav__mobile-sublink${isActivePath(currentPath, l.to) ? ' is-active' : ''}`}
            aria-current={isActivePath(currentPath, l.to) ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </Link>
        ))}

        <Link
          href="/offers"
          className={isActivePath(currentPath, '/offers') ? 'is-active' : undefined}
          aria-current={isActivePath(currentPath, '/offers') ? 'page' : undefined}
          onClick={() => setOpen(false)}
        >
          {t('nav.offers')}
        </Link>

        <button
          type="button"
          className="nav__lang nav__lang--mobile"
          onClick={() => {
            toggleLang()
            setOpen(false)
          }}
        >
          {t('nav.langToggle')}
        </button>
        <Link className="btn btn--coral text-white" href="/#book" onClick={() => setOpen(false)}>
          {t('nav.book')}
        </Link>
      </div>
    </header>
  )
}
