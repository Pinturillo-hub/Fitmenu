'use client'

import React from 'react'
import type { AppSettings } from '@/lib/planner-data'
import { Sheet } from '@/components/planner/sheet'
import { InstallApp } from '@/components/planner/install-app'
import {
  SFCloseIcon,
  SFFlameIcon,
  SFSlidersIcon,
  SFTrendUpIcon,
} from '@/components/planner/sf-icons'

interface SettingsModalProps {
  settings: AppSettings
  onClose: () => void
  onToggleSetting: (key: keyof AppSettings) => void
}

function Switch({ on, trackClass }: { on: boolean; trackClass: string }) {
  return (
    <div
      className={`w-12 h-7 rounded-full p-0.5 shrink-0 t-ui ${
        on ? trackClass : 'bg-ink/15'
      }`}
    >
      <div
        className={`w-6 h-6 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] t-move ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </div>
  )
}

export function SettingsModal({
  settings,
  onClose,
  onToggleSetting,
}: SettingsModalProps) {
  return (
    <Sheet
      label="Ajustes de visualización"
      onClose={onClose}
      className="max-w-[390px] space-y-3"
    >
      <div className="flex items-center justify-between pb-3 border-b border-hairline">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-well flex items-center justify-center text-ink">
            <SFSlidersIcon className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-[17px] font-semibold text-ink leading-tight">
              Visualización
            </h3>
            <p className="text-[12px] text-ink-3">
              Métricas opcionales por sección
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ajustes"
          className="w-8 h-8 rounded-full bg-well hover:bg-well-strong flex items-center justify-center text-ink-2 t-ui cursor-pointer"
        >
          <SFCloseIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="rounded-[20px] bg-surface divide-y divide-hairline overflow-hidden">
        <button
          type="button"
          role="switch"
          aria-checked={settings.showMealMacros}
          onClick={() => onToggleSetting('showMealMacros')}
          className="w-full text-left p-3 hover:bg-well flex items-center justify-between gap-3 t-ui cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-lg bg-meals-ink text-white flex items-center justify-center shrink-0">
              <SFFlameIcon className="w-4 h-4" />
            </span>
            <div>
              <p className="text-[14px] font-medium text-ink">
                Calorías y macronutrientes
              </p>
              <p className="text-[12px] text-ink-3 leading-snug mt-1">
                Muestra kcal y proteínas en la vista semanal de comidas
              </p>
            </div>
          </div>
          <Switch on={settings.showMealMacros} trackClass="bg-meals" />
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={settings.showGymProgression}
          onClick={() => onToggleSetting('showGymProgression')}
          className="w-full text-left p-3 hover:bg-well flex items-center justify-between gap-3 t-ui cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-lg bg-gym-ink text-white flex items-center justify-center shrink-0">
              <SFTrendUpIcon className="w-4 h-4" />
            </span>
            <div>
              <p className="text-[14px] font-medium text-ink">
                Detalle de sobrecarga
              </p>
              <p className="text-[12px] text-ink-3 leading-snug mt-1">
                Muestra grupo muscular y diferencia en kg frente a la semana
                previa
              </p>
            </div>
          </div>
          <Switch on={settings.showGymProgression} trackClass="bg-gym" />
        </button>
      </div>

      <InstallApp />
    </Sheet>
  )
}
