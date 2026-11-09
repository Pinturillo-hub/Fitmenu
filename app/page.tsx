'use client'

import React, { useMemo, useReducer, useState } from 'react'
import type {
  AppSettings,
  DayKey,
  DishItem,
  ExerciseWithWeekContext,
  MealSlot,
} from '@/lib/planner-data'
import { DAYS, EMPTY_WEEKLY_MEALS, getWeekMeta } from '@/lib/planner-data'
import {
  countPlannedSlots,
  createId,
  hasPlannedMeals,
  resolvePreviousLog,
} from '@/lib/planner-logic'
import {
  createInitialPlannerData,
  plannerReducer,
} from '@/lib/planner-reducer'
import { INITIAL_SHELL_STATE, shellReducer } from '@/lib/shell-state'
import { useDockVisibility } from '@/lib/use-dock-visibility'
import { useToday } from '@/lib/use-today'
import { MealsTab } from '@/components/planner/meals-tab'
import { GymTab } from '@/components/planner/gym-tab'
import { SettingsModal } from '@/components/planner/settings-modal'
import { SlotPickerSheet } from '@/components/planner/slot-picker-sheet'
import { DishCatalogSheet } from '@/components/planner/dish-catalog-sheet'
import { ExerciseCatalogSheet } from '@/components/planner/exercise-catalog-sheet'
import { PrescriptionSheet } from '@/components/planner/prescription-sheet'
import {
  SFBarbellIcon,
  SFChevronLeftIcon,
  SFChevronRightIcon,
  SFPlateIcon,
  SFSlidersIcon,
  SFStackIcon,
} from '@/components/planner/sf-icons'

