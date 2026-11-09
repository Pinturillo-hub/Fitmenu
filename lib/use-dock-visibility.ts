import { useEffect, useRef, useState } from 'react'
import {
  dockAfterScroll,
  dockAfterTouchMove,
  dockAfterWheel,
} from './dock-visibility.ts'

function readScrollTop(target?: EventTarget | null): number {
  if (target instanceof HTMLElement && target.scrollTop > 0) {
    return target.scrollTop
  }
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  )
}

export function useDockVisibility(): boolean {
  const [visible, setVisible] = useState(true)
  const visibleRef = useRef(true)
  const lastScrollY = useRef(0)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    const apply = (next: boolean) => {
      if (next === visibleRef.current) return
      visibleRef.current = next
      setVisible(next)
    }

    const handleScroll = (e: Event) => {
      const currentY = readScrollTop(e.target)
      const lastY = lastScrollY.current
      lastScrollY.current = currentY
      apply(dockAfterScroll(visibleRef.current, lastY, currentY))
    }

    const handleWheel = (e: WheelEvent) => {
      apply(dockAfterWheel(visibleRef.current, e.deltaY))
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) touchStartY.current = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || e.touches.length === 0) return
      const result = dockAfterTouchMove(
        visibleRef.current,
        touchStartY.current,
        e.touches[0].clientY
      )
      touchStartY.current = result.startY
      apply(result.visible)
    }

    window.addEventListener('scroll', handleScroll, {
      passive: true,
      capture: true,
    })
    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true })
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  return visible
}
