import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'

export default function ScrollToHash() {
  const { url } = usePage()

  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [url])

  return null
}
