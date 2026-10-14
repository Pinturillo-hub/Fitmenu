export type DayKey =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo'

export interface DishItem {
  id: string
  name: string
  category: 'comida' | 'cena' | 'ambas'
  tag?: string
  kcal?: number
  protein?: number
  carbs?: number
  fats?: number
}

export type WeeklyMeals = Record<
  DayKey,
  {
    comida: string | null
    cena: string | null
  }
>

export interface ExerciseBase {
  id: string
  name: string
  muscle: string
  series: number
  reps: string
  rest: string
  baselineWeight: string
  baselineNotes: string
}

export interface ExerciseLogEntry {
  weight: string
  notes: string
}

export type WeeklyGymLogs = Record<string, ExerciseLogEntry>

export interface ExerciseWithWeekContext extends ExerciseBase {
  currentWeight: string
  currentNotes: string
  prevWeight: string
  prevNotes: string
}

export interface AppSettings {
  showMealMacros: boolean
  showGymProgression: boolean
}

export const DAYS: {
  key: DayKey
  label: string
  short: string
  letter: string
  dayOffset: number
}[] = [
  { key: 'lunes', label: 'Lunes', short: 'LUN', letter: 'L', dayOffset: 0 },
  { key: 'martes', label: 'Martes', short: 'MAR', letter: 'M', dayOffset: 1 },
  { key: 'miercoles', label: 'Miércoles', short: 'MIÉ', letter: 'X', dayOffset: 2 },
  { key: 'jueves', label: 'Jueves', short: 'JUE', letter: 'J', dayOffset: 3 },
  { key: 'viernes', label: 'Viernes', short: 'VIE', letter: 'V', dayOffset: 4 },
  { key: 'sabado', label: 'Sábado', short: 'SÁB', letter: 'S', dayOffset: 5 },
  { key: 'domingo', label: 'Domingo', short: 'DOM', letter: 'D', dayOffset: 6 },
]

export const EMPTY_WEEKLY_MEALS: WeeklyMeals = {
  lunes: { comida: null, cena: null },
  martes: { comida: null, cena: null },
  miercoles: { comida: null, cena: null },
  jueves: { comida: null, cena: null },
  viernes: { comida: null, cena: null },
  sabado: { comida: null, cena: null },
  domingo: { comida: null, cena: null },
}

export const INITIAL_DISHES: DishItem[] = [
  {
    id: 'd1',
    name: 'Pollo al limón con arroz jazmín',
    category: 'comida',
    tag: 'Ave · Arroz',
    kcal: 620,
    protein: 48,
    carbs: 68,
    fats: 14,
  },
  {
    id: 'd2',
    name: 'Salmón al horno con espárragos',
    category: 'cena',
    tag: 'Omega 3 · Ligero',
    kcal: 540,
    protein: 42,
    carbs: 18,
    fats: 32,
  },
  {
    id: 'd3',
    name: 'Pasta integral con boloñesa magra',
    category: 'comida',
    tag: 'Energía · Pasta',
    kcal: 680,
    protein: 45,
    carbs: 82,
    fats: 16,
  },
  {
    id: 'd4',
    name: 'Tortilla francesa con aguacate y pavo',
    category: 'cena',
    tag: 'Rápido · Proteico',
    kcal: 460,
    protein: 36,
    carbs: 12,
    fats: 28,
  },
  {
    id: 'd5',
    name: 'Poke bowl de atún, quinoa y edamame',
    category: 'ambas',
    tag: 'Fresco · Bowl',
    kcal: 580,
    protein: 44,
    carbs: 56,
    fats: 18,
  },
  {
    id: 'd6',
    name: 'Solomillo de ternera con patata asada',
    category: 'comida',
    tag: 'Fuerza · Hierro',
    kcal: 650,
    protein: 52,
    carbs: 54,
    fats: 22,
  },
  {
    id: 'd7',
    name: 'Merluza a la plancha con verduras',
    category: 'cena',
    tag: 'Pescado blanco',
    kcal: 410,
    protein: 39,
    carbs: 22,
    fats: 14,
  },
  {
    id: 'd8',
    name: 'Fajitas de pollo y pimientos asados',
    category: 'ambas',
    tag: 'Tex-Mex · Magro',
    kcal: 590,
    protein: 43,
    carbs: 60,
    fats: 17,
  },
  {
    id: 'd9',
    name: 'Ensalada César con pollo crujiente',
    category: 'cena',
    tag: 'Verde · Ligero',
    kcal: 490,
    protein: 40,
    carbs: 24,
    fats: 24,
  },
  {
    id: 'd10',
    name: 'Arroz meloso con gambas y sepia',
    category: 'comida',
    tag: 'Mediterráneo',
    kcal: 610,
    protein: 41,
    carbs: 74,
    fats: 13,
  },
]

