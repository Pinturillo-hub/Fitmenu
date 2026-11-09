import test from 'node:test'
import assert from 'node:assert/strict'
import {
  INITIAL_SHELL_STATE,
  shellReducer,
  type ShellEvent,
  type ShellState,
} from './shell-state.ts'

function run(events: ShellEvent[], from: ShellState = INITIAL_SHELL_STATE) {
  return events.reduce(shellReducer, from)
}

test('switching tab sets the slide direction in the same transition', () => {
  const toGym = run([{ type: 'tab/switch', tab: 'gym' }])
  assert.equal(toGym.tab, 'gym')
  assert.equal(toGym.tabDirection, 'right')

  const back = shellReducer(toGym, { type: 'tab/switch', tab: 'comidas' })
  assert.equal(back.tab, 'comidas')
  assert.equal(back.tabDirection, 'left')
})

test('switching to the active tab keeps the same state object', () => {
  const next = shellReducer(INITIAL_SHELL_STATE, {
    type: 'tab/switch',
    tab: 'comidas',
  })
  assert.equal(next, INITIAL_SHELL_STATE)
})

test('stepping weeks updates offset and direction together', () => {
  const forward = run([{ type: 'week/step', delta: 1 }])
  assert.equal(forward.weekOffset, 1)
  assert.equal(forward.weekDirection, 'next')

  const backward = shellReducer(forward, { type: 'week/step', delta: -2 })
  assert.equal(backward.weekOffset, -1)
  assert.equal(backward.weekDirection, 'prev')
})

test('resetting the week slides towards the current week', () => {
  const fromPast = run([{ type: 'week/step', delta: -3 }, { type: 'week/reset' }])
  assert.equal(fromPast.weekOffset, 0)
  assert.equal(fromPast.weekDirection, 'next')

  const fromFuture = run([{ type: 'week/step', delta: 2 }, { type: 'week/reset' }])
  assert.equal(fromFuture.weekOffset, 0)
  assert.equal(fromFuture.weekDirection, 'prev')

  assert.equal(
    shellReducer(INITIAL_SHELL_STATE, { type: 'week/reset' }),
    INITIAL_SHELL_STATE
  )
})

test('overlays open and close', () => {
  const open = run([{ type: 'overlay/open', overlay: { kind: 'settings' } }])
  assert.equal(open.overlay.kind, 'settings')

  const closed = shellReducer(open, { type: 'overlay/close' })
  assert.equal(closed.overlay.kind, 'none')

  assert.equal(
    shellReducer(INITIAL_SHELL_STATE, { type: 'overlay/close' }),
    INITIAL_SHELL_STATE
  )
})

test('tab and week navigation are ignored while an overlay is open', () => {
  const open = run([{ type: 'overlay/open', overlay: { kind: 'settings' } }])
  assert.equal(shellReducer(open, { type: 'tab/switch', tab: 'gym' }), open)
  assert.equal(shellReducer(open, { type: 'week/step', delta: 1 }), open)
  assert.equal(shellReducer(open, { type: 'week/reset' }), open)
})

test('tab overlays only open on their own tab', () => {
  assert.equal(
    shellReducer(INITIAL_SHELL_STATE, {
      type: 'overlay/open',
      overlay: { kind: 'gym-catalog' },
    }),
    INITIAL_SHELL_STATE
  )
  assert.equal(
    shellReducer(INITIAL_SHELL_STATE, {
      type: 'overlay/open',
      overlay: { kind: 'edit-prescription', exerciseId: 'e1' },
    }),
    INITIAL_SHELL_STATE
  )

  const onGym = run([{ type: 'tab/switch', tab: 'gym' }])
  assert.equal(
    shellReducer(onGym, {
      type: 'overlay/open',
      overlay: { kind: 'slot-picker', day: 'lunes', slot: 'comida' },
    }),
    onGym
  )
  assert.equal(
    shellReducer(onGym, {
      type: 'overlay/open',
      overlay: { kind: 'gym-catalog' },
    }).overlay.kind,
    'gym-catalog'
  )
})

test('the slot picker hands off to the catalog without closing first', () => {
  const picker = run([
    {
      type: 'overlay/open',
      overlay: { kind: 'slot-picker', day: 'martes', slot: 'cena' },
    },
  ])
  assert.deepEqual(picker.overlay, {
    kind: 'slot-picker',
    day: 'martes',
    slot: 'cena',
  })

  const catalog = shellReducer(picker, {
    type: 'overlay/open',
    overlay: { kind: 'meals-catalog' },
  })
  assert.equal(catalog.overlay.kind, 'meals-catalog')
})
