import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useSceneAudio } from './soundtrack'

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

it('uses one output bus and one beat scheduler across all three game preparation pages', () => {
  vi.useFakeTimers()
  let outputBuses = 0
  const destination = {}
  const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {} })
  class AudioContextDouble {
    state = 'running'
    destination = destination
    get currentTime() { return Date.now() / 1000 }
    createGain() {
      return { gain: param(), connect(node: unknown) { if (node === destination) outputBuses++ }, disconnect() {} }
    }
    createOscillator() { return { type: 'sine', frequency: param(), connect() {}, start() {}, stop() {}, disconnect() {} } }
  }
  vi.stubGlobal('AudioContext', AudioContextDouble)
  const { rerender, unmount } = renderHook(({ scene }: { scene: 'select' | 'lantern' | 'first-roll' }) => useSceneAudio(scene), { initialProps: { scene: 'select' } })
  act(() => vi.advanceTimersByTime(1500))
  rerender({ scene: 'lantern' })
  act(() => vi.advanceTimersByTime(1500))
  rerender({ scene: 'first-roll' })
  act(() => vi.advanceTimersByTime(2000))
  expect(outputBuses).toBe(1)
  expect(vi.getTimerCount()).toBe(1)
  unmount()
  act(() => vi.runOnlyPendingTimers())
  expect(vi.getTimerCount()).toBe(0)
})
