'use client'

import React from 'react'
import type { ExerciseWithWeekContext } from '@/lib/planner-data'
import {
  formatProgression,
  getProgression,
  isWeightLogged,
} from '@/lib/planner-logic'
import {
  SFTimerIcon,
  SFTrendUpIcon,
} from '@/components/planner/sf-icons'

interface GymTabProps {
  exercises: ExerciseWithWeekContext[]
  weekAnimClass: string
  showProgression: boolean
  onUpdateLog: (
    id: string,
    field: 'weight' | 'notes',
    value: string
  ) => void
  onOpenPrescription: (id: string) => void
}

export function GymTab({
  exercises,
  weekAnimClass,
  showProgression,
  onUpdateLog,
  onOpenPrescription,
}: GymTabProps) {
  const completedCount = exercises.filter((e) =>
    isWeightLogged(e.currentWeight)
  ).length

  return (
    <div className={`flex flex-col gap-2 ${weekAnimClass}`}>
      <div className="flex items-center justify-between px-2">
        <h2 className="text-[12px] font-medium text-ink-2">Rutina y cargas</h2>
        <span className="text-[12px] tabular-nums text-ink-3">
          {completedCount} de {exercises.length} registrados
        </span>
      </div>

      <div className="surface-card rounded-[20px] overflow-hidden divide-y divide-hairline">
        {exercises.map((ex, index) => {
          const progression = getProgression(ex.prevWeight, ex.currentWeight)
          const hasLoggedWeight = isWeightLogged(ex.currentWeight)

          return (
            <div key={ex.id} className="p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-full text-[12px] tabular-nums font-medium flex items-center justify-center shrink-0 t-ui ${
                      hasLoggedWeight
                        ? 'bg-tab-ink text-white'
                        : 'bg-tab/[0.14] text-tab-ink'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <h3 className="text-[15px] font-medium text-ink truncate">
                    {ex.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenPrescription(ex.id)}
                  title="Editar series, repeticiones y descanso"
                  className="inline-flex items-center gap-2 h-8 px-3 rounded-lg bg-well hover:bg-well-strong text-[12px] tabular-nums text-ink-2 t-ui active:scale-[0.97] shrink-0 cursor-pointer"
                >
                  <span className="font-medium text-ink">
                    {ex.series} × {ex.reps}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <SFTimerIcon className="w-4 h-4 text-ink-3" />
                    {ex.rest}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-[96px_1fr] gap-2">
                <div>
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-[12px] font-medium text-ink-2">
                      Peso
                    </span>
                    {!hasLoggedWeight && (
                      <span className="text-[11px] text-ink-3">anterior</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={ex.currentWeight}
                    onChange={(e) =>
                      onUpdateLog(ex.id, 'weight', e.target.value)
                    }
                    placeholder={ex.prevWeight}
                    aria-label={`Peso para ${ex.name}`}
                    className={`field w-full h-10 rounded-lg px-3 text-[14px] tabular-nums font-medium placeholder:font-normal placeholder:text-ink-3 ${
                      hasLoggedWeight ? 'text-tab-ink' : 'text-ink'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-[12px] font-medium text-ink-2">
                      Notas
                    </span>
                    {!ex.currentNotes && (
                      <span className="text-[11px] text-ink-3">anterior</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={ex.currentNotes}
                    onChange={(e) =>
                      onUpdateLog(ex.id, 'notes', e.target.value)
                    }
                    placeholder={ex.prevNotes}
                    aria-label={`Anotaciones para ${ex.name}`}
                    className="field w-full h-10 rounded-lg px-3 text-[14px] text-ink placeholder:text-ink-3"
                  />
                </div>
              </div>

              {showProgression && (
                <div className="pt-3 flex items-center justify-between gap-2 text-[12px] tabular-nums text-ink-3 border-t border-hairline">
                  <span className="truncate">
                    {ex.muscle} · Anterior {ex.prevWeight}
                  </span>

                  {progression.kind !== 'unknown' && (
                    <span
                      className={`inline-flex items-center gap-1 font-medium shrink-0 ${
                        progression.kind === 'up'
                          ? 'text-tab-ink'
                          : 'text-ink-2'
                      }`}
                    >
                      {progression.kind === 'up' && (
                        <SFTrendUpIcon className="w-4 h-4" />
                      )}
                      {formatProgression(progression)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
