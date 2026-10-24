import { useEffect } from 'react'
import { MusicTimeline, type MusicName } from './musicTimeline'

type MusicScene = MusicName | null

export const audioLevels = { music: 1.2, typing: 0.3, button: 0.32, whoosh: 0.32 }

let context: AudioContext | null = null
let scene: MusicScene = null
let musicBus: GainNode | null = null
let scheduler: number | null = null
let timeline = new MusicTimeline()

const frequency = (note: number) => 440 * 2 ** ((note - 69) / 12)

function tone(note: number, start: number, duration: number, volume: number, destination: AudioNode, type: OscillatorType = 'sine') {
  if (!context) return
  const oscillator = context.createOscillator()
  const envelope = context.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency(note)
  envelope.gain.setValueAtTime(0, start)
  envelope.gain.linearRampToValueAtTime(volume, start + 0.018)
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(envelope)
  envelope.connect(destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.03)
  oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect() }
}

function stopMusic() {
  if (scheduler !== null) window.clearInterval(scheduler)
  scheduler = null
  if (musicBus && context) {
    const bus = musicBus
    bus.gain.cancelScheduledValues(context.currentTime)
    bus.gain.setValueAtTime(bus.gain.value, context.currentTime)
    bus.gain.linearRampToValueAtTime(0, context.currentTime + 1.6)
    window.setTimeout(() => bus.disconnect(), 2500)
  }
  musicBus = null
}

function startMusic() {
  if (!context || context.state !== 'running' || !scene || scheduler !== null || document.hidden) return
  const bus = context.createGain()
  bus.gain.setValueAtTime(0, context.currentTime)
  bus.connect(context.destination)
  musicBus = bus
  let previousGain = -1
  const schedule = () => {
    if (!context || context.state !== 'running' || document.hidden) return
    let event = timeline.next(context.currentTime)
    while (event) {
      const { time: nextBeat, beat, step, note, gain } = event
      const gentle = event.scene === 'welcome'
      if (gain !== previousGain) {
        bus.gain.setTargetAtTime(audioLevels.music * gain, nextBeat, .45)
        previousGain = gain
      }
      if (note !== null) {
        tone(note, nextBeat, gentle ? 1.25 : 0.42, 0.24, bus)
        tone(note + 12, nextBeat, 0.3, 0.025, bus)
      }
      if (beat % 4 === 0) {
        const root = [48, 45, 53, 55][Math.floor(beat / 4) % 4]
        if (gentle) {
          for (const offset of [0, 7, 16]) tone(root + offset, nextBeat, 2.1, 0.07, bus)
        } else {
          tone(root, nextBeat, 0.45, 0.2, bus, 'triangle')
          tone(root + 7, nextBeat + step, 0.25, 0.06, bus)
        }
      }
      event = timeline.next(context.currentTime)
    }
  }
  schedule()
  scheduler = window.setInterval(schedule, 60)
}

function enableAudio() {
  if (!context) {
    if (!window.AudioContext) return
    context = new AudioContext()
    context.onstatechange = () => {
      if (context?.state === 'running') startMusic()
    }
  }
  if (context.state === 'running') startMusic()
  else void context.resume().then(startMusic).catch(() => { /* Retry at the next user gesture. */ })
}

export function useSceneAudio(nextScene: MusicScene) {
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) stopMusic()
      else enableAudio()
    }
    document.addEventListener('pointerdown', enableAudio, { passive: true })
    document.addEventListener('keydown', enableAudio)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('pointerdown', enableAudio)
      document.removeEventListener('keydown', enableAudio)
      document.removeEventListener('visibilitychange', onVisibility)
      scene = null
      stopMusic()
      timeline = new MusicTimeline()
    }
  }, [])

  useEffect(() => {
    scene = nextScene
    if (nextScene) {
      timeline.request(nextScene)
      enableAudio()
    } else {
      stopMusic()
      timeline = new MusicTimeline()
    }
  }, [nextScene])
}

function scheduleTypingSound(now: number): () => void {
  if (!context || context.state !== 'running') return () => {}
  const sources: AudioBufferSourceNode[] = []
  const noise = context.createBuffer(1, Math.ceil(context.sampleRate * 0.065), context.sampleRate)
  const samples = noise.getChannelData(0)
  for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * Math.exp(-i / (context.sampleRate * 0.016))
  // A short metal strike followed by the quieter key return: no pitched musical notes.
  for (const [delay, frequency, level] of [[0, 1950, 1], [0.035, 1050, 0.5]]) {
    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const envelope = context.createGain()
    filter.type = 'bandpass'
    filter.frequency.value = frequency
    filter.Q.value = 0.65
    envelope.gain.setValueAtTime(audioLevels.typing * level, now + delay)
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.065)
    source.buffer = noise
    source.connect(filter)
    filter.connect(envelope)
    envelope.connect(context.destination)
    source.start(now + delay)
    sources.push(source)
    source.onended = () => { source.disconnect(); filter.disconnect(); envelope.disconnect() }
  }
  return () => { for (const source of sources) { try { source.stop() } catch { /* Already finished. */ } } }
}

