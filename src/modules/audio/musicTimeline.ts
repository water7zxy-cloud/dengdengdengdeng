export type MusicName = 'welcome' | 'select' | 'lantern' | 'first-roll'

export const musicProfiles = {
  welcome: { step: .62, gain: 1, notes: [72, 76, 79, 76, 74, 72, 67, null, 69, 72, 76, 74, 72, 69, 67, null] },
  select: { step: .28, gain: 1, notes: [72, 76, 79, 81, 79, 76, 74, 67, 69, 72, 76, 79, 77, 74, 72, null] },
  lantern: { step: .3, gain: .85, notes: [76, 79, 81, 79, 76, 72, 74, 76, 77, 81, 79, 76, 74, 72, 71, 72] },
  'first-roll': { step: .36, gain: .8, notes: [72, 74, 76, 79, 76, 74, 72, 67, 69, 72, 74, 77, 76, 74, 71, 72] },
} satisfies Record<MusicName, { step: number; gain: number; notes: Array<number | null> }>

/** One monotonic beat clock: scene requests never create another track. */
export class MusicTimeline {
  private active: MusicName | null = null
  private requested: MusicName | null = null
  private beat = 0
  private time: number | null = null
  private step = .62

  request(scene: MusicName) {
    this.requested = scene
    if (!this.active) {
      this.active = scene
      this.step = musicProfiles[scene].step
    }
  }

  next(now: number) {
    if (!this.active || !this.requested) return null
    if (this.time === null || this.time < now - 1) this.time = now + .05
    if (this.time >= now + .12) return null
    if (this.beat % 4 === 0) this.active = this.requested
    const profile = musicProfiles[this.active]
    this.step += (profile.step - this.step) * .18
    const event = { time: this.time, beat: this.beat, scene: this.active, step: this.step, gain: profile.gain, note: profile.notes[this.beat % 16] }
    this.beat++
    this.time += this.step
    return event
  }
}
