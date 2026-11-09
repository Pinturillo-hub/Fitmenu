'use client'

import React, { useEffect, useRef } from 'react'

interface SheetProps {
  /** Accessible name announced for the dialog */
  label: string
  onClose: () => void
  className?: string
  children: React.ReactNode
}

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Modal sheet shared by every overlay. Which sheet is open is decided by the
 * shell state (lib/shell-state.ts); this component only provides the dialog
 * behavior: Escape and backdrop to close, focus kept inside, background
 * scroll locked and focus restored on close.
 */
export function Sheet({ label, onClose, className = '', children }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const pressStartedOnBackdrop = useRef(false)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const panel = panelRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    panel?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !panel) return

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [])

  return (
    <div
      className="sheet-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onPointerDown={(e) => {
        pressStartedOnBackdrop.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (pressStartedOnBackdrop.current && e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`glass glass-sheet w-full rounded-[28px] p-4 text-ink outline-none ${className}`}
      >
        <div className="w-9 h-1 rounded-full bg-ink/15 mx-auto mb-3 shrink-0" />
        {children}
      </div>
    </div>
  )
}