export interface TypingTimeline {
  elapsedMs: () => number
  cancel: () => void
}

export function beginTypingTimeline(eventsMs: number[]): TypingTimeline | null {
  if (!window.AudioContext) {
    const start = performance.now()
    return { elapsedMs: () => performance.now() - start, cancel: () => {} }
  }
  if (!context || context.state !== 'running') return null
  const audio = context
  const start = audio.currentTime + 0.12
  const stops: Array<() => void> = []
  let next = 0
  const schedule = () => {
    if (audio.state !== 'running') return
    while (next < eventsMs.length && start + eventsMs[next] / 1000 < audio.currentTime + 0.18) {
      const at = start + eventsMs[next++] / 1000
      if (at >= audio.currentTime && !document.hidden) stops.push(scheduleTypingSound(at))
    }
  }
  schedule()
  const timer = window.setInterval(schedule, 25)
  return {
    elapsedMs: () => {
      const outputTime = audio.getOutputTimestamp?.().contextTime
      const audibleTime = typeof outputTime === 'number' && outputTime > 0 ? outputTime : Math.max(0, audio.currentTime - audio.baseLatency)
      return Math.max(0, (audibleTime - start) * 1000)
    },
    cancel: () => { window.clearInterval(timer); stops.forEach(stop => stop()) },
  }
}

export function playBulbWhoosh() {
  if (!context || context.state !== 'running' || document.hidden) return
  const now = context.currentTime
  const duration = 0.62
  const noise = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate)
  const samples = noise.getChannelData(0)
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const envelope = context.createGain()
  filter.type = 'bandpass'
  filter.Q.value = 0.8
  filter.frequency.setValueAtTime(280, now)
  filter.frequency.exponentialRampToValueAtTime(2800, now + 0.36)
  filter.frequency.exponentialRampToValueAtTime(650, now + duration)
  envelope.gain.setValueAtTime(0.0001, now)
  envelope.gain.exponentialRampToValueAtTime(audioLevels.whoosh, now + 0.24)
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  source.buffer = noise
  source.connect(filter)
  filter.connect(envelope)
  envelope.connect(context.destination)
  source.start(now)
  source.onended = () => { source.disconnect(); filter.disconnect(); envelope.disconnect() }
}

export function playButtonSound() {
  enableAudio()
  if (!context) return
  const now = context.currentTime
  tone(79, now, 0.07, audioLevels.button, context.destination, 'triangle')
  tone(84, now + 0.045, 0.15, audioLevels.button * 0.55, context.destination)
}

function softNoise(duration: number, peak: number, fromHz: number, toHz: number) {
  enableAudio()
  if (!context || document.hidden) return () => {}
  const audio = context
  const now = audio.currentTime + .015
  const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * duration), audio.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1
  const source = audio.createBufferSource()
  const filter = audio.createBiquadFilter()
  const lowpass = audio.createBiquadFilter()
  const envelope = audio.createGain()
  source.buffer = buffer
  filter.type = 'bandpass'
  filter.Q.value = .65
  filter.frequency.setValueAtTime(fromHz, now)
  filter.frequency.exponentialRampToValueAtTime(toHz, now + duration)
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 1800
  envelope.gain.setValueAtTime(.0001, now)
  envelope.gain.exponentialRampToValueAtTime(peak, now + duration * .3)
  envelope.gain.exponentialRampToValueAtTime(.0001, now + duration)
  source.connect(filter)
  filter.connect(lowpass)
  lowpass.connect(envelope)
  envelope.connect(audio.destination)
  source.start(now)
  source.onended = () => { source.disconnect(); filter.disconnect(); lowpass.disconnect(); envelope.disconnect() }
  return () => { try { source.stop() } catch { /* Sound already ended. */ } }
}

export function playCardFlip() {
  softNoise(.38, .72, 1400, 480)
}

export function playLanternLowering() {
  return softNoise(1.05, .17, 700, 230)
}

export function playSoftChoiceClick() {
  enableAudio()
  if (!context || document.hidden) return
  const now = context.currentTime + .01
  tone(60, now, .13, .19, context.destination, 'triangle')
  tone(67, now + .025, .2, .08, context.destination)
}
