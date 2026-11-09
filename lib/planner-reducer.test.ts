import test from 'node:test'
import assert from 'node:assert/strict'
import { INITIAL_DISHES } from './planner-data.ts'
import {
  createInitialPlannerData,
  plannerReducer,
  type PlannerData,
} from './planner-reducer.ts'
import {
  countPlannedSlots,
  createId,
  formatProgression,
  getProgression,
  hasPlannedMeals,
  resolvePreviousLog,
  shouldOfferCopy,
} from './planner-logic.ts'

function freshData(): PlannerData {
  return createInitialPlannerData()
}

test('deleting a dish clears it from every week and the counter ignores it', () => {
  const data = freshData()
  // d2 is planned several times in weeks 0 and -1
  assert.equal(data.mealsByWeek[0].lunes.cena, 'd2')

  const next = plannerReducer(data, { type: 'dish/delete', id: 'd2' })
  assert.equal(next.dishes.some((d) => d.id === 'd2'), false)
  for (const week of Object.values(next.mealsByWeek)) {
    for (const day of Object.values(week)) {
      assert.notEqual(day.comida, 'd2')
      assert.notEqual(day.cena, 'd2')
    }
  }
  assert.equal(
    countPlannedSlots(next.mealsByWeek[0], next.dishes),
    14 - 2 // lunes and viernes dinner were d2
  )
})

test('the planned counter ignores slots whose dish no longer exists', () => {
  const week = freshData().mealsByWeek[0]
  const withoutD1 = INITIAL_DISHES.filter((d) => d.id !== 'd1')
  assert.equal(countPlannedSlots(week, INITIAL_DISHES), 14)
  assert.equal(countPlannedSlots(week, withoutD1), 12)
  assert.equal(hasPlannedMeals(undefined, INITIAL_DISHES), false)
})

test('assigning a dish creates the week when it does not exist', () => {
  const next = plannerReducer(freshData(), {
    type: 'meal/assign',
    week: 5,
    day: 'jueves',
    slot: 'cena',
    dishId: 'd4',
  })
  assert.equal(next.mealsByWeek[5].jueves.cena, 'd4')
  assert.equal(next.mealsByWeek[5].jueves.comida, null)
  assert.equal(next.mealsByWeek[5].lunes.cena, null)
})

test('copying the previous week only fills empty slots', () => {
  const data = freshData()
  // Week 1 already has lunes, martes and miercoles planned
  const before = data.mealsByWeek[1]
  const next = plannerReducer(data, {
    type: 'meal/copy-previous-week',
    week: 1,
  })
  const after = next.mealsByWeek[1]

  assert.deepEqual(after.lunes, before.lunes)
  assert.deepEqual(after.martes, before.martes)
  assert.deepEqual(after.jueves, data.mealsByWeek[0].jueves)
  assert.deepEqual(after.domingo, data.mealsByWeek[0].domingo)
})

test('copying without a previous week changes nothing', () => {
  const data = freshData()
  assert.equal(
    plannerReducer(data, { type: 'meal/copy-previous-week', week: -5 }),
    data
  )
})

test('the copy shortcut is offered only for nearly empty weeks', () => {
  assert.equal(shouldOfferCopy(0, true), true)
  assert.equal(shouldOfferCopy(5, true), true)
  assert.equal(shouldOfferCopy(6, true), false)
  assert.equal(shouldOfferCopy(0, false), false)
})

test('log updates create the entry on first write', () => {
  const next = plannerReducer(freshData(), {
    type: 'log/update',
    week: 3,
    id: 'e2',
    field: 'weight',
    value: '20 kg',
  })
  assert.deepEqual(next.gymLogsByWeek[3].e2, { weight: '20 kg', notes: '' })
})

test('updating a prescription only touches that exercise', () => {
  const data = freshData()
  const next = plannerReducer(data, {
    type: 'exercise/update-prescription',
    id: 'e1',
    series: 5,
    reps: '5',
    rest: '3:00',
  })
  const e1 = next.exercises.find((e) => e.id === 'e1')
  assert.deepEqual([e1?.series, e1?.reps, e1?.rest], [5, '5', '3:00'])
  assert.deepEqual(next.exercises[1], data.exercises[1])
})

test('previous log walks the real history, not a fixed window', () => {
  const logs = {
    [-30]: { e1: { weight: '70 kg', notes: 'old note' } },
    [-2]: { e1: { weight: '', notes: '' } },
  }
  assert.deepEqual(resolvePreviousLog(logs, -1, 'e1'), {
    weight: '70 kg',
    notes: 'old note',
  })
  assert.deepEqual(resolvePreviousLog(logs, -40, 'e1'), {
    weight: '',
    notes: '',
  })
})

test('progression is explicit about unknown, same, up and down', () => {
  assert.deepEqual(getProgression('80 kg', ''), { kind: 'unknown' })
  assert.deepEqual(getProgression('—', '80 kg'), { kind: 'unknown' })
  assert.deepEqual(getProgression('80 kg', '80'), { kind: 'same' })
  assert.deepEqual(getProgression('82.5 kg', '85 kg'), { kind: 'up', kg: 2.5 })
  assert.deepEqual(getProgression('75 kg', '72.5 kg'), {
    kind: 'down',
    kg: -2.5,
  })
  assert.equal(formatProgression({ kind: 'up', kg: 2.5 }), '+2.5 kg')
  assert.equal(formatProgression({ kind: 'down', kg: -2.5 }), '-2.5 kg')
})

test('generated ids are unique within the same millisecond', () => {
  const ids = new Set(Array.from({ length: 200 }, () => createId('d')))
  assert.equal(ids.size, 200)
})
