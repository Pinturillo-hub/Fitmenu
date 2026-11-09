'use client'

import React, { useEffect, useState } from 'react'
import { SFPhoneIcon } from '@/components/planner/sf-icons'

type InstallMode = 'checking' | 'installed' | 'firefox' | 'ios' | 'manual'

function readInstallMode(): InstallMode {
  const standalone =
    (window.matchMedia
      ? window.matchMedia('(display-mode: standalone)').matches
      : false) ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  if (standalone) return 'installed'

  const ua = navigator.userAgent
  if (/Android/i.test(ua) && /Firefox|FxiOS/i.test(ua)) return 'firefox'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  return 'manual'
}

const HINTS: Record<Exclude<InstallMode, 'checking' | 'installed'>, string> = {
  firefox:
    'Abre el menú ⋮ de Firefox y elige «Instalar» (o «Añadir app a la pantalla de inicio»). Si solo aparece «Añadir a pantalla de inicio», actualiza Firefox: esa opción crea un marcador.',
  ios: 'Toca Compartir y luego «Añadir a pantalla de inicio».',
  manual:
    'Abre el menú del navegador y elige «Instalar aplicación» o «Añadir a pantalla de inicio».',
}

/**
 * Explains how to install the site, using the wording of the current browser.
 * Hidden once the page is already running as an installed app.
 */
export function InstallApp() {
  const [mode, setMode] = useState<InstallMode>('checking')

  useEffect(() => {
    setMode(readInstallMode())
    const media = window.matchMedia('(display-mode: standalone)')
    const onChange = () => setMode(readInstallMode())
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  if (mode === 'checking' || mode === 'installed') return null

  return (
    <div className="rounded-[20px] bg-surface p-3 space-y-2">
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-tab-ink text-white flex items-center justify-center shrink-0">
          <SFPhoneIcon className="w-4 h-4" />
        </span>
        <div>
          <p className="text-[14px] font-medium text-ink">Usar como app</p>
          <p className="text-[12px] text-ink-3 leading-snug mt-0.5">
            Se abre a pantalla completa, con su propio icono.
          </p>
        </div>
      </div>
      <p className="text-[12px] text-ink-2 leading-snug px-1">
        {HINTS[mode]}
      </p>
    </div>
  )
}
