import type { DayKey, MealSlot } from './planner-data.ts'

/**
 * App shell state machine: which tab and week are shown, and which overlay
 * (sheet) is open. Pure and framework free, so it can be tested with
 * `pnpm test` and read as a single source of truth.
 *
 * Invariants
 * - At most one overlay is open at a time.
 * - While an overlay is open, tab and week navigation are ignored.
 * - Overlays that belong to a tab can only open while that tab is active.
 * - Every overlay is rendered by app/page.tsx from `overlay.kind`, so the
 *   tabs stay presentational and a stale overlay can never survive a tab
 *   switch.
 */

export type TabId = 'comidas' | 'gym'

export type Overlay =
  | { kind: 'none' }
  | { kind: 'settings' }
  | { kind: 'meals-catalog' }
  | { kind: 'gym-catalog' }
  | { kind: 'slot-picker'; day: DayKey; slot: MealSlot }
  | { kind: 'edit-prescription'; exerciseId: string }

export type OpenOverlay = Exclude<Overlay, { kind: 'none' }>

export interface ShellState {
  tab: TabId
  tabDirection: 'left' | 'right'
  /** 0 is the current week, -1 the previous one, +1 the next one */
  weekOffset: number
  weekDirection: 'prev' | 'next'
  overlay: Overlay
}

export type ShellEvent =
  | { type: 'tab/switch'; tab: TabId }
  | { type: 'week/step'; delta: number }
  | { type: 'week/reset' }
  | { type: 'overlay/open'; overlay: OpenOverlay }
  | { type: 'overlay/close' }

export const INITIAL_SHELL_STATE: ShellState = {
  tab: 'comidas',
  tabDirection: 'right',
  weekOffset: 0,
  weekDirection: 'next',
  overlay: { kind: 'none' },
}

const TAB_OF_OVERLAY: Record<OpenOverlay['kind'], TabId | null> = {
  settings: null,
  'meals-catalog': 'comidas',
  'slot-picker': 'comidas',
  'gym-catalog': 'gym',
  'edit-prescription': 'gym',
}

export function isOverlayOpen(state: ShellState): boolean {
  return state.overlay.kind !== 'none'
}

export function shellReducer(
  state: ShellState,
  event: ShellEvent
): ShellState {
  switch (event.type) {
    case 'tab/switch': {
      if (isOverlayOpen(state) || event.tab === state.tab) return state
      return {
        ...state,
        tab: event.tab,
        tabDirection: event.tab === 'gym' ? 'right' : 'left',
      }
    }

    case 'week/step': {
      if (isOverlayOpen(state) || event.delta === 0) return state
      return {
        ...state,
        weekOffset: state.weekOffset + event.delta,
        weekDirection: event.delta > 0 ? 'next' : 'prev',
      }
    }

    case 'week/reset': {
      if (isOverlayOpen(state) || state.weekOffset === 0) return state
      return {
        ...state,
        weekOffset: 0,
        weekDirection: state.weekOffset < 0 ? 'next' : 'prev',
      }
    }

    case 'overlay/open': {
      const requiredTab = TAB_OF_OVERLAY[event.overlay.kind]
      if (requiredTab !== null && requiredTab !== state.tab) return state
      return { ...state, overlay: event.overlay }
    }

    case 'overlay/close': {
      if (!isOverlayOpen(state)) return state
      return { ...state, overlay: { kind: 'none' } }
    }

    default: {
      const unhandled: never = event
      return unhandled
    }
  }
}
