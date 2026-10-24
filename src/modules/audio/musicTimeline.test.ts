import { describe, expect, it } from 'vitest'
import { MusicTimeline } from './musicTimeline'

describe('continuous music timeline', () => {
  it('continues the same beat clock and changes melody only at the next bar', () => {
    const music = new MusicTimeline()
    music.request('select')
    const first = music.next(0)!
    music.request('lantern')
    const events = [first]
    for (let i = 1; i <= 8; i++) events.push(music.next(events.at(-1)!.time + .5)!)
    expect(events.map(event => event.beat)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
    expect(events.slice(1, 4).every(event => event.scene === 'select')).toBe(true)
    expect(events[4].scene).toBe('lantern')
    for (let i = 1; i < events.length; i++) {
      expect(events[i].time - events[i - 1].time).toBeCloseTo(events[i - 1].step)
    }
  })

  it('coalesces rapid page changes without starting multiple tracks', () => {
    const music = new MusicTimeline()
    music.request('select')
    const first = music.next(0)!
    music.request('lantern')
    music.request('first-roll')
    const events = [first]
    for (let i = 1; i <= 5; i++) events.push(music.next(events.at(-1)!.time + .5)!)
    expect(events[4].scene).toBe('first-roll')
    expect(events.some(event => event.scene === 'lantern')).toBe(false)
    expect(new Set(events.map(event => event.time)).size).toBe(events.length)
    expect(events[4].step - events[3].step).toBeLessThan(.03)
  })

  it('does not replay missed notes after a long background pause', () => {
    const music = new MusicTimeline()
    music.request('select')
    music.next(0)
    const next = music.next(30)!
    expect(next.time).toBeGreaterThanOrEqual(30)
    expect(music.next(30)).toBeNull()
  })
})
