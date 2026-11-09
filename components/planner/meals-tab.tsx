'use client'

import React from 'react'
import type { DayKey, DishItem, MealSlot, WeeklyMeals } from '@/lib/planner-data'
import { DAYS } from '@/lib/planner-data'
import { formatMacros, shouldOfferCopy } from '@/lib/planner-logic'
import {
  SFCopyWeekIcon,
  SFMoonStarsIcon,
  SFPlusIcon,
  SFSunIcon,
} from '@/components/planner/sf-icons'

interface MealsTabProps {
  dishes: DishItem[]
  weeklyMeals: WeeklyMeals
  dayDates: Record<DayKey, number>
  todayIndex: number
  weekAnimClass: string
  showMacros: boolean
  plannedCount: number
  hasPreviousWeekMeals: boolean
  onOpenSlotPicker: (day: DayKey, slot: MealSlot) => void
  onCopyPreviousWeekMeals: () => void
}

export function MealsTab({
  dishes,
  weeklyMeals,
  dayDates,
  todayIndex,
  weekAnimClass,
  showMacros,
  plannedCount,
  hasPreviousWeekMeals,
  onOpenSlotPicker,
  onCopyPreviousWeekMeals,
}: MealsTabProps) {
  const getDish = (id: string | null) => dishes.find((d) => d.id === id) ?? null

  const renderCell = (day: DayKey, slot: MealSlot) => {
    const dish = getDish(weeklyMeals[day]?.[slot])
    const macros = dish ? formatMacros(dish) : ''

    return (
      <button
        type="button"
        onClick={() => onOpenSlotPicker(day, slot)}
        className={`rounded-xl border px-2 py-2 text-left flex flex-col justify-center min-h-[48px] t-ui active:scale-[0.98] cursor-pointer ${
          dish
            ? 'border-transparent bg-well hover:bg-well-strong'
            : 'border-dashed border-ink/20 hover:bg-well'
        }`}
      >
        {dish ? (
          <div className="w-full">
            <p className="text-[13px] font-medium text-ink leading-[1.25] line-clamp-2">
              {dish.name}
            </p>
            {showMacros && macros ? (
              <p className="text-[11px] tabular-nums text-ink-2 mt-1">
                {macros}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[13px] text-ink-3">
            <SFPlusIcon className="w-4 h-4 text-tab-ink" />
            <span>{slot === 'comida' ? 'Comida' : 'Cena'}</span>
          </div>
        )}
      </button>
    )
  }

  return (
    <div className={`flex flex-col gap-2 ${weekAnimClass}`}>
      <div className="grid grid-cols-[40px_1fr_1fr] items-center gap-2 px-2">
        <span className="text-[12px] text-ink-3 text-center">Día</span>

        <div className="flex items-center gap-2 px-2">
          <SFSunIcon className="w-4 h-4 text-tab-ink" />
          <span className="text-[12px] font-medium text-ink-2">Comida</span>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <SFMoonStarsIcon className="w-4 h-4 text-tab-ink" />
            <span className="text-[12px] font-medium text-ink-2">Cena</span>
          </div>

          {shouldOfferCopy(plannedCount, hasPreviousWeekMeals) ? (
            <button
              type="button"
              onClick={onCopyPreviousWeekMeals}
              title="Duplicar la semana anterior"
              className="flex items-center gap-1 text-[12px] font-medium text-tab-ink t-ui active:scale-[0.97] cursor-pointer"
            >
              <SFCopyWeekIcon className="w-4 h-4" />
              <span>Duplicar</span>
            </button>
          ) : (
            <span className="text-[12px] tabular-nums text-ink-3">
              {plannedCount} de 14
            </span>
          )}
        </div>
      </div>

      <div className="surface-card rounded-[20px] overflow-hidden divide-y divide-hairline">
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

          const isToday = idx === todayIndex

          return (
            <div
              key={day.key}
              className={`p-2 ${isToday ? 'bg-tab/[0.06]' : ''}`}
            >
              <div className="grid grid-cols-[40px_1fr_1fr] items-stretch gap-2">
                <div className="flex flex-col items-center justify-center gap-1 select-none">
                  <span
                    className={`text-[11px] font-medium leading-none ${
                      isToday ? 'text-tab-ink' : 'text-ink-3'
                    }`}
                  >
                    {day.short}
                  </span>
                  <span
                    aria-current={isToday ? 'date' : undefined}
                    className={`w-7 h-7 rounded-full text-[15px] font-medium tabular-nums flex items-center justify-center leading-none ${
                      isToday ? 'bg-tab-ink text-white' : 'text-ink'
                    }`}
                  >
                    {dayDates[day.key]}
                  </span>
                </div>

                {renderCell(day.key, 'comida')}
                {renderCell(day.key, 'cena')}
              </div>

              {showMacros && (totalKcal > 0 || totalProt > 0) && (
                <div className="mt-2 pt-2 px-2 border-t border-hairline flex items-center justify-between text-[11px] tabular-nums text-ink-3">
                  <span className="font-medium text-tab-ink">
                    {totalKcal} kcal
                  </span>
                  <div className="flex items-center gap-3">
                    <span>P {totalProt} g</span>
                    <span>C {totalCarbs} g</span>
                    <span>G {totalFats} g</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
