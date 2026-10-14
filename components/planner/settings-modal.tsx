'use client'

import React from 'react'
import { AppSettings } from '@/lib/planner-data'
import {
  SFCloseIcon,
  SFFlameIcon,
  SFSlidersIcon,
  SFTrendUpIcon,
} from '@/components/planner/sf-icons'

interface SettingsModalProps {
  isOpen: boolean
  settings: AppSettings
  onClose: () => void
  onToggleSetting: (key: keyof AppSettings) => void
}

export function SettingsModal({
  isOpen,
  settings,
  onClose,
  onToggleSetting,
}: SettingsModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="apple-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2.5"
      onClick={onClose}
    >
      <div
        className="apple-glass-sheet w-full max-w-[390px] rounded-[24px] p-4 text-[#1C1C1E] space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-1 rounded-full bg-black/15 mx-auto mb-1" />

        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-[10px] bg-black/[0.06] flex items-center justify-center text-[#1C1C1E]">
              <SFSlidersIcon className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-[15px] font-semibold text-[#1C1C1E] leading-tight">
                Visualización
              </h3>
              <p className="text-[11px] text-[#8E8E93]">
                Métricas opcionales por sección
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ajustes"
            className="w-7 h-7 rounded-full bg-black/[0.06] flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] cursor-pointer"
          >
            <SFCloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* iOS Grouped Settings Table */}
        <div className="rounded-[14px] bg-white border border-black/[0.05] divide-y divide-black/[0.06] overflow-hidden">
          {/* Switch 1: Meal Macros (Tangerine Accent) */}
          <button
            type="button"
            role="switch"
            aria-checked={settings.showMealMacros}
            onClick={() => onToggleSetting('showMealMacros')}
            className="w-full text-left p-3 hover:bg-black/[0.015] flex items-center justify-between gap-3 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-2.5">
              <span className="w-7 h-7 rounded-[8px] bg-[#FF9500]/15 text-[#FF7A00] flex items-center justify-center shrink-0 mt-0.5">
                <SFFlameIcon className="w-3.5 h-3.5" />
              </span>
              <div>
                <p className="text-[13px] font-medium text-[#1C1C1E]">
                  Calorías y macronutrientes
                </p>
                <p className="text-[11px] text-[#8E8E93] leading-snug mt-0.5">
                  Muestra kcal y proteínas en la vista semanal de comidas.
                </p>
              </div>
            </div>

            <div
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 shrink-0 ${
                settings.showMealMacros ? 'bg-[#FF7A00]' : 'bg-black/12'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                  settings.showMealMacros ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          {/* Switch 2: Gym Progression (Fitness Mint Accent) */}
          <button
            type="button"
            role="switch"
            aria-checked={settings.showGymProgression}
            onClick={() => onToggleSetting('showGymProgression')}
            className="w-full text-left p-3 hover:bg-black/[0.015] flex items-center justify-between gap-3 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-2.5">
              <span className="w-7 h-7 rounded-[8px] bg-[#34C759]/15 text-[#1F9E40] flex items-center justify-center shrink-0 mt-0.5">
                <SFTrendUpIcon className="w-3.5 h-3.5" />
              </span>
              <div>
                <p className="text-[13px] font-medium text-[#1C1C1E]">
                  Detalle de sobrecarga
                </p>
                <p className="text-[11px] text-[#8E8E93] leading-snug mt-0.5">
                  Muestra grupo muscular y diferencia en kg frente a la semana previa.
                </p>
              </div>
            </div>

            <div
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 shrink-0 ${
                settings.showGymProgression ? 'bg-[#30B050]' : 'bg-black/12'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                  settings.showGymProgression ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
