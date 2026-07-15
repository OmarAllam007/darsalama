import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { useLanguage } from '../i18n/LanguageContext'

export default function SiteSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const { t } = useLanguage()

  const pages = useMemo(
    () => [
      { label: t('nav.home'), href: '/' },
      { label: t('nav.about'), href: '/about' },
      { label: t('nav.doctors'), href: '/doctors' },
      { label: t('nav.services'), href: '/services' },
      { label: t('nav.obgyn'), href: '/obgyn' },
      { label: t('nav.contact'), href: '/contact' },
      { label: t('nav.offers'), href: '/offers' },
    ],
    [t],
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pages
    return pages.filter((p) => p.label.toLowerCase().includes(q))
  }, [pages, query])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => setActive(0), [query])

  function close() {
    setOpen(false)
    setQuery('')
  }

  function go(href) {
    close()
    router.visit(href)
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') return close()
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault()
      go(results[active].href)
    }
  }

  return (
    <>
      <button
        type="button"
        className="nav__search-trigger"
        aria-label={t('nav.search')}
        onClick={() => setOpen(true)}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="search-overlay" role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div className="search-panel">
            <input
              ref={inputRef}
              className="search-input"
              type="text"
              value={query}
              placeholder={t('search.placeholder')}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <ul className="search-results">
              {results.length === 0 && <li className="search-empty">{t('search.noResults')}</li>}
              {results.map((p, i) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className={`search-result${i === active ? ' is-active' : ''}`}
                    onMouseEnter={() => setActive(i)}
                    onClick={close}
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
