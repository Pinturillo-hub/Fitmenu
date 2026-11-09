'use client'

import React, { useState } from 'react'
import type { DishItem, MealSlot } from '@/lib/planner-data'
import { formatMacros } from '@/lib/planner-logic'
import { Sheet } from '@/components/planner/sheet'
import {
  SFCheckIcon,
  SFCloseIcon,
  SFStackIcon,
} from '@/components/planner/sf-icons'

interface SlotPickerSheetProps {
  slot: MealSlot
  /** For example "Lunes 14" */
  dayTitle: string
  dishes: DishItem[]
  selectedDishId: string | null
  showMacros: boolean
  onAssign: (dishId: string | null) => void
  onCreateAndAssign: (name: string) => void
  onOpenCatalog: () => void
  onClose: () => void
}

export function SlotPickerSheet({
  slot,
  dayTitle,
  dishes,
  selectedDishId,
  showMacros,
  onAssign,
  onCreateAndAssign,
  onOpenCatalog,
  onClose,
}: SlotPickerSheetProps) {
  const [quickName, setQuickName] = useState('')

  const options = dishes.filter((d) => d.category === 'ambas' || d.category === slot)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = quickName.trim()
    if (!name) return
    onCreateAndAssign(name)
  }

  return (
    <Sheet
      label="Seleccionar plato"
      onClose={onClose}
      className="max-w-[400px] max-h-[82vh] flex flex-col"
    >
      <div className="flex items-center justify-between pb-3 border-b border-hairline">
        <div>
          <p className="text-[12px] font-medium text-tab-ink">
            {dayTitle} · {slot === 'comida' ? 'Comida' : 'Cena'}
          </p>
          <h3 className="text-[17px] font-semibold text-ink">
            Seleccionar plato
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar selector"
          className="w-8 h-8 rounded-full bg-well hover:bg-well-strong flex items-center justify-center text-ink-2 t-ui cursor-pointer"
        >
          <SFCloseIcon className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={quickName}
          onChange={(e) => setQuickName(e.target.value)}
          placeholder="Nuevo plato"
          aria-label="Nombre del nuevo plato"
          className="field flex-1 min-w-0 h-10 rounded-lg px-3 text-[14px] text-ink placeholder:text-ink-3"
        />
        <button
          type="submit"
          disabled={!quickName.trim()}
          className="tint-button h-10 px-4 rounded-lg text-[13px] font-medium disabled:opacity-40 t-ui active:scale-[0.97] shrink-0 cursor-pointer"
        >
          Asignar
        </button>
      </form>

      <div className="overflow-y-auto no-scrollbar py-3 space-y-2 flex-1">
        {options.map((dish) => {
          const isSelected = dish.id === selectedDishId
          const meta = [dish.tag, showMacros ? formatMacros(dish) : '']
            .filter(Boolean)
            .join(' · ')
          return (
            <button
              key={dish.id}
              type="button"
              onClick={() => onAssign(dish.id)}
              aria-pressed={isSelected}
              className={`w-full text-left px-3 py-3 rounded-xl flex items-center justify-between gap-2 t-ui cursor-pointer ${
                isSelected ? 'bg-tab/[0.14]' : 'bg-surface hover:bg-well'
              }`}
            >
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-ink truncate">
                  {dish.name}
                </p>
                {meta && (
                  <p className="text-[12px] tabular-nums text-ink-3 mt-1 truncate">
                    {meta}
                  </p>
                )}
              </div>
              {isSelected && (
                <span className="w-6 h-6 rounded-full bg-tab-ink text-white flex items-center justify-center shrink-0">
                  <SFCheckIcon className="w-4 h-4" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="pt-3 border-t border-hairline flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onAssign(null)}
          className="text-[13px] font-medium text-danger px-3 h-9 rounded-lg hover:bg-well t-ui cursor-pointer"
        >
          Vaciar
        </button>
        <button
          type="button"
          onClick={onOpenCatalog}
          className="text-[13px] font-medium text-tab-ink flex items-center gap-2 px-3 h-9 rounded-lg bg-tab/[0.12] t-ui active:scale-[0.97] cursor-pointer"
        >
          <SFStackIcon className="w-4 h-4" />
          Catálogo de platos
        </button>
      </div>
    </Sheet>
  )
}
