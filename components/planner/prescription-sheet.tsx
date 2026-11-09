'use client'

import React, { useState } from 'react'
import type { ExerciseWithWeekContext } from '@/lib/planner-data'
import { Sheet } from '@/components/planner/sheet'
import { SFCloseIcon } from '@/components/planner/sf-icons'

interface PrescriptionSheetProps {
  exercise: ExerciseWithWeekContext
  onSave: (series: number, reps: string, rest: string) => void
  onClose: () => void
}

export function PrescriptionSheet({
  exercise,
  onSave,
  onClose,
}: PrescriptionSheetProps) {
  const [series, setSeries] = useState(String(exercise.series))
  const [reps, setReps] = useState(exercise.reps)
  const [rest, setRest] = useState(exercise.rest)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(
      Number(series) || exercise.series,
      reps.trim() || exercise.reps,
      rest.trim() || exercise.rest
    )
  }

  const labelClass = 'block text-[12px] font-medium text-ink-2 mb-1 px-1'
  const fieldClass =
    'field w-full h-10 rounded-lg px-3 text-[14px] tabular-nums font-medium text-ink'

  return (
    <Sheet
      label="Series, repeticiones y descanso"
      onClose={onClose}
      className="max-w-[360px]"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div>
            <p className="text-[12px] font-medium text-tab-ink">
              Series, repeticiones y descanso
            </p>
            <h3 className="text-[17px] font-semibold text-ink">
              {exercise.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full bg-well hover:bg-well-strong flex items-center justify-center text-ink-2 t-ui cursor-pointer"
          >
            <SFCloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className={labelClass}>Series</label>
            <input
              type="number"
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Reps</label>
            <input
              type="text"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Descanso</label>
            <input
              type="text"
              value={rest}
              onChange={(e) => setRest(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <button
          type="submit"
          className="tint-button w-full h-11 rounded-xl text-[14px] font-medium t-ui active:scale-[0.98] cursor-pointer"
        >
          Guardar
        </button>
      </form>
    </Sheet>
  )
}
