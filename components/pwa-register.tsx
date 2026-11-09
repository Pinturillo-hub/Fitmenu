'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker that makes the exported site work offline and
 * launch like an app. The scope matches the GitHub Pages base path.
 */
export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const register = () => {
      navigator.serviceWorker
        .register('/Fitmenu/sw.js', { scope: '/Fitmenu/' })
        .catch(() => undefined)
    }

    if (document.readyState === 'complete') {
      register()
      return
    }

    window.addEventListener('load', register, { once: true })
    return () => window.removeEventListener('load', register)
  }, [])

  return null
}