export default function HomePage() {
  const [shell, dispatchShell] = useReducer(shellReducer, INITIAL_SHELL_STATE)
  const [planner, dispatchPlanner] = useReducer(
    plannerReducer,
    undefined,
    createInitialPlannerData
  )
  const [settings, setSettings] = useState<AppSettings>({
    showMealMacros: false,
    showGymProgression: false,
  })

  // Real date (start of today, in ms). Null until mounted so the static
  // export never renders the build-time date.
  const todayMs = useToday()
  const isDockVisible = useDockVisibility()

  const weekMeta = useMemo(
    () => getWeekMeta(shell.weekOffset, new Date(todayMs ?? 0)),
    [shell.weekOffset, todayMs]
  )

  const currentWeekMeals =
    planner.mealsByWeek[shell.weekOffset] ?? EMPTY_WEEKLY_MEALS

  const plannedCount = countPlannedSlots(currentWeekMeals, planner.dishes)
  const hasPreviousWeekMeals = hasPlannedMeals(
    planner.mealsByWeek[shell.weekOffset - 1],
    planner.dishes
  )

  // Each exercise with its current week log and the last real previous log
  const exercisesForCurrentWeek: ExerciseWithWeekContext[] = useMemo(() => {
    const currentLogs = planner.gymLogsByWeek[shell.weekOffset] ?? {}

    return planner.exercises.map((ex) => {
      const previous = resolvePreviousLog(
        planner.gymLogsByWeek,
        shell.weekOffset,
        ex.id
      )
      return {
        ...ex,
        currentWeight: currentLogs[ex.id]?.weight ?? '',
        currentNotes: currentLogs[ex.id]?.notes ?? '',
        prevWeight: previous.weight || ex.baselineWeight,
        prevNotes: previous.notes || ex.baselineNotes,
      }
    })
  }, [planner.exercises, planner.gymLogsByWeek, shell.weekOffset])

  const closeOverlay = () => dispatchShell({ type: 'overlay/close' })

  const openSlotPicker = (day: DayKey, slot: MealSlot) =>
    dispatchShell({ type: 'overlay/open', overlay: { kind: 'slot-picker', day, slot } })

  const openActiveCatalog = () =>
    dispatchShell({
      type: 'overlay/open',
      overlay:
        shell.tab === 'comidas'
          ? { kind: 'meals-catalog' }
          : { kind: 'gym-catalog' },
    })

  const toggleSetting = (key: keyof AppSettings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))

  const addDish = (dish: Omit<DishItem, 'id'>): DishItem => {
    const created: DishItem = { ...dish, id: createId('d') }
    dispatchPlanner({ type: 'dish/add', dish: created })
    return created
  }

  const assignDish = (day: DayKey, slot: MealSlot, dishId: string | null) => {
    dispatchPlanner({
      type: 'meal/assign',
      week: shell.weekOffset,
      day,
      slot,
      dishId,
    })
    closeOverlay()
  }

  const createAndAssignDish = (day: DayKey, slot: MealSlot, name: string) => {
    const created = addDish({ name, category: slot })
    assignDish(day, slot, created.id)
  }

  const copyPreviousWeek = () =>
    dispatchPlanner({
      type: 'meal/copy-previous-week',
      week: shell.weekOffset,
    })

  const renderOverlay = () => {
    const overlay = shell.overlay

    switch (overlay.kind) {
      case 'none':
        return null

      case 'settings':
        return (
          <SettingsModal
            settings={settings}
            onClose={closeOverlay}
            onToggleSetting={toggleSetting}
          />
        )

      case 'slot-picker': {
        const { day, slot } = overlay
        const dayLabel = DAYS.find((d) => d.key === day)?.label ?? ''
        return (
          <SlotPickerSheet
            slot={slot}
            dayTitle={`${dayLabel} ${weekMeta.dayDates[day]}`}
            dishes={planner.dishes}
            selectedDishId={currentWeekMeals[day][slot]}
            showMacros={settings.showMealMacros}
            onAssign={(dishId) => assignDish(day, slot, dishId)}
            onCreateAndAssign={(name) => createAndAssignDish(day, slot, name)}
            onOpenCatalog={() =>
              dispatchShell({
                type: 'overlay/open',
                overlay: { kind: 'meals-catalog' },
              })
            }
            onClose={closeOverlay}
          />
        )
      }

      case 'meals-catalog':
        return (
          <DishCatalogSheet
            dishes={planner.dishes}
            onAddDish={addDish}
            onDeleteDish={(id) => dispatchPlanner({ type: 'dish/delete', id })}
            onClose={closeOverlay}
          />
        )

      case 'gym-catalog':
        return (
          <ExerciseCatalogSheet
            exercises={exercisesForCurrentWeek}
            onAddExercise={(exercise) =>
              dispatchPlanner({
                type: 'exercise/add',
                exercise: { ...exercise, id: createId('e') },
              })
            }
            onDeleteExercise={(id) =>
              dispatchPlanner({ type: 'exercise/delete', id })
            }
            onClose={closeOverlay}
          />
        )

      case 'edit-prescription': {
        const exercise = exercisesForCurrentWeek.find(
          (ex) => ex.id === overlay.exerciseId
        )
        if (!exercise) return null
        return (
          <PrescriptionSheet
            exercise={exercise}
            onSave={(series, reps, rest) => {
              dispatchPlanner({
                type: 'exercise/update-prescription',
                id: exercise.id,
                series,
                reps,
                rest,
              })
              closeOverlay()
            }}
            onClose={closeOverlay}
          />
        )
      }
    }
  }

  const anyExtraActive =
    settings.showMealMacros || settings.showGymProgression

  const viewAnimClass =
    shell.tabDirection === 'right'
      ? 'apple-view-enter-right'
      : 'apple-view-enter-left'

  const weekAnimClass =
    shell.weekDirection === 'next'
      ? 'apple-week-slide-next'
      : 'apple-week-slide-prev'

  const isMeals = shell.tab === 'comidas'

  if (todayMs === null) {
    return <div className="min-h-dvh w-full bg-background" />
  }

  return (
    <div
      className={`relative min-h-dvh w-full overflow-x-clip bg-background text-ink flex justify-center ${
        isMeals ? '' : 'theme-gym'
      }`}
    >
      <main className="relative z-10 w-full max-w-[430px] min-h-dvh px-4 pb-32 flex flex-col gap-3">
        <header className="scroll-edge sticky top-0 z-30 flex items-center justify-between gap-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-1">
          <div className="flex items-center gap-2 shrink-0">
            {isMeals ? (
              <SFPlateIcon className="w-4 h-4 text-tab-ink" />
            ) : (
              <SFBarbellIcon className="w-4 h-4 text-tab-ink" />
            )}
            <h1 className="text-[17px] font-semibold text-ink">
              {isMeals ? 'Comidas' : 'Entreno'}
            </h1>
          </div>

          <div className="glass rounded-full p-1 flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => dispatchShell({ type: 'week/step', delta: -1 })}
              aria-label="Semana anterior"
              className="w-8 h-8 rounded-full flex items-center justify-center text-ink-2 hover:bg-well t-ui active:scale-[0.97] cursor-pointer"
            >
              <SFChevronLeftIcon className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => dispatchShell({ type: 'week/reset' })}
              title="Volver a esta semana"
              className="h-8 px-3 min-w-[112px] rounded-full flex flex-col items-center justify-center t-ui active:scale-[0.97] cursor-pointer"
            >
              <span className="flex items-center gap-1 whitespace-nowrap text-[12px] font-medium text-ink leading-4">
                {weekMeta.isCurrentWeek && (
                  <span className="w-1.5 h-1.5 rounded-full bg-tab shrink-0" />
                )}
                {weekMeta.title}
              </span>
              <span className="text-[11px] tabular-nums text-ink-3 leading-4 whitespace-nowrap">
                {weekMeta.dateRange}
              </span>
            </button>

            <button
              type="button"
              onClick={() => dispatchShell({ type: 'week/step', delta: 1 })}
              aria-label="Semana siguiente"
              className="w-8 h-8 rounded-full flex items-center justify-center text-ink-2 hover:bg-well t-ui active:scale-[0.97] cursor-pointer"
            >
              <SFChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              dispatchShell({
                type: 'overlay/open',
                overlay: { kind: 'settings' },
              })
            }
            aria-label="Ajustes"
            className="relative glass w-10 h-10 rounded-full flex items-center justify-center text-ink-2 hover:text-ink t-ui active:scale-[0.97] shrink-0 cursor-pointer"
          >
            <SFSlidersIcon className="w-4 h-4" />
            {anyExtraActive && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-tab" />
            )}
          </button>
        </header>

        <section key={shell.tab} className={`flex-1 ${viewAnimClass}`}>
          {isMeals ? (
            <MealsTab
              key={`meals-week-${shell.weekOffset}`}
              dishes={planner.dishes}
              weeklyMeals={currentWeekMeals}
              dayDates={weekMeta.dayDates}
              todayIndex={weekMeta.todayIndex}
              weekAnimClass={weekAnimClass}
              showMacros={settings.showMealMacros}
              plannedCount={plannedCount}
              hasPreviousWeekMeals={hasPreviousWeekMeals}
              onOpenSlotPicker={openSlotPicker}
              onCopyPreviousWeekMeals={copyPreviousWeek}
            />
          ) : (
            <GymTab
              key={`gym-week-${shell.weekOffset}`}
              exercises={exercisesForCurrentWeek}
              weekAnimClass={weekAnimClass}
              showProgression={settings.showGymProgression}
              onUpdateLog={(id, field, value) =>
                dispatchPlanner({
                  type: 'log/update',
                  week: shell.weekOffset,
                  id,
                  field,
                  value,
                })
              }
              onOpenPrescription={(exerciseId) =>
                dispatchShell({
                  type: 'overlay/open',
                  overlay: { kind: 'edit-prescription', exerciseId },
                })
              }
            />
          )}
        </section>

        <div
          className={`fixed inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] z-40 flex justify-center px-4 pointer-events-none t-move ${
            isDockVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-20 opacity-0'
          }`}
        >
          <div className="flex items-center gap-3 pointer-events-auto">
            <nav
              aria-label="Cambiar sección"
              className="glass glass-dock relative grid grid-cols-2 items-center p-1 rounded-full min-w-[216px]"
            >
              <div
                aria-hidden="true"
                className={`glass-lens absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full t-move ${
                  isMeals ? 'translate-x-0' : 'translate-x-full'
                }`}
              />

              <button
                type="button"
                onClick={() =>
                  dispatchShell({ type: 'tab/switch', tab: 'comidas' })
                }
                aria-pressed={isMeals}
                className={`relative z-10 h-10 px-4 rounded-full text-[13px] font-semibold flex items-center justify-center gap-2 t-ui cursor-pointer ${
                  isMeals ? 'text-meals-ink' : 'text-ink-2 hover:text-ink'
                }`}
              >
                <SFPlateIcon className="w-4 h-4" />
                <span>Comidas</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  dispatchShell({ type: 'tab/switch', tab: 'gym' })
                }
                aria-pressed={!isMeals}
                className={`relative z-10 h-10 px-4 rounded-full text-[13px] font-semibold flex items-center justify-center gap-2 t-ui cursor-pointer ${
                  !isMeals ? 'text-gym-ink' : 'text-ink-2 hover:text-ink'
                }`}
              >
                <SFBarbellIcon className="w-4 h-4" />
                <span>Gym</span>
              </button>
            </nav>

            <button
              type="button"
              onClick={openActiveCatalog}
              aria-label={
                isMeals
                  ? 'Abrir catálogo de platos'
                  : 'Abrir catálogo de ejercicios'
              }
              title={
                isMeals ? 'Catálogo de platos' : 'Catálogo de ejercicios'
              }
              className="tint-button w-12 h-12 rounded-full flex items-center justify-center t-ui active:scale-[0.97] cursor-pointer"
            >
              <SFStackIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {renderOverlay()}
    </div>
  )
}
