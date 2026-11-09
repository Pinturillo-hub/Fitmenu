/**
 * Visibility rules for the floating bottom dock: it hides while the user
 * scrolls down and comes back when they scroll up or reach the top.
 * Pure transitions; the browser wiring lives in use-dock-visibility.ts.
 *
 * States: visible | hidden. Each input either flips the state or keeps it,
 * and small movements are ignored so the dock does not flicker.
 */

export const TOP_ZONE_PX = 8
export const SCROLL_STEP_PX = 3
export const WHEEL_STEP_PX = 4
export const TOUCH_STEP_PX = 10

export function dockAfterScroll(
  visible: boolean,
  lastY: number,
  currentY: number
): boolean {
  if (currentY <= TOP_ZONE_PX) return true
  const delta = currentY - lastY
  if (delta > SCROLL_STEP_PX) return false
  if (delta < -SCROLL_STEP_PX) return true
  return visible
}

export function dockAfterWheel(visible: boolean, deltaY: number): boolean {
  if (deltaY > WHEEL_STEP_PX) return false
  if (deltaY < -WHEEL_STEP_PX) return true
  return visible
}

export interface TouchResult {
  visible: boolean
  /** Reference point for the next touchmove */
  startY: number
}

export function dockAfterTouchMove(
  visible: boolean,
  startY: number,
  currentY: number
): TouchResult {
  const diff = startY - currentY
  if (diff > TOUCH_STEP_PX) return { visible: false, startY: currentY }
  if (diff < -TOUCH_STEP_PX) return { visible: true, startY: currentY }
  return { visible, startY }
}
