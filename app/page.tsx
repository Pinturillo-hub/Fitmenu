'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  AppSettings,
  DayKey,
  DishItem,
  EMPTY_WEEKLY_MEALS,
  ExerciseBase,
  ExerciseWithWeekContext,
  getWeekMeta,
  INITIAL_DISHES,
  INITIAL_EXERCISES,
  INITIAL_GYM_LOGS_BY_WEEK,
  INITIAL_MEALS_BY_WEEK,
  WeeklyGymLogs,
  WeeklyMeals,
} from '@/lib/planner-data'
import { MealsTab } from '@/components/planner/meals-tab'
import { GymTab } from '@/components/planner/gym-tab'
import { SettingsModal } from '@/components/planner/settings-modal'
import {
  SFBarbellIcon,
  SFChevronLeftIcon,
  SFChevronRightIcon,
  SFPlateIcon,
  SFSlidersIcon,
  SFStackIcon,
} from '@/components/planner/sf-icons'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'comidas' | 'gym'>('comidas')
  const [tabDirection, setTabDirection] = useState<'left' | 'right'>('right')

  // Multi-week state (-1 = last week, 0 = this week, +1 = next week, etc.)
  const [weekOffset, setWeekOffset] = useState<number>(0)
  const [weekDirection, setWeekDirection] = useState<'prev' | 'next'>('next')

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMealsDbOpen, setIsMealsDbOpen] = useState(false)
  const [isGymDbOpen, setIsGymDbOpen] = useState(false)

  // Floating bottom bar visibility on scroll (hide on scroll down, show on scroll up)
  const [isDockVisible, setIsDockVisible] = useState(true)
  const lastScrollY = useRef(0)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    const getScrollTop = (target?: EventTarget | null) => {
      if (target && target instanceof HTMLElement && target.scrollTop > 0) {
        return target.scrollTop
      }
      return (
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      )
    }

    const handleScroll = (e: Event) => {
      const currentY = getScrollTop(e.target)
      const delta = currentY - lastScrollY.current

      if (currentY <= 8) {
        setIsDockVisible(true)
      } else if (delta > 3) {
        setIsDockVisible(false)
      } else if (delta < -3) {
        setIsDockVisible(true)
      }
      lastScrollY.current = currentY
    }

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 4) {
        setIsDockVisible(false)
      } else if (e.deltaY < -4) {
        setIsDockVisible(true)
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY.current = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || e.touches.length === 0) return
      const currentTouchY = e.touches[0].clientY
      const diff = touchStartY.current - currentTouchY
      if (diff > 10) {
        setIsDockVisible(false)
        touchStartY.current = currentTouchY
      } else if (diff < -10) {
        setIsDockVisible(true)
        touchStartY.current = currentTouchY
      }
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

  // Extra info is OFF by default
  const [settings, setSettings] = useState<AppSettings>({
    showMealMacros: false,
    showGymProgression: false,
  })

  const [dishes, setDishes] = useState<DishItem[]>(INITIAL_DISHES)
  const [mealsByWeek, setMealsByWeek] = useState<Record<number, WeeklyMeals>>(
    INITIAL_MEALS_BY_WEEK
  )

  const [exercises, setExercises] = useState<ExerciseBase[]>(INITIAL_EXERCISES)
  const [gymLogsByWeek, setGymLogsByWeek] = useState<
    Record<number, WeeklyGymLogs>
  >(INITIAL_GYM_LOGS_BY_WEEK)

  const weekMeta = useMemo(() => getWeekMeta(weekOffset), [weekOffset])

  const currentWeekMeals: WeeklyMeals = useMemo(() => {
    return mealsByWeek[weekOffset] || EMPTY_WEEKLY_MEALS
  }, [mealsByWeek, weekOffset])

  const hasPreviousWeekMeals = useMemo(() => {
    const prev = mealsByWeek[weekOffset - 1]
    if (!prev) return false
    return Object.values(prev).some((d) => d.comida || d.cena)
  }, [mealsByWeek, weekOffset])

  // Compute each exercise with its current week log and automatic previous week reference
  const exercisesForCurrentWeek: ExerciseWithWeekContext[] = useMemo(() => {
    const currentLogs = gymLogsByWeek[weekOffset] || {}

    return exercises.map((ex) => {
      let foundPrevWeight = ''
      let foundPrevNotes = ''

      for (let w = weekOffset - 1; w >= -12; w--) {
        const logAtW = gymLogsByWeek[w]?.[ex.id]
        if (!foundPrevWeight && logAtW?.weight?.trim()) {
          foundPrevWeight = logAtW.weight.trim()
        }
        if (!foundPrevNotes && logAtW?.notes?.trim()) {
          foundPrevNotes = logAtW.notes.trim()
        }
        if (foundPrevWeight && foundPrevNotes) break
      }

      return {
        ...ex,
        currentWeight: currentLogs[ex.id]?.weight ?? '',
        currentNotes: currentLogs[ex.id]?.notes ?? '',
        prevWeight: foundPrevWeight || ex.baselineWeight,
        prevNotes: foundPrevNotes || ex.baselineNotes,
      }
    })
  }, [exercises, gymLogsByWeek, weekOffset])

  const handleSwitchTab = (newTab: 'comidas' | 'gym') => {
    if (newTab === activeTab) return
    setTabDirection(newTab === 'gym' ? 'right' : 'left')
    setActiveTab(newTab)
  }

  const handleStepWeek = (delta: number) => {
    setWeekDirection(delta > 0 ? 'next' : 'prev')
    setWeekOffset((prev) => prev + delta)
  }

  const handleResetToCurrentWeek = () => {
    if (weekOffset === 0) return
    setWeekDirection(weekOffset < 0 ? 'next' : 'prev')
    setWeekOffset(0)
  }

  const handleToggleSetting = (key: keyof AppSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleAssignDish = (
    day: DayKey,
    slot: 'comida' | 'cena',
    dishId: string | null
  ) => {
    setMealsByWeek((prev) => {
      const existingWeek = prev[weekOffset] || EMPTY_WEEKLY_MEALS
      return {
        ...prev,
        [weekOffset]: {
          ...existingWeek,
          [day]: {
            ...existingWeek[day],
            [slot]: dishId,
          },
        },
      }
    })
  }

  const handleCopyPreviousWeekMeals = () => {
    const prevWeek = mealsByWeek[weekOffset - 1]
    if (!prevWeek) return
    setMealsByWeek((prev) => ({
      ...prev,
      [weekOffset]: JSON.parse(JSON.stringify(prevWeek)),
    }))
  }

  const handleAddDish = (newDish: Omit<DishItem, 'id'>): DishItem => {
    const created: DishItem = {
      ...newDish,
      id: `d-${Date.now()}`,
    }
    setDishes((prev) => [created, ...prev])
    return created
  }

  const handleDeleteDish = (id: string) => {
    setDishes((prev) => prev.filter((d) => d.id !== id))
  }

  const handleUpdateExerciseLog = (
    id: string,
    field: 'weight' | 'notes',
    value: string
  ) => {
    setGymLogsByWeek((prev) => {
      const weekLogs = prev[weekOffset] || {}
      const existingEntry = weekLogs[id] || { weight: '', notes: '' }
      return {
        ...prev,
        [weekOffset]: {
          ...weekLogs,
          [id]: {
            ...existingEntry,
            [field]: value,
          },
        },
      }
    })
  }

  const handleUpdatePrescription = (
    id: string,
    series: number,
    reps: string,
    rest: string
  ) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, series, reps, rest } : ex))
    )
  }

  const handleAddExercise = (newEx: Omit<ExerciseBase, 'id'>) => {
    const created: ExerciseBase = {
      ...newEx,
      id: `e-${Date.now()}`,
    }
    setExercises((prev) => [...prev, created])
  }

  const handleDeleteExercise = (id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id))
  }

  const openActiveDatabase = () => {
    if (activeTab === 'comidas') {
      setIsMealsDbOpen(true)
    } else {
      setIsGymDbOpen(true)
    }
  }

  const anyExtraActive =
    settings.showMealMacros || settings.showGymProgression

  const viewAnimClass =
    tabDirection === 'right'
      ? 'apple-view-enter-right'
      : 'apple-view-enter-left'

  const weekAnimClass =
    weekDirection === 'next'
      ? 'apple-week-slide-next'
      : 'apple-week-slide-prev'

  const isMeals = activeTab === 'comidas'

  return (
    <div className="relative min-h-dvh w-full overflow-x-clip bg-[#F2F2F7] text-[#1C1C1E] flex justify-center">
      {/* Subtle Apple Health Ambient Top Tint — Shifts smoothly between Warm Tangerine (Comidas) & Fitness Mint (Gym) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 top-0 h-52 transition-colors duration-500 z-0 ${
          isMeals
            ? 'bg-gradient-to-b from-[#FF9500]/[0.11] via-[#FF6B00]/[0.03] to-transparent'
            : 'bg-gradient-to-b from-[#34C759]/[0.12] via-[#30D158]/[0.03] to-transparent'
        }`}
      />

      {/* Mobile App Container */}
      <main className="relative z-10 w-full max-w-[430px] min-h-dvh px-2.5 pt-2.5 pb-24 flex flex-col gap-2">
        {/* Native iOS Top Navigation Bar */}
        <header className="flex items-center justify-between gap-1.5 px-0.5">
          {/* Left: Section Badge + Title */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                isMeals ? 'bg-[#FF7A00]' : 'bg-[#30B050]'
              }`}
            />
            <h1 className="text-[17px] font-bold tracking-[-0.022em] text-[#1C1C1E] shrink-0">
              {isMeals ? 'Comidas' : 'Entreno'}
            </h1>
          </div>

          {/* Center: Native iOS Week Stepper Control */}
          <div className="apple-glass rounded-full p-0.5 flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => handleStepWeek(-1)}
              aria-label="Semana anterior"
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] active:scale-90 transition-all cursor-pointer"
            >
              <SFChevronLeftIcon className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleResetToCurrentWeek}
              title="Volver a esta semana"
              className="px-2 py-0.5 rounded-full flex flex-col items-center justify-center min-w-[88px] active:scale-95 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1 whitespace-nowrap">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${
                    weekMeta.isCurrentWeek
                      ? isMeals
                        ? 'bg-[#FF7A00]'
                        : 'bg-[#30B050]'
                      : 'bg-[#8E8E93]'
                  }`}
                />
                <span className="text-[10.5px] font-semibold tracking-[-0.01em] text-[#1C1C1E] leading-none">
                  {weekMeta.title}
                </span>
              </div>
              <span className="text-[9px] tabular-nums font-medium text-[#8E8E93] leading-none mt-0.5 whitespace-nowrap">
                {weekMeta.dateRange}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStepWeek(1)}
              aria-label="Semana siguiente"
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] active:scale-90 transition-all cursor-pointer"
            >
              <SFChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Ajustes"
            className="apple-glass w-7 h-7 rounded-full flex items-center justify-center text-[#3A3A3C] hover:text-[#1C1C1E] active:scale-90 transition-all relative shrink-0 cursor-pointer"
          >
            <SFSlidersIcon className="w-3.5 h-3.5" />
            {anyExtraActive && (
              <span
                className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                  isMeals ? 'bg-[#FF7A00]' : 'bg-[#30B050]'
                }`}
              />
            )}
          </button>
        </header>

        {/* Active View Content with Apple Spring Transitions */}
        <section key={activeTab} className={`flex-1 ${viewAnimClass}`}>
          {isMeals ? (
            <MealsTab
              key={`meals-week-${weekOffset}`}
              dishes={dishes}
              weeklyMeals={currentWeekMeals}
              dayDates={weekMeta.dayDates}
              isCurrentWeek={weekMeta.isCurrentWeek}
              weekAnimClass={weekAnimClass}
              showMacros={settings.showMealMacros}
              isDbOpen={isMealsDbOpen}
              onCloseDb={() => setIsMealsDbOpen(false)}
              onOpenDb={() => setIsMealsDbOpen(true)}
              onAssignDish={handleAssignDish}
              onAddDish={handleAddDish}
              onDeleteDish={handleDeleteDish}
              onCopyPreviousWeekMeals={handleCopyPreviousWeekMeals}
              hasPreviousWeekMeals={hasPreviousWeekMeals}
            />
          ) : (
            <GymTab
              key={`gym-week-${weekOffset}`}
              exercises={exercisesForCurrentWeek}
              weekAnimClass={weekAnimClass}
              showProgression={settings.showGymProgression}
              isDbOpen={isGymDbOpen}
              onCloseDb={() => setIsGymDbOpen(false)}
              onUpdateLog={handleUpdateExerciseLog}
              onUpdatePrescription={handleUpdatePrescription}
              onAddExercise={handleAddExercise}
              onDeleteExercise={handleDeleteExercise}
            />
          )}
        </section>

        {/* Floating Bottom Liquid Glass Bar (Sliding Segmented Control + Database Action Button) */}
        <div
          className={`fixed bottom-3.5 inset-x-0 z-40 flex justify-center px-3 pointer-events-none apple-spring-transition ${
            isDockVisible
              ? 'translate-y-0 opacity-100 scale-100'
              : 'translate-y-20 opacity-0 scale-95'
          }`}
        >
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* iOS Segmented Tab Switcher Pill */}
            <nav
              aria-label="Cambiar sección"
              className="apple-glass-dock p-1 rounded-full relative grid grid-cols-2 items-center min-w-[208px]"
            >
              {/* Physical Sliding Tinted Pill */}
              <div
                aria-hidden="true"
                className={`apple-glass-pill-active absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full apple-spring-transition ${
                  isMeals
                    ? 'translate-x-1'
                    : 'translate-x-[calc(100%+4px)]'
                }`}
              />

              <button
                type="button"
                onClick={() => handleSwitchTab('comidas')}
                className={`relative z-10 px-3.5 py-1.5 rounded-full text-[12px] font-semibold tracking-[-0.01em] flex items-center justify-center gap-1.5 transition-colors duration-200 cursor-pointer focus:outline-none ${
                  isMeals
                    ? 'text-[#E06300]'
                    : 'text-[#8E8E93] hover:text-[#3A3A3C]'
                }`}
              >
                <SFPlateIcon
                  className={`w-3.5 h-3.5 transition-colors duration-200 ${
                    isMeals ? 'text-[#FF7A00]' : 'text-[#8E8E93]'
                  }`}
                />
                <span>Comidas</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchTab('gym')}
                className={`relative z-10 px-3.5 py-1.5 rounded-full text-[12px] font-semibold tracking-[-0.01em] flex items-center justify-center gap-1.5 transition-colors duration-200 cursor-pointer focus:outline-none ${
                  !isMeals
                    ? 'text-[#1F9E40]'
                    : 'text-[#8E8E93] hover:text-[#3A3A3C]'
                }`}
              >
                <SFBarbellIcon
                  className={`w-3.5 h-3.5 transition-colors duration-200 ${
                    !isMeals ? 'text-[#30B050]' : 'text-[#8E8E93]'
                  }`}
                />
                <span>Gym</span>
              </button>
            </nav>

            {/* Detached Circular Catalog Button — Tinted by Active Tab */}
            <button
              type="button"
              onClick={openActiveDatabase}
              aria-label={
                isMeals
                  ? 'Abrir catálogo de platos'
                  : 'Abrir catálogo de ejercicios'
              }
              title={
                isMeals
                  ? 'Catálogo de platos'
                  : 'Catálogo de ejercicios'
              }
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 apple-spring-transition cursor-pointer focus:outline-none ${
                isMeals
                  ? 'bg-gradient-to-b from-[#FF8C1A] to-[#FF6B00] shadow-[#FF7A00]/25'
                  : 'bg-gradient-to-b from-[#34C759] to-[#28A745] shadow-[#30B050]/25'
              }`}
            >
              <SFStackIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Settings Sheet */}
        <SettingsModal
          isOpen={isSettingsOpen}
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onToggleSetting={handleToggleSetting}
        />
      </main>
    </div>
  )
}
