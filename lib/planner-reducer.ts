import {
  EMPTY_WEEKLY_MEALS,
  INITIAL_DISHES,
  INITIAL_EXERCISES,
  INITIAL_GYM_LOGS_BY_WEEK,
  INITIAL_MEALS_BY_WEEK,
} from './planner-data.ts'
import type {
  DayKey,
  DishItem,
  ExerciseBase,
  MealSlot,
  WeeklyGymLogs,
  WeeklyMeals,
} from './planner-data.ts'

/**
 * All changes to the planner data go through this reducer, so related
 * updates happen atomically (for example deleting a dish also clears it from
 * every week). Weeks are keyed by offset: 0 is the current week.
 */

export interface PlannerData {
  dishes: DishItem[]
  mealsByWeek: Record<number, WeeklyMeals>
  exercises: ExerciseBase[]
  gymLogsByWeek: Record<number, WeeklyGymLogs>
}

export type PlannerAction =
  | { type: 'dish/add'; dish: DishItem }
  | { type: 'dish/delete'; id: string }
  | {
      type: 'meal/assign'
      week: number
      day: DayKey
      slot: MealSlot
      dishId: string | null
    }
  | { type: 'meal/copy-previous-week'; week: number }
  | { type: 'exercise/add'; exercise: ExerciseBase }
  | { type: 'exercise/delete'; id: string }
  | {
      type: 'exercise/update-prescription'
      id: string
      series: number
      reps: string
      rest: string
    }
  | {
      type: 'log/update'
      week: number
      id: string
      field: 'weight' | 'notes'
      value: string
    }

export function createInitialPlannerData(): PlannerData {
  return {
    dishes: INITIAL_DISHES,
    mealsByWeek: INITIAL_MEALS_BY_WEEK,
    exercises: INITIAL_EXERCISES,
    gymLogsByWeek: INITIAL_GYM_LOGS_BY_WEEK,
  }
}

const DAY_KEYS = Object.keys(EMPTY_WEEKLY_MEALS) as DayKey[]

export function plannerReducer(
  state: PlannerData,
  action: PlannerAction
): PlannerData {
  switch (action.type) {
    case 'dish/add':
      return { ...state, dishes: [action.dish, ...state.dishes] }

    case 'dish/delete': {
      const mealsByWeek: Record<number, WeeklyMeals> = {}
      for (const [week, meals] of Object.entries(state.mealsByWeek)) {
        const cleaned = {} as WeeklyMeals
        for (const day of DAY_KEYS) {
          cleaned[day] = {
            comida: meals[day].comida === action.id ? null : meals[day].comida,
            cena: meals[day].cena === action.id ? null : meals[day].cena,
          }
        }
        mealsByWeek[Number(week)] = cleaned
      }
      return {
        ...state,
        dishes: state.dishes.filter((d) => d.id !== action.id),
        mealsByWeek,
      }
    }

    case 'meal/assign': {
      const existing = state.mealsByWeek[action.week] ?? EMPTY_WEEKLY_MEALS
      return {
        ...state,
        mealsByWeek: {
          ...state.mealsByWeek,
          [action.week]: {
            ...existing,
            [action.day]: {
              ...existing[action.day],
              [action.slot]: action.dishId,
            },
          },
        },
      }
    }

    case 'meal/copy-previous-week': {
      const previous = state.mealsByWeek[action.week - 1]
      if (!previous) return state
      const current = state.mealsByWeek[action.week] ?? EMPTY_WEEKLY_MEALS
      // Only fills empty slots, so nothing already planned is overwritten
      const merged = {} as WeeklyMeals
      for (const day of DAY_KEYS) {
        merged[day] = {
          comida: current[day].comida ?? previous[day].comida,
          cena: current[day].cena ?? previous[day].cena,
        }
      }
      return {
        ...state,
        mealsByWeek: { ...state.mealsByWeek, [action.week]: merged },
      }
    }

    case 'exercise/add':
      return { ...state, exercises: [...state.exercises, action.exercise] }

    case 'exercise/delete':
      return {
        ...state,
        exercises: state.exercises.filter((ex) => ex.id !== action.id),
      }

    case 'exercise/update-prescription':
      return {
        ...state,
        exercises: state.exercises.map((ex) =>
          ex.id === action.id
            ? {
                ...ex,
                series: action.series,
                reps: action.reps,
                rest: action.rest,
              }
            : ex
        ),
      }

    case 'log/update': {
      const weekLogs = state.gymLogsByWeek[action.week] ?? {}
      const entry = weekLogs[action.id] ?? { weight: '', notes: '' }
      return {
        ...state,
        gymLogsByWeek: {
          ...state.gymLogsByWeek,
          [action.week]: {
            ...weekLogs,
            [action.id]: { ...entry, [action.field]: action.value },
          },
        },
      }
    }

    default: {
      const unhandled: never = action
      return unhandled
    }
  }
}
