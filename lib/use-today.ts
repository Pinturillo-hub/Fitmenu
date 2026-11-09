import { useEffect, useState } from 'react'

/**
 * Start of today in ms, or null until the component has mounted.
 *
 * States: pending -> ready. The page is a static export, so the build-time
 * date must never be rendered; callers show nothing while this is null.
 * The value refreshes when the tab becomes visible again, so a page left
 * open overnight does not keep yesterday's date.
 */
export function useToday(): number | null {
  const [todayMs, setTodayMs] = useState<number | null>(null)

  useEffect(() => {
    const update = () => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      setTodayMs(d.getTime())
    }
    update()
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  return todayMs
}
