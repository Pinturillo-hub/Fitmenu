'use client'

import React, { useState } from 'react'
import { ExerciseBase, ExerciseWithWeekContext } from '@/lib/planner-data'
import {
  SFBarbellIcon,
  SFCloseIcon,
  SFPlusIcon,
  SFTimerIcon,
  SFTrashIcon,
  SFTrendUpIcon,
} from '@/components/planner/sf-icons'

interface GymTabProps {
  exercises: ExerciseWithWeekContext[]
  weekAnimClass: string
  showProgression: boolean
  isDbOpen: boolean
  onCloseDb: () => void
  onUpdateLog: (
    id: string,
    field: 'weight' | 'notes',
    value: string
  ) => void
  onUpdatePrescription: (
    id: string,
    series: number,
    reps: string,
    rest: string
  ) => void
  onAddExercise: (exercise: Omit<ExerciseBase, 'id'>) => void
  onDeleteExercise: (id: string) => void
}

function parseNumericKg(val: string): number | null {
  if (!val) return null
  const match = val.replace(',', '.').match(/(\d+(\.\d+)?)/)
  return match ? parseFloat(match[1]) : null
}

export function GymTab({
  exercises,
  weekAnimClass,
  showProgression,
  isDbOpen,
  onCloseDb,
  onUpdateLog,
  onUpdatePrescription,
  onAddExercise,
  onDeleteExercise,
}: GymTabProps) {
  const [editingEx, setEditingEx] = useState<ExerciseWithWeekContext | null>(
    null
  )
  const [editSeries, setEditSeries] = useState('')
  const [editReps, setEditReps] = useState('')
  const [editRest, setEditRest] = useState('')

  // New exercise form state in DB
  const [name, setName] = useState('')
  const [muscle, setMuscle] = useState('')
  const [series, setSeries] = useState('4')
  const [reps, setReps] = useState('8-10')
  const [rest, setRest] = useState('2:00')
  const [baselineWeight, setBaselineWeight] = useState('')
  const [baselineNotes, setBaselineNotes] = useState('')

  const handleCreateExercise = (e: React.FormEvent) => {
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

  const openQuickEdit = (ex: ExerciseWithWeekContext) => {
    setEditingEx(ex)
    setEditSeries(String(ex.series))
    setEditReps(ex.reps)
    setEditRest(ex.rest)
  }

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEx) return
    onUpdatePrescription(
      editingEx.id,
      Number(editSeries) || editingEx.series,
      editReps.trim() || editingEx.reps,
      editRest.trim() || editingEx.rest
    )
    setEditingEx(null)
  }

  const completedCount = exercises.filter(
    (e) => e.currentWeight.trim().length > 0
  ).length

  return (
    <div className={`flex flex-col gap-1.5 ${weekAnimClass}`}>
      {/* Apple Fitness Emerald Section Header */}
      <div className="flex items-center justify-between px-1 pb-0.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#1F9E40]">
          Rutina y cargas
        </span>
        <span className="text-[9.5px] tabular-nums font-semibold text-[#1F9E40] bg-[#34C759]/14 px-2 py-0.5 rounded-full">
          {completedCount}/{exercises.length} listos
        </span>
      </div>

      {/* Main Exercise List — Native iOS Grouped Card with Apple Fitness Mint Accents */}
      <div className="apple-card rounded-[18px] overflow-hidden divide-y divide-black/[0.06]">
        {exercises.map((ex, index) => {
          const prevKg = parseNumericKg(ex.prevWeight)
          const currKg = parseNumericKg(ex.currentWeight)
          const diffKg =
            prevKg !== null && currKg !== null ? currKg - prevKg : null

          const hasLoggedWeight = ex.currentWeight.trim().length > 0

          return (
            <div
              key={ex.id}
              className={`p-3 transition-colors space-y-2 ${
                hasLoggedWeight ? 'bg-[#34C759]/[0.03]' : 'hover:bg-black/[0.01]'
              }`}
            >
              {/* Row 1: Exercise Name + Tappable Emerald Prescription Pill */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-full text-[10.5px] tabular-nums font-bold flex items-center justify-center shrink-0 transition-all ${
                      hasLoggedWeight
                        ? 'bg-gradient-to-b from-[#34C759] to-[#28A745] text-white shadow-xs shadow-[#34C759]/30'
                        : 'bg-[#34C759]/12 text-[#1F9E40]'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <h3 className="text-[13.5px] font-semibold text-[#1C1C1E] truncate tracking-[-0.015em]">
                    {ex.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => openQuickEdit(ex)}
                  title="Editar series, repeticiones y descanso"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#34C759]/[0.1] hover:bg-[#34C759]/[0.16] border border-[#34C759]/20 text-[11px] tabular-nums font-medium text-[#1F9E40] active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <span className="font-semibold text-[#157A2E]">
                    {ex.series} × {ex.reps}
                  </span>
                  <span className="text-[#34C759]/60">·</span>
                  <span className="inline-flex items-center gap-0.5 text-[#1F9E40]">
                    <SFTimerIcon className="w-2.5 h-2.5 text-[#30B050]" />
                    {ex.rest}
                  </span>
                </button>
              </div>

              {/* Row 2: Weight Field + Notes Field (Ghost previous week when empty) */}
              <div className="grid grid-cols-[92px_1fr] gap-1.5">
                {/* Weight Input */}
                <div>
                  <div className="flex items-center justify-between px-1 mb-0.5">
                    <span className="text-[9.5px] font-semibold text-[#1F9E40]">
                      Peso
                    </span>
                    {!hasLoggedWeight && (
                      <span className="text-[9px] tabular-nums text-[#AEAEB2]">
                        ant.
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={ex.currentWeight}
                    onChange={(e) =>
                      onUpdateLog(ex.id, 'weight', e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.nativeEvent.isComposing || e.keyCode === 229) return
                    }}
                    placeholder={ex.prevWeight}
                    aria-label={`Peso para ${ex.name}`}
                    className={`apple-glass-input apple-glass-input-gym w-full rounded-[10px] px-2.5 py-1.5 text-[12.5px] tabular-nums font-semibold text-[#1C1C1E] placeholder:text-[#AEAEB2] placeholder:font-normal focus:outline-none ${
                      hasLoggedWeight
                        ? 'bg-[#34C759]/[0.09] border-[#34C759]/25'
                        : ''
                    }`}
                  />
                </div>

                {/* Notes Input */}
                <div>
                  <div className="flex items-center justify-between px-1 mb-0.5">
                    <span className="text-[9.5px] font-medium text-[#8E8E93]">
                      Notas
                    </span>
                    {!ex.currentNotes && (
                      <span className="text-[9px] tabular-nums text-[#AEAEB2]">
                        ant.
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={ex.currentNotes}
                    onChange={(e) =>
                      onUpdateLog(ex.id, 'notes', e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.nativeEvent.isComposing || e.keyCode === 229) return
                    }}
                    placeholder={ex.prevNotes}
                    aria-label={`Anotaciones para ${ex.name}`}
                    className="apple-glass-input apple-glass-input-gym w-full rounded-[10px] px-2.5 py-1.5 text-[12.5px] text-[#1C1C1E] placeholder:text-[#AEAEB2] focus:outline-none"
                  />
                </div>
              </div>

              {/* Optional Progression Row (Enabled via Settings) */}
              {showProgression && (
                <div className="pt-1 flex items-center justify-between text-[10.5px] tabular-nums text-[#8E8E93] border-t border-black/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded-[6px] bg-[#34C759]/12 text-[#1F9E40] font-semibold text-[10px]">
                      {ex.muscle}
                    </span>
                    <span>Anterior: {ex.prevWeight}</span>
                  </div>

                  {diffKg !== null ? (
                    <span
                      className={`inline-flex items-center gap-0.5 font-semibold ${
                        diffKg > 0
                          ? 'text-[#28A745]'
                          : diffKg < 0
                          ? 'text-[#FF9500]'
                          : 'text-[#8E8E93]'
                      }`}
                    >
                      <SFTrendUpIcon className="w-3 h-3" />
                      {diffKg > 0 ? `+${diffKg} kg` : `${diffKg} kg`}
                    </span>
                  ) : (
                    <span className="text-[#AEAEB2]">
                      Ref: {ex.prevWeight}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sheet 1: Quick Edit Series / Reps / Rest */}
      {editingEx && (
        <div
          className="apple-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2.5"
          onClick={() => setEditingEx(null)}
        >
          <form
            onSubmit={handleSavePrescription}
            className="apple-glass-sheet w-full max-w-[360px] rounded-[24px] p-4 text-[#1C1C1E] space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-9 h-1 rounded-full bg-black/15 mx-auto mb-1" />

            <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.06]">
              <div>
                <p className="text-[11px] font-semibold text-[#1F9E40]">
                  Prescripción
                </p>
                <h3 className="text-[15px] font-semibold text-[#1C1C1E]">
                  {editingEx.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingEx(null)}
                className="w-7 h-7 rounded-full bg-black/[0.06] flex items-center justify-center text-[#8E8E93] cursor-pointer"
              >
                <SFCloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-[#8E8E93] mb-1 pl-1">
                  Series
                </label>
                <input
                  type="number"
                  value={editSeries}
                  onChange={(e) => setEditSeries(e.target.value)}
                  className="apple-glass-input apple-glass-input-gym w-full rounded-[10px] px-2.5 py-2 text-[13px] tabular-nums font-semibold text-[#1C1C1E] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#8E8E93] mb-1 pl-1">
                  Reps
                </label>
                <input
                  type="text"
                  value={editReps}
                  onChange={(e) => setEditReps(e.target.value)}
                  className="apple-glass-input apple-glass-input-gym w-full rounded-[10px] px-2.5 py-2 text-[13px] tabular-nums font-semibold text-[#1C1C1E] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#8E8E93] mb-1 pl-1">
                  Descanso
                </label>
                <input
                  type="text"
                  value={editRest}
                  onChange={(e) => setEditRest(e.target.value)}
                  className="apple-glass-input apple-glass-input-gym w-full rounded-[10px] px-2.5 py-2 text-[13px] tabular-nums font-semibold text-[#1C1C1E] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-[12px] bg-[#30B050] text-white text-[13px] font-semibold active:scale-[0.99] transition-all cursor-pointer"
            >
              Guardar
            </button>
          </form>
        </div>
      )}

      {/* Sheet 2: Full Exercise Database */}
      {isDbOpen && (
        <div
          className="apple-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2.5"
          onClick={onCloseDb}
        >
          <div
            className="apple-glass-sheet w-full max-w-[400px] rounded-[24px] p-4 text-[#1C1C1E] max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-9 h-1 rounded-full bg-black/15 mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-[10px] bg-[#34C759]/15 flex items-center justify-center text-[#1F9E40]">
                  <SFBarbellIcon className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#1C1C1E] leading-tight">
                    Catálogo de Ejercicios
                  </h3>
                  <p className="text-[11px] text-[#8E8E93]">
                    Series, repeticiones y descansos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseDb}
                aria-label="Cerrar catálogo de ejercicios"
                className="w-7 h-7 rounded-full bg-black/[0.06] flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] cursor-pointer"
              >
                <SFCloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add new exercise form */}
            <form
              onSubmit={handleCreateExercise}
              className="mt-3 p-3 rounded-[14px] bg-white border border-black/[0.06] space-y-2"
            >
              <div className="grid grid-cols-[1fr_92px] gap-1.5">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.nativeEvent.isComposing || e.keyCode === 229) return
                  }}
                  placeholder="Ejercicio (ej. Fondos)..."
                  className="apple-glass-input apple-glass-input-gym rounded-[10px] px-3 py-2 text-[12px] text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none"
                />
                <input
                  type="text"
                  value={muscle}
                  onChange={(e) => setMuscle(e.target.value)}
                  placeholder="Músculo"
                  className="apple-glass-input apple-glass-input-gym rounded-[10px] px-2.5 py-2 text-[12px] text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="block text-[10px] font-medium text-[#8E8E93] mb-0.5 pl-1">
                    Series
                  </label>
                  <input
                    type="number"
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    className="apple-glass-input apple-glass-input-gym w-full rounded-[8px] px-2.5 py-1.5 text-[12px] tabular-nums text-[#1C1C1E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-[#8E8E93] mb-0.5 pl-1">
                    Reps
                  </label>
                  <input
                    type="text"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder="8-10"
                    className="apple-glass-input apple-glass-input-gym w-full rounded-[8px] px-2.5 py-1.5 text-[12px] tabular-nums text-[#1C1C1E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-[#8E8E93] mb-0.5 pl-1">
                    Descanso
                  </label>
                  <input
                    type="text"
                    value={rest}
                    onChange={(e) => setRest(e.target.value)}
                    placeholder="2:00"
                    className="apple-glass-input apple-glass-input-gym w-full rounded-[8px] px-2.5 py-1.5 text-[12px] tabular-nums text-[#1C1C1E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-1.5">
                <input
                  type="text"
                  value={baselineWeight}
                  onChange={(e) => setBaselineWeight(e.target.value)}
                  placeholder="Peso base (80kg)"
                  className="apple-glass-input apple-glass-input-gym rounded-[8px] px-2.5 py-1.5 text-[12px] tabular-nums text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none"
                />
                <input
                  type="text"
                  value={baselineNotes}
                  onChange={(e) => setBaselineNotes(e.target.value)}
                  placeholder="Nota referencia..."
                  className="apple-glass-input apple-glass-input-gym rounded-[8px] px-2.5 py-1.5 text-[12px] text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-[10px] bg-[#30B050] text-white font-medium text-[12px] flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all cursor-pointer"
              >
                <SFPlusIcon className="w-3.5 h-3.5" />
                Añadir a la rutina
              </button>
            </form>

            {/* Exercise list in DB */}
            <div className="overflow-y-auto no-scrollbar mt-2.5 space-y-1 flex-1 pr-0.5">
              {exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-[12px] bg-white border border-black/[0.05]"
                >
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium text-[#1C1C1E] truncate">
                      {ex.name}
                    </p>
                    <p className="text-[10.5px] tabular-nums text-[#8E8E93] mt-0.5">
                      {ex.series} × {ex.reps} · {ex.rest} · Ant: {ex.prevWeight}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteExercise(ex.id)}
                    aria-label={`Eliminar ${ex.name}`}
                    className="p-1.5 rounded-[8px] text-[#AEAEB2] hover:text-[#FF3B30] transition-colors shrink-0 cursor-pointer"
                  >
                    <SFTrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
