import test from 'node:test'
import assert from 'node:assert/strict'
import {
  dockAfterScroll,
  dockAfterTouchMove,
  dockAfterWheel,
} from './dock-visibility.ts'

test('scrolling down hides the dock and scrolling up shows it', () => {
  assert.equal(dockAfterScroll(true, 100, 120), false)
  assert.equal(dockAfterScroll(false, 120, 100), true)
})

test('tiny scroll movements keep the current state', () => {
  assert.equal(dockAfterScroll(true, 100, 102), true)
  assert.equal(dockAfterScroll(false, 100, 98), false)
})

test('the dock is always visible near the top', () => {
  assert.equal(dockAfterScroll(false, 40, 5), true)
  assert.equal(dockAfterScroll(false, 10, 8), true)
})

test('wheel direction flips the dock beyond the threshold', () => {
  assert.equal(dockAfterWheel(true, 10), false)
  assert.equal(dockAfterWheel(false, -10), true)
  assert.equal(dockAfterWheel(true, 2), true)
  assert.equal(dockAfterWheel(false, -2), false)
})

test('touch moves flip the dock and move the reference point', () => {
  assert.deepEqual(dockAfterTouchMove(true, 300, 280), {
    visible: false,
    startY: 280,
  })
  assert.deepEqual(dockAfterTouchMove(false, 280, 300), {
    visible: true,
    startY: 300,
  })
  assert.deepEqual(dockAfterTouchMove(true, 300, 296), {
    visible: true,
    startY: 300,
  })
})
