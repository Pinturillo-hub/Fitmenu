'use client'

import React, { useState } from 'react'
import { DAYS, DayKey, DishItem, WeeklyMeals } from '@/lib/planner-data'
import {
  SFCheckIcon,
  SFCloseIcon,
  SFCopyWeekIcon,
  SFMoonIcon,
  SFPlateIcon,
  SFPlusIcon,
  SFStackIcon,
  SFSunIcon,
  SFTrashIcon,
} from '@/components/planner/sf-icons'

interface MealsTabProps {
  dishes: DishItem[]
  weeklyMeals: WeeklyMeals
  dayDates: Record<DayKey, number>
  isCurrentWeek: boolean
  weekAnimClass: string
  showMacros: boolean
  isDbOpen: boolean
  onCloseDb: () => void
  onOpenDb: () => void
  onAssignDish: (
    day: DayKey,
    slot: 'comida' | 'cena',
    dishId: string | null
  ) => void
  onAddDish: (dish: Omit<DishItem, 'id'>) => DishItem
  onDeleteDish: (id: string) => void
  onCopyPreviousWeekMeals?: () => void
  hasPreviousWeekMeals?: boolean
}

export function MealsTab({
  dishes,
  weeklyMeals,
  dayDates,
  isCurrentWeek,
  weekAnimClass,
  showMacros,
  isDbOpen,
  onCloseDb,
  onOpenDb,
  onAssignDish,
  onAddDish,
  onDeleteDish,
  onCopyPreviousWeekMeals,
  hasPreviousWeekMeals,
}: MealsTabProps) {
  const [selectingSlot, setSelectingSlot] = useState<{
    day: DayKey
    slot: 'comida' | 'cena'
  } | null>(null)

  const [quickDishName, setQuickDishName] = useState('')
  const [dbFilter, setDbFilter] = useState<'todas' | 'comida' | 'cena'>('todas')

  // Database form state
  const [newName, setNewName] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newCat, setNewCat] = useState<'comida' | 'cena' | 'ambas'>('ambas')
  const [newKcal, setNewKcal] = useState('')
  const [newProt, setNewProt] = useState('')
  const [newCarbs, setNewCarbs] = useState('')
  const [newFats, setNewFats] = useState('')

  const getDish = (id: string | null) => dishes.find((d) => d.id === id) || null

  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    onAddDish({
      name: newName.trim(),
      category: newCat,
      tag: newTag.trim() || undefined,
      kcal: newKcal ? Number(newKcal) : undefined,
      protein: newProt ? Number(newProt) : undefined,
      carbs: newCarbs ? Number(newCarbs) : undefined,
      fats: newFats ? Number(newFats) : undefined,
    })
    setNewName('')
    setNewTag('')
    setNewKcal('')
    setNewProt('')
    setNewCarbs('')
    setNewFats('')
  }

  const handleQuickCreateAndAssign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectingSlot || !quickDishName.trim()) return
    const created = onAddDish({
      name: quickDishName.trim(),
      category: selectingSlot.slot,
    })
    onAssignDish(selectingSlot.day, selectingSlot.slot, created.id)
    setQuickDishName('')
    setSelectingSlot(null)
  }

  const filteredDishesForSlot = selectingSlot
    ? dishes.filter(
        (d) => d.category === 'ambas' || d.category === selectingSlot.slot
      )
    : dishes

  const filteredDishesInDb = dishes.filter((d) => {
    if (dbFilter === 'todas') return true
    return d.category === 'ambas' || d.category === dbFilter
  })

  // Count how many slots are planned out of 14
  const plannedCount = DAYS.reduce((acc, d) => {
    const plan = weeklyMeals[d.key]
    return acc + (plan?.comida ? 1 : 0) + (plan?.cena ? 1 : 0)
  }, 0)

  return (
    <div className={`flex flex-col gap-1.5 ${weekAnimClass}`}>
      {/* Colored Apple Health Column Header Strip */}
      <div className="flex items-center justify-between px-1 pb-0.5">
        <div className="grid grid-cols-[38px_1fr_1fr] w-full items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#8E8E93] text-center">
            Día
          </span>

          {/* Comida Header with Warm Sun */}
          <div className="flex items-center gap-1 pl-1.5">
            <SFSunIcon className="w-3 h-3 text-[#FF8000]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#D96500]">
              Comida
            </span>
          </div>

          {/* Cena Header with Indigo Moon + Progress */}
          <div className="flex items-center justify-between pl-1.5 pr-0.5">
            <div className="flex items-center gap-1">
              <SFMoonIcon className="w-2.5 h-2.5 text-[#5856D6]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-[#5856D6]">
                Cena
              </span>
            </div>

            {plannedCount < 6 &&
            hasPreviousWeekMeals &&
            onCopyPreviousWeekMeals ? (
              <button
                type="button"
                onClick={onCopyPreviousWeekMeals}
                className="text-[10px] font-semibold text-[#FF7A00] hover:opacity-80 flex items-center gap-1 transition-opacity active:scale-95 cursor-pointer"
              >
                <SFCopyWeekIcon className="w-2.5 h-2.5" />
                <span>Duplicar</span>
              </button>
            ) : (
              <span className="text-[9.5px] tabular-nums font-semibold text-[#D96500] bg-[#FF9500]/12 px-1.5 py-0.2 rounded-full">
                {plannedCount}/14
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 7 Native iOS Grouped Day Rows with Warm Lunch & Indigo Dinner Tints */}
      <div className="apple-card rounded-[18px] overflow-hidden divide-y divide-black/[0.055]">
        {DAYS.map((day, idx) => {
          const dayPlan = weeklyMeals[day.key]
          const comidaDish = getDish(dayPlan?.comida)
          const cenaDish = getDish(dayPlan?.cena)

          const totalKcal = (comidaDish?.kcal || 0) + (cenaDish?.kcal || 0)
          const totalProt =
            (comidaDish?.protein || 0) + (cenaDish?.protein || 0)
          const totalCarbs =
            (comidaDish?.carbs || 0) + (cenaDish?.carbs || 0)
          const totalFats = (comidaDish?.fats || 0) + (cenaDish?.fats || 0)

          // Highlight Wednesday (14 Oct) as "Hoy" when viewing current week
          const isToday = isCurrentWeek && idx === 2

          return (
            <div
              key={day.key}
              className={`p-1.5 transition-colors ${
                isToday ? 'bg-[#FF9500]/[0.04]' : ''
              }`}
            >
              <div className="grid grid-cols-[38px_1fr_1fr] items-stretch gap-1.5">
                {/* Apple Calendar Day Column */}
                <div className="flex flex-col items-center justify-center py-0.5 select-none">
                  <span
                    className={`text-[8.5px] font-bold tracking-[0.04em] uppercase leading-none ${
                      isToday ? 'text-[#FF7A00]' : 'text-[#8E8E93]'
                    }`}
                  >
                    {day.short}
                  </span>
                  <span
                    className={`mt-1 w-6 h-6 rounded-full text-[12.5px] font-semibold tabular-nums flex items-center justify-center leading-none ${
                      isToday
                        ? 'bg-gradient-to-b from-[#FF8C1A] to-[#FF6B00] text-white shadow-xs shadow-[#FF7A00]/30'
                        : 'text-[#1C1C1E]'
                    }`}
                  >
                    {dayDates[day.key]}
                  </span>
                </div>

                {/* Comida (Lunch) Cell — Warm Amber Tint */}
                <button
                  type="button"
                  onClick={() =>
                    setSelectingSlot({ day: day.key, slot: 'comida' })
                  }
                  className={`rounded-[11px] px-2.5 py-1.5 text-left flex flex-col justify-center min-h-[44px] cursor-pointer ${
                    comidaDish
                      ? 'apple-meal-cell-lunch'
                      : 'apple-meal-cell-empty'
                  }`}
                >
                  {comidaDish ? (
                    <div className="w-full">
                      <p className="text-[11.5px] font-medium text-[#1C1C1E] leading-[1.22] line-clamp-2 tracking-[-0.01em]">
                        {comidaDish.name}
                      </p>
                      {showMacros && (comidaDish.kcal || comidaDish.protein) ? (
                        <p className="text-[9.5px] tabular-nums font-medium text-[#C85A00] mt-0.5">
                          {comidaDish.kcal ? `${comidaDish.kcal} kcal` : ''}
                          {comidaDish.protein ? ` · ${comidaDish.protein}g P` : ''}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] font-normal text-[#AEAEB2]">
                      <SFPlusIcon className="w-2.5 h-2.5 text-[#FF9500]/70" />
                      <span>Comida</span>
                    </div>
                  )}
                </button>

                {/* Cena (Dinner) Cell — Soft Indigo Twilight Tint */}
                <button
                  type="button"
                  onClick={() =>
                    setSelectingSlot({ day: day.key, slot: 'cena' })
                  }
                  className={`rounded-[11px] px-2.5 py-1.5 text-left flex flex-col justify-center min-h-[44px] cursor-pointer ${
                    cenaDish
                      ? 'apple-meal-cell-dinner'
                      : 'apple-meal-cell-empty'
                  }`}
                >
                  {cenaDish ? (
                    <div className="w-full">
                      <p className="text-[11.5px] font-medium text-[#1C1C1E] leading-[1.22] line-clamp-2 tracking-[-0.01em]">
                        {cenaDish.name}
                      </p>
                      {showMacros && (cenaDish.kcal || cenaDish.protein) ? (
                        <p className="text-[9.5px] tabular-nums font-medium text-[#5856D6] mt-0.5">
                          {cenaDish.kcal ? `${cenaDish.kcal} kcal` : ''}
                          {cenaDish.protein ? ` · ${cenaDish.protein}g P` : ''}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] font-normal text-[#AEAEB2]">
                      <SFPlusIcon className="w-2.5 h-2.5 text-[#5856D6]/70" />
                      <span>Cena</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Optional Daily Macro Summary Footer (only when enabled in Settings) */}
              {showMacros && (totalKcal > 0 || totalProt > 0) && (
                <div className="mt-1 pt-1 px-2 border-t border-black/[0.04] flex items-center justify-between text-[9.5px] tabular-nums text-[#8E8E93]">
                  <span className="font-semibold text-[#D96500]">
                    {totalKcal} kcal
                  </span>
                  <div className="flex items-center gap-2">
                    <span>P {totalProt}g</span>
                    <span>C {totalCarbs}g</span>
                    <span>G {totalFats}g</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sheet 1: Dish Selector for a specific Day & Slot */}
      {selectingSlot && (
        <div
          className="apple-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2.5"
          onClick={() => setSelectingSlot(null)}
        >
          <div
            className="apple-glass-sheet w-full max-w-[400px] rounded-[24px] p-4 text-[#1C1C1E] max-h-[82vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-9 h-1 rounded-full bg-black/15 mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div>
                <p
                  className={`text-[11px] font-semibold ${
                    selectingSlot.slot === 'comida'
                      ? 'text-[#D96500]'
                      : 'text-[#5856D6]'
                  }`}
                >
                  {DAYS.find((d) => d.key === selectingSlot.day)?.label}{' '}
                  {dayDates[selectingSlot.day]} ·{' '}
                  {selectingSlot.slot === 'comida' ? 'Comida' : 'Cena'}
                </p>
                <h3 className="text-[15px] font-semibold text-[#1C1C1E] tracking-[-0.015em]">
                  Seleccionar plato
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectingSlot(null)}
                aria-label="Cerrar selector"
                className="w-7 h-7 rounded-full bg-black/[0.06] flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] transition-colors cursor-pointer"
              >
                <SFCloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick inline add & assign */}
            <form
              onSubmit={handleQuickCreateAndAssign}
              className="mt-2.5 flex items-center gap-1.5"
            >
              <input
                type="text"
                value={quickDishName}
                onChange={(e) => setQuickDishName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return
                }}
                placeholder="Nuevo plato rápido..."
                className="apple-glass-input flex-1 rounded-[10px] px-3 py-2 text-[13px] text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!quickDishName.trim()}
                className="px-3.5 py-2 rounded-[10px] bg-[#FF7A00] text-white text-[13px] font-medium disabled:opacity-35 transition-opacity shrink-0 cursor-pointer"
              >
                Asignar
              </button>
            </form>

            {/* Dish Options */}
            <div className="overflow-y-auto no-scrollbar py-2.5 space-y-1 flex-1">
              {filteredDishesForSlot.map((dish) => {
                const isSelected =
                  weeklyMeals[selectingSlot.day]?.[selectingSlot.slot] ===
                  dish.id
                return (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => {
                      onAssignDish(
                        selectingSlot.day,
                        selectingSlot.slot,
                        dish.id
                      )
                      setSelectingSlot(null)
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-[12px] border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF9500]/12 border-[#FF9500]/35 text-[#1C1C1E]'
                        : 'bg-white border-black/[0.05] text-[#1C1C1E] hover:bg-black/[0.02]'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate text-[#1C1C1E]">
                        {dish.name}
                      </p>
                      {(dish.tag || (showMacros && (dish.kcal || dish.protein))) && (
                        <div className="flex items-center gap-2 mt-0.5">
                          {dish.tag && (
                            <span className="text-[10.5px] font-medium text-[#D96500] bg-[#FF9500]/10 px-1.5 py-0.2 rounded-md">
                              {dish.tag}
                            </span>
                          )}
                          {showMacros && (dish.kcal || dish.protein) && (
                            <span className="text-[11px] tabular-nums text-[#8E8E93]">
                              {dish.kcal ? `${dish.kcal} kcal` : ''}
                              {dish.protein ? ` · ${dish.protein}g P` : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#FF7A00] text-white flex items-center justify-center shrink-0">
                        <SFCheckIcon className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Bottom Actions inside Slot Sheet */}
            <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  onAssignDish(selectingSlot.day, selectingSlot.slot, null)
                  setSelectingSlot(null)
                }}
                className="text-[13px] font-medium text-[#FF3B30] hover:opacity-80 px-2 py-1.5 cursor-pointer"
              >
                Vaciar
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectingSlot(null)
                  onOpenDb()
                }}
                className="text-[13px] font-semibold text-[#D96500] flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#FF9500]/12 cursor-pointer"
              >
                <SFStackIcon className="w-3.5 h-3.5" />
                Catálogo de platos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sheet 2: Full Meals & Dinners Database */}
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
                <span className="w-8 h-8 rounded-[10px] bg-[#FF9500]/15 flex items-center justify-center text-[#FF7A00]">
                  <SFPlateIcon className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#1C1C1E] leading-tight">
                    Catálogo de Platos
                  </h3>
                  <p className="text-[11px] text-[#8E8E93]">
                    {dishes.length} platos guardados
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseDb}
                aria-label="Cerrar catálogo"
                className="w-7 h-7 rounded-full bg-black/[0.06] flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] cursor-pointer"
              >
                <SFCloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add new dish form */}
            <form
              onSubmit={handleCreateDish}
              className="mt-3 p-3 rounded-[14px] bg-white border border-black/[0.06] space-y-2"
            >
              <div className="grid grid-cols-[1fr_95px] gap-1.5">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.nativeEvent.isComposing || e.keyCode === 229) return
                  }}
                  placeholder="Nombre del plato..."
                  className="apple-glass-input w-full rounded-[10px] px-3 py-2 text-[12px] text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none"
                />
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Etiqueta"
                  className="apple-glass-input w-full rounded-[10px] px-2.5 py-2 text-[12px] text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 p-0.5 rounded-[10px] bg-black/[0.05]">
                {(['ambas', 'comida', 'cena'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCat(cat)}
                    className={`flex-1 py-1 rounded-[8px] text-[11px] font-medium capitalize transition-all cursor-pointer ${
                      newCat === cat
                        ? 'bg-white text-[#1C1C1E] shadow-2xs'
                        : 'text-[#8E8E93] hover:text-[#1C1C1E]'
                    }`}
                  >
                    {cat === 'ambas' ? 'Comida y Cena' : cat}
                  </button>
                ))}
              </div>

              {/* Optional nutrition fields */}
              <div className="grid grid-cols-4 gap-1.5">
                <input
                  type="number"
                  value={newKcal}
                  onChange={(e) => setNewKcal(e.target.value)}
                  placeholder="kcal"
                  className="apple-glass-input rounded-[8px] px-2 py-1.5 text-[11px] tabular-nums text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none"
                />
                <input
                  type="number"
                  value={newProt}
                  onChange={(e) => setNewProt(e.target.value)}
                  placeholder="Prot (g)"
                  className="apple-glass-input rounded-[8px] px-2 py-1.5 text-[11px] tabular-nums text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none"
                />
                <input
                  type="number"
                  value={newCarbs}
                  onChange={(e) => setNewCarbs(e.target.value)}
                  placeholder="Carbs"
                  className="apple-glass-input rounded-[8px] px-2 py-1.5 text-[11px] tabular-nums text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none"
                />
                <input
                  type="number"
                  value={newFats}
                  onChange={(e) => setNewFats(e.target.value)}
                  placeholder="Grasas"
                  className="apple-glass-input rounded-[8px] px-2 py-1.5 text-[11px] tabular-nums text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-[10px] bg-[#FF7A00] text-white font-medium text-[12px] flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all cursor-pointer"
              >
                <SFPlusIcon className="w-3.5 h-3.5" />
                Guardar en el catálogo
              </button>
            </form>

            {/* Filter tabs in DB */}
            <div className="flex items-center gap-1 mt-3 p-0.5 rounded-[10px] bg-black/[0.05]">
              {(['todas', 'comida', 'cena'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setDbFilter(f)}
                  className={`flex-1 py-1 rounded-[8px] text-[11px] font-medium capitalize transition-all cursor-pointer ${
                    dbFilter === f
                      ? 'bg-white text-[#1C1C1E] shadow-2xs'
                      : 'text-[#8E8E93] hover:text-[#1C1C1E]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Dishes list */}
            <div className="overflow-y-auto no-scrollbar mt-2 space-y-1 flex-1 pr-0.5">
              {filteredDishesInDb.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-[12px] bg-white border border-black/[0.05]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12.5px] font-medium text-[#1C1C1E] truncate">
                        {dish.name}
                      </p>
                      {dish.tag && (
                        <span className="text-[10px] font-medium text-[#D96500] bg-[#FF9500]/10 px-1.5 py-0.5 rounded-[6px] shrink-0">
                          {dish.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] tabular-nums text-[#8E8E93] capitalize">
                      {dish.category}
                      {dish.kcal ? ` · ${dish.kcal} kcal` : ''}
                      {dish.protein ? ` · ${dish.protein}g P` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteDish(dish.id)}
                    aria-label={`Eliminar ${dish.name}`}
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