export const INITIAL_MEALS_BY_WEEK: Record<number, WeeklyMeals> = {
  [-1]: {
    lunes: { comida: 'd3', cena: 'd7' },
    martes: { comida: 'd1', cena: 'd2' },
    miercoles: { comida: 'd8', cena: 'd4' },
    jueves: { comida: 'd5', cena: 'd9' },
    viernes: { comida: 'd6', cena: 'd2' },
    sabado: { comida: 'd10', cena: 'd7' },
    domingo: { comida: 'd3', cena: 'd4' },
  },
  [0]: {
    lunes: { comida: 'd1', cena: 'd2' },
    martes: { comida: 'd3', cena: 'd4' },
    miercoles: { comida: 'd5', cena: 'd7' },
    jueves: { comida: 'd6', cena: 'd9' },
    viernes: { comida: 'd8', cena: 'd2' },
    sabado: { comida: 'd10', cena: 'd4' },
    domingo: { comida: 'd1', cena: 'd7' },
  },
  [1]: {
    lunes: { comida: 'd5', cena: 'd2' },
    martes: { comida: 'd6', cena: 'd7' },
    miercoles: { comida: 'd1', cena: 'd4' },
    jueves: { comida: null, cena: null },
    viernes: { comida: null, cena: null },
    sabado: { comida: null, cena: null },
    domingo: { comida: null, cena: null },
  },
}

export const INITIAL_EXERCISES: ExerciseBase[] = [
  {
    id: 'e1',
    name: 'Press de banca plano',
    muscle: 'Pecho',
    series: 4,
    reps: '6-8',
    rest: '2:30',
    baselineWeight: '80 kg',
    baselineNotes: 'RIR 2, control escapular',
  },
  {
    id: 'e2',
    name: 'Dominadas lastradas',
    muscle: 'Espalda',
    series: 4,
    reps: '8',
    rest: '2:00',
    baselineWeight: '+12.5 kg',
    baselineNotes: 'Rango completo barbilla',
  },
  {
    id: 'e3',
    name: 'Sentadilla Hack',
    muscle: 'Pierna',
    series: 3,
    reps: '8-10',
    rest: '3:00',
    baselineWeight: '115 kg',
    baselineNotes: 'Bajada controlada 3 seg',
  },
  {
    id: 'e4',
    name: 'Press militar mancuernas',
    muscle: 'Hombro',
    series: 3,
    reps: '10-12',
    rest: '2:00',
    baselineWeight: '28 kg',
    baselineNotes: 'Sin arquear lumbar',
  },
  {
    id: 'e5',
    name: 'Remo en punta (T-Bar)',
    muscle: 'Espalda',
    series: 3,
    reps: '10',
    rest: '2:00',
    baselineWeight: '72.5 kg',
    baselineNotes: 'Codos pegados al torso',
  },
  {
    id: 'e6',
    name: 'Elevaciones laterales polea',
    muscle: 'Hombro',
    series: 4,
    reps: '12-15',
    rest: '1:15',
    baselineWeight: '12.5 kg',
    baselineNotes: '1 seg isométrico arriba',
  },
]

export const INITIAL_GYM_LOGS_BY_WEEK: Record<number, WeeklyGymLogs> = {
  [-1]: {
    e1: { weight: '82.5 kg', notes: 'RIR 1, buena pausa' },
    e2: { weight: '+15 kg', notes: 'Subir +2.5kg próx. semana' },
    e3: { weight: '120 kg', notes: 'Profundidad completa' },
    e4: { weight: '30 kg', notes: 'Controlar bajada' },
    e5: { weight: '75 kg', notes: 'Fuerte en las 3 series' },
    e6: { weight: '12.5 kg', notes: '15 reps limpias' },
  },
  [0]: {
    e1: { weight: '85 kg', notes: 'Récord limpio en serie 1' },
    e2: { weight: '', notes: '' },
    e3: { weight: '', notes: '' },
    e4: { weight: '', notes: '' },
    e5: { weight: '', notes: '' },
    e6: { weight: '', notes: '' },
  },
}

const MONTHS_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]

// Reference Monday for week 0 (12 Oct 2026)
export function getWeekMeta(weekOffset: number) {
  const baseMonday = new Date(2026, 9, 12)
  const monday = new Date(baseMonday)
  monday.setDate(baseMonday.getDate() + weekOffset * 7)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const mDay = monday.getDate()
  const sDay = sunday.getDate()
  const mMonth = MONTHS_SHORT[monday.getMonth()]
  const sMonth = MONTHS_SHORT[sunday.getMonth()]

  const dateRange =
    mMonth === sMonth
      ? `${mDay} – ${sDay} ${sMonth}`
      : `${mDay} ${mMonth} – ${sDay} ${sMonth}`

  let title = ''
  if (weekOffset === 0) title = 'Esta semana'
  else if (weekOffset === -1) title = 'Sem. pasada'
  else if (weekOffset === 1) title = 'Próx. semana'
  else if (weekOffset < -1) title = `Hace ${Math.abs(weekOffset)} sem.`
  else title = `En +${weekOffset} sem.`

  const dayDates: Record<DayKey, number> = {
    lunes: monday.getDate(),
    martes: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 1).getDate(),
    miercoles: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 2).getDate(),
    jueves: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 3).getDate(),
    viernes: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 4).getDate(),
    sabado: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 5).getDate(),
    domingo: sunday.getDate(),
  }

  return {
    title,
    dateRange,
    dayDates,
    isCurrentWeek: weekOffset === 0,
  }
}
