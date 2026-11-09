import type {
  DishItem,
  WeeklyGymLogs,
  WeeklyMeals,
} from './planner-data.ts'

/**
 * Derived rules of the planner, kept pure so they can be tested.
 *
 * Meal slot:   empty | planned (a slot only counts when its dish still exists)
 * Week plan:   a "Duplicar" shortcut is offered while the week is nearly empty
 * Exercise:    not logged | logged, plus a progression against the last log
 */

export const COPY_SUGGESTION_THRESHOLD = 6

let idCounter = 0

export function createId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`
}

export function countPlannedSlots(
  week: WeeklyMeals,
  dishes: DishItem[]
): number {
  const known = new Set(dishes.map((d) => d.id))
  let planned = 0
  for (const day of Object.values(week)) {
    if (day.comida && known.has(day.comida)) planned += 1
    if (day.cena && known.has(day.cena)) planned += 1
  }
  return planned
}

export function hasPlannedMeals(
  week: WeeklyMeals | undefined,
  dishes: DishItem[]
): boolean {
  return week !== undefined && countPlannedSlots(week, dishes) > 0
}

export function shouldOfferCopy(
  plannedCount: number,
  hasPreviousWeek: boolean
): boolean {
  return hasPreviousWeek && plannedCount < COPY_SUGGESTION_THRESHOLD
}

export const CATEGORY_LABEL: Record<DishItem['category'], string> = {
  comida: 'Comida',
  cena: 'Cena',
  ambas: 'Comida y cena',
}

export function formatMacros(dish: DishItem): string {
  const parts: string[] = []
  if (dish.kcal) parts.push(`${dish.kcal} kcal`)
  if (dish.protein) parts.push(`${dish.protein} g P`)
  return parts.join(' · ')
}

/**
 * Last weight and notes logged for an exercise in any earlier week.
 * Walks the real history instead of a fixed number of weeks.
 */
export function resolvePreviousLog(
  logsByWeek: Record<number, WeeklyGymLogs>,
  weekOffset: number,
  exerciseId: string
): { weight: string; notes: string } {
  const earlierWeeks = Object.keys(logsByWeek)
    .map(Number)
    .filter((week) => week < weekOffset)
    .sort((a, b) => b - a)

  let weight = ''
  let notes = ''
  for (const week of earlierWeeks) {
    const entry = logsByWeek[week]?.[exerciseId]
    if (!weight && entry?.weight?.trim()) weight = entry.weight.trim()
    if (!notes && entry?.notes?.trim()) notes = entry.notes.trim()
    if (weight && notes) break
  }
  return { weight, notes }
}

export function parseNumericKg(value: string): number | null {
  if (!value) return null
  const match = value.replace(',', '.').match(/(\d+(\.\d+)?)/)
  return match ? parseFloat(match[1]) : null
}

export function isWeightLogged(currentWeight: string): boolean {
  return currentWeight.trim().length > 0
}

export type Progression =
  | { kind: 'unknown' }
  | { kind: 'same' }
  | { kind: 'up'; kg: number }
  | { kind: 'down'; kg: number }

/** `kg` is signed: positive when up, negative when down */
export function getProgression(
  previousWeight: string,
  currentWeight: string
): Progression {
  const previous = parseNumericKg(previousWeight)
  const current = parseNumericKg(currentWeight)
  if (previous === null || current === null) return { kind: 'unknown' }

  const kg = Math.round((current - previous) * 100) / 100
  if (kg > 0) return { kind: 'up', kg }
  if (kg < 0) return { kind: 'down', kg }
  return { kind: 'same' }
}

export function formatProgression(progression: Progression): string {
  switch (progression.kind) {
    case 'up':
      return `+${progression.kg} kg`
    case 'down':
      return `${progression.kg} kg`
    case 'same':
      return '0 kg'
    case 'unknown':
      return ''
  }
}
