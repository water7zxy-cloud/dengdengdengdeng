import { useEffect, useRef, useState } from 'react'
import { coverConfig } from './config'
import { beginTypingTimeline, type TypingTimeline } from '../audio/soundtrack'

const lines = [
  { x: 550, y: 1328, width: 1100, height: 96, letters: 27 },
  { x: 550, y: 1424, width: 1100, height: 100, letters: 28 },
  { x: 550, y: 1620, width: 1100, height: 96, letters: 15 },
  { x: 550, y: 1716, width: 1100, height: 100, letters: 20 },
]

export function CoverArtwork({ onComplete }: { onComplete: () => void }) {
  const image = useRef<HTMLImageElement>(null)
  const mask = useRef<HTMLCanvasElement>(null)
  const letterEdges = useRef<number[][]>([])
  const [ready, setReady] = useState(false)

  const prepareArtwork = () => {
    const picture = image.current
    const context = mask.current?.getContext('2d', { willReadFrequently: true })
    if (!picture || !context) return
    context.drawImage(picture, 0, 0)
    letterEdges.current = lines.map((line) => {
      const { data } = context.getImageData(line.x, line.y, line.width, line.height)
      const edges: number[] = []
      let lastInk = -1
      for (let x = 0; x < line.width; x++) {
        let ink = false
        for (let y = 0; y < line.height; y++) {
          const pixel = (y * line.width + x) * 4
          if (data[pixel] < 90 && data[pixel + 1] < 90 && data[pixel + 2] < 90) { ink = true; break }
        }
        if (ink) {
          if (lastInk >= 0 && x - lastInk > 4) edges.push(lastInk + 1)
          lastInk = x
        }
      }
      if (lastInk >= 0) edges.push(line.width)
      return edges
    })
    drawMask(0)
    setReady(true)
  }

  const drawMask = (elapsed: number) => {
    const picture = image.current
    const canvas = mask.current
    const context = canvas?.getContext('2d')
    if (!picture || !canvas || !context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    let delay = 250
    for (const [index, line] of lines.entries()) {
      const edges = letterEdges.current[index] ?? []
      const count = edges.length || line.letters
      const duration = count * coverConfig.letterDurationMs
      const visibleLetters = Math.min(count, Math.max(0, Math.floor((elapsed - delay) / coverConfig.letterDurationMs)))
      const revealed = visibleLetters === 0 ? 0 : edges[visibleLetters - 1] ?? line.width
      if (revealed < line.width) {
        context.save()
        context.beginPath()
        context.rect(line.x + revealed, line.y, line.width - revealed, line.height)
        context.clip()
        // Sample the original yellow texture beside the text; reveal the original glyphs underneath.
        context.drawImage(picture, 1750, line.y, 550, line.height, line.x, line.y, line.width, line.height)
        context.restore()
      }
      delay += duration + 120
    }
  }

  useEffect(() => {
    if (!ready) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      drawMask(Infinity)
      onComplete()
      return
    }
    let frame = 0
    let timeline: TypingTimeline | null = null
    const events: number[] = []
    let delay = 250
    lines.forEach((line, index) => {
      const count = letterEdges.current[index]?.length || line.letters
      const lineDuration = count * coverConfig.letterDurationMs
      for (let at = coverConfig.letterDurationMs; at <= lineDuration; at += coverConfig.typingIntervalMs) events.push(delay + at)
      delay += lineDuration + 120
    })
    const duration = 250 + lines.reduce((total, line, index) => total + (letterEdges.current[index]?.length || line.letters) * coverConfig.letterDurationMs + 120, 0)
    const tick = () => {
      timeline ??= beginTypingTimeline(events)
      if (!timeline) { frame = requestAnimationFrame(tick); return }
      const elapsed = timeline.elapsedMs()
      drawMask(elapsed)
      if (elapsed >= duration) { timeline.cancel(); onComplete() }
      else frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); timeline?.cancel() }
  }, [ready, onComplete])

  return <>
    <img ref={image} className={`welcome-cover ${ready ? 'is-ready' : ''}`} src={coverConfig.image} alt="等灯 dengdeng：The lamps are different, but the light is the same. 一盏灯在家乡，一盏灯在远方。它可以照见自己，也可以照亮他人。" fetchPriority="high" onLoad={prepareArtwork} />
    <canvas ref={mask} className="welcome-text-mask" width={3840} height={2160} aria-hidden="true" />
  </>
}
