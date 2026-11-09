'use client'

import React, { useState } from 'react'
import type { DishItem } from '@/lib/planner-data'
import { CATEGORY_LABEL, formatMacros } from '@/lib/planner-logic'
import { Sheet } from '@/components/planner/sheet'
import {
  SFCloseIcon,
  SFPlateIcon,
  SFPlusIcon,
  SFTrashIcon,
} from '@/components/planner/sf-icons'

interface DishCatalogSheetProps {
  dishes: DishItem[]
  onAddDish: (dish: Omit<DishItem, 'id'>) => void
  onDeleteDish: (id: string) => void
  onClose: () => void
}

const toNumber = (value: string) => (value ? Number(value) : undefined)

export function DishCatalogSheet({
  dishes,
  onAddDish,
  onDeleteDish,
  onClose,
}: DishCatalogSheetProps) {
  const [filter, setFilter] = useState<'todas' | 'comida' | 'cena'>('todas')

  const [name, setName] = useState('')
  const [tag, setTag] = useState('')
  const [category, setCategory] = useState<DishItem['category']>('ambas')
  const [kcal, setKcal] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fats, setFats] = useState('')

  const visibleDishes = dishes.filter(
    (d) => filter === 'todas' || d.category === 'ambas' || d.category === filter
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAddDish({
      name: name.trim(),
      category,
      tag: tag.trim() || undefined,
      kcal: toNumber(kcal),
      protein: toNumber(protein),
      carbs: toNumber(carbs),
      fats: toNumber(fats),
    })
    setName('')
    setTag('')
    setKcal('')
    setProtein('')
    setCarbs('')
    setFats('')
  }

  const numberField =
    'field h-10 w-full rounded-lg px-2 text-[13px] tabular-nums text-ink placeholder:text-ink-3'

  return (
    <Sheet
      label="Catálogo de platos"
      onClose={onClose}
      className="max-w-[400px] max-h-[85vh] flex flex-col"
    >
      <div className="flex items-center justify-between pb-3 border-b border-hairline">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-tab-ink text-white flex items-center justify-center">
            <SFPlateIcon className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-[17px] font-semibold text-ink leading-tight">
              Catálogo de platos
            </h3>
            <p className="text-[12px] text-ink-3">
              {dishes.length} platos guardados
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar catálogo"
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
            placeholder="Nombre del plato"
            aria-label="Nombre del plato"
            className="field w-full h-10 rounded-lg px-3 text-[13px] text-ink placeholder:text-ink-3"
          />
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Etiqueta"
            aria-label="Etiqueta"
            className="field w-full h-10 rounded-lg px-3 text-[13px] text-ink placeholder:text-ink-3"
          />
        </div>

        <div className="flex items-center p-1 rounded-lg bg-well">
          {(['ambas', 'comida', 'cena'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
              className={`flex-1 h-8 rounded-[6px] text-[12px] font-medium t-ui cursor-pointer ${
                category === cat
                  ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.12)]'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              {CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          <input
            type="number"
            value={kcal}
            onChange={(e) => setKcal(e.target.value)}
            placeholder="kcal"
            aria-label="Calorías"
            className={numberField}
          />
          <input
            type="number"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="Prot."
            aria-label="Proteínas en gramos"
            className={numberField}
          />
          <input
            type="number"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="Carbs"
            aria-label="Carbohidratos en gramos"
            className={numberField}
          />
          <input
            type="number"
            value={fats}
            onChange={(e) => setFats(e.target.value)}
            placeholder="Grasas"
            aria-label="Grasas en gramos"
            className={numberField}
          />
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="tint-button w-full h-10 rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 disabled:opacity-40 t-ui active:scale-[0.98] cursor-pointer"
        >
          <SFPlusIcon className="w-4 h-4" />
          Guardar en el catálogo
        </button>
      </form>

      <div className="flex items-center mt-4 p-1 rounded-lg bg-well">
        {(['todas', 'comida', 'cena'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`flex-1 h-8 rounded-[6px] text-[12px] font-medium capitalize t-ui cursor-pointer ${
              filter === f
                ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.12)]'
                : 'text-ink-2 hover:text-ink'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto no-scrollbar mt-2 space-y-2 flex-1">
        {visibleDishes.map((dish) => (
          <div
            key={dish.id}
            className="flex items-center justify-between gap-2 px-3 py-3 rounded-xl bg-surface"
          >
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-ink truncate">
                {dish.name}
              </p>
              <p className="text-[12px] tabular-nums text-ink-3 mt-1 truncate">
                {[CATEGORY_LABEL[dish.category], dish.tag, formatMacros(dish)]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDeleteDish(dish.id)}
              aria-label={`Eliminar ${dish.name}`}
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
