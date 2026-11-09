'use client'

import React, { useState } from 'react'
import type { ExerciseBase, ExerciseWithWeekContext } from '@/lib/planner-data'
import { Sheet } from '@/components/planner/sheet'
import {
  SFBarbellIcon,
  SFCloseIcon,
  SFPlusIcon,
  SFTrashIcon,
} from '@/components/planner/sf-icons'

interface ExerciseCatalogSheetProps {
  exercises: ExerciseWithWeekContext[]
  onAddExercise: (exercise: Omit<ExerciseBase, 'id'>) => void
  onDeleteExercise: (id: string) => void
  onClose: () => void
}

export function ExerciseCatalogSheet({
  exercises,
  onAddExercise,
  onDeleteExercise,
  onClose,
}: ExerciseCatalogSheetProps) {
  const [name, setName] = useState('')
  const [muscle, setMuscle] = useState('')
  const [series, setSeries] = useState('4')
  const [reps, setReps] = useState('8-10')
  const [rest, setRest] = useState('2:00')
  const [baselineWeight, setBaselineWeight] = useState('')
  const [baselineNotes, setBaselineNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAddExercise({
      name: name.trim(),
      muscle: muscle.trim() || 'General',
      series: Number(series) || 3,
      reps: reps.trim() || '8-10',
      rest: rest.trim() || '2:00',
      baselineWeight: baselineWeight.trim() || '—',
      baselineNotes: baselineNotes.trim() || 'Sin nota previa',
    })
    setName('')
    setMuscle('')
    setBaselineWeight('')
    setBaselineNotes('')
  }

  const labelClass = 'block text-[12px] font-medium text-ink-2 mb-1 px-1'
  const smallField =
    'field w-full h-10 rounded-lg px-3 text-[13px] tabular-nums text-ink placeholder:text-ink-3'

  return (
    <Sheet
      label="Catálogo de ejercicios"
      onClose={onClose}
      className="max-w-[400px] max-h-[85vh] flex flex-col"
    >
      <div className="flex items-center justify-between pb-3 border-b border-hairline">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-tab-ink text-white flex items-center justify-center">
            <SFBarbellIcon className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-[17px] font-semibold text-ink leading-tight">
              Catálogo de ejercicios
            </h3>
            <p className="text-[12px] text-ink-3">
              Series, repeticiones y descansos
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar catálogo de ejercicios"
          className="w-8 h-8 rounded-full bg-well hover:bg-well-strong flex items-center justify-center text-ink-2 t-ui cursor-pointer"
        >
          <SFCloseIcon className="w-4 h-4" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 p-3 rounded-[20px] bg-surface space-y-2"
      >
        <div className="grid grid-cols-[1fr_96px] gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ejercicio"
            aria-label="Nombre del ejercicio"
            className="field h-10 rounded-lg px-3 text-[13px] text-ink placeholder:text-ink-3"
          />
          <input
            type="text"
            value={muscle}
            onChange={(e) => setMuscle(e.target.value)}
            placeholder="Músculo"
            aria-label="Músculo"
            className="field h-10 rounded-lg px-3 text-[13px] text-ink placeholder:text-ink-3"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className={labelClass}>Series</label>
            <input
              type="number"
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              className={smallField}
            />
          </div>
          <div>
            <label className={labelClass}>Reps</label>
            <input
              type="text"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="8-10"
              className={smallField}
            />
          </div>
          <div>
            <label className={labelClass}>Descanso</label>
            <input
              type="text"
              value={rest}
              onChange={(e) => setRest(e.target.value)}
              placeholder="2:00"
              className={smallField}
            />
          </div>
        </div>

        <div className="grid grid-cols-[104px_1fr] gap-2">
          <input
            type="text"
            value={baselineWeight}
            onChange={(e) => setBaselineWeight(e.target.value)}
            placeholder="Peso base"
            aria-label="Peso base"
            className={smallField}
          />
          <input
            type="text"
            value={baselineNotes}
            onChange={(e) => setBaselineNotes(e.target.value)}
            placeholder="Nota de referencia"
            aria-label="Nota de referencia"
            className="field h-10 rounded-lg px-3 text-[13px] text-ink placeholder:text-ink-3"
          />
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="tint-button w-full h-10 rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 disabled:opacity-40 t-ui active:scale-[0.98] cursor-pointer"
        >
          <SFPlusIcon className="w-4 h-4" />
          Añadir a la rutina
        </button>
      </form>

      <div className="overflow-y-auto no-scrollbar mt-3 space-y-2 flex-1">
        {exercises.map((ex) => (
          <div
            key={ex.id}
            className="flex items-center justify-between gap-2 px-3 py-3 rounded-xl bg-surface"
          >
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-ink truncate">
                {ex.name}
              </p>
              <p className="text-[12px] tabular-nums text-ink-3 mt-1 truncate">
                {ex.series} × {ex.reps} · {ex.rest} · Anterior {ex.prevWeight}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDeleteExercise(ex.id)}
              aria-label={`Eliminar ${ex.name}`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-3 hover:text-danger hover:bg-well t-ui shrink-0 cursor-pointer"
            >
              <SFTrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </Sheet>
  )
}
