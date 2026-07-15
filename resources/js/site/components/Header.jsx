import { useState } from 'react'
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
  const { t, lang, setLang, languages } = useLanguage()
  const currentPath = usePage().url.split('?')[0]

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/doctors', label: t('nav.doctors') },
    { to: '/services', label: t('nav.services') },
    { to: '/obgyn', label: t('nav.obgyn') },
  ]

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
          {links.map((l) => {
            const active = isActivePath(currentPath, l.to)
            const isObgyn = l.to === '/obgyn'
            return (
              <Link
                key={l.label}
                href={l.to}
                className={[isObgyn ? 'nav__obgyn' : '', active ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ') || undefined}
                aria-current={active ? 'page' : undefined}
              >
                {l.label}
              </Link>
            )
          })}

          <Link
            href="/contact"
            className={isActivePath(currentPath, '/contact') ? 'is-active' : undefined}
            aria-current={isActivePath(currentPath, '/contact') ? 'page' : undefined}
          >
            {t('nav.contact')}
          </Link>

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
          <select
            className="nav__lang nav__lang-select"
            aria-label={t('nav.chooseLanguage')}
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
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
        {links.map((l) => {
          const active = isActivePath(currentPath, l.to)
          const isObgyn = l.to === '/obgyn'
          return (
            <Link
              key={l.label}
              href={l.to}
              className={[isObgyn ? 'nav__obgyn' : '', active ? 'is-active' : '']
                .filter(Boolean)
                .join(' ') || undefined}
              aria-current={active ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          )
        })}

        <Link
          href="/contact"
          className={isActivePath(currentPath, '/contact') ? 'is-active' : undefined}
          aria-current={isActivePath(currentPath, '/contact') ? 'page' : undefined}
          onClick={() => setOpen(false)}
        >
          {t('nav.contact')}
        </Link>

        <Link
          href="/offers"
          className={isActivePath(currentPath, '/offers') ? 'is-active' : undefined}
          aria-current={isActivePath(currentPath, '/offers') ? 'page' : undefined}
          onClick={() => setOpen(false)}
        >
          {t('nav.offers')}
        </Link>

        <select
          className="nav__lang nav__lang--mobile nav__lang-select"
          aria-label={t('nav.chooseLanguage')}
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
        <Link className="btn btn--coral text-white" href="/#book" onClick={() => setOpen(false)}>
          {t('nav.book')}
        </Link>
      </div>
    </header>
  )
}
