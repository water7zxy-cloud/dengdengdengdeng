export type MusicName = 'welcome' | 'select' | 'lantern' | 'first-roll' | 'guide'

export const musicProfiles = {
  welcome: { step: .62, gain: 1, notes: [72, 76, 79, 76, 74, 72, 67, null, 69, 72, 76, 74, 72, 69, 67, null] },
  select: { step: .44, gain: 1, notes: [72, 76, 79, 81, 79, 76, 74, 67, 69, 72, 76, 79, 77, 74, 72, null] },
  lantern: { step: .44, gain: 1, notes: [72, 76, 79, 81, 79, 76, 74, 67, 69, 72, 76, 79, 77, 74, 72, null] },
  'first-roll': { step: .44, gain: 1, notes: [72, 76, 79, 81, 79, 76, 74, 67, 69, 72, 76, 79, 77, 74, 72, null] },
  guide: { step: .5, gain: .82, notes: [72, 76, 79, 76, 74, 72, 69, 67, 69, 72, 76, 74, 72, 69, 67, null] },
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
    // Adopt the new scene on the next scheduled beat; keep the same clock and track.
    if (this.active !== this.requested) this.active = this.requested
    const profile = musicProfiles[this.active]
    this.step += (profile.step - this.step) * .18
    const event = { time: this.time, beat: this.beat, scene: this.active, step: this.step, gain: profile.gain, note: profile.notes[this.beat % 16] }
    this.beat++
    this.time += this.step
    return event
  }
}
