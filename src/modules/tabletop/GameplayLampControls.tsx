import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { GamePlayer } from '../../game/types'
import { playLampSwitch } from '../audio/soundtrack'

type Props = {
  players: GamePlayer[]
  activePlayer: number
  onFinish: () => void
  onRestart: () => void
  onOpenGuide: () => void
}

const lampFrameCutout = 'M 100.02 8.89 L 100.73 65.08 L 95.95 64.89 L 96.33 62.65 L 99.72 62.80 L 99.23 9.10 L 96.56 4.25 L 95.87 4.84 L 94.90 3.48 L 96.22 1.61 Z'
const lampShadeCutout = 'M 96.64 6.10 L 94.42 2.74 L 90.55 4.53 L 95.89 12.40 Z'
const lampBulbCutout = 'M 93.57 7.95 C 92.01 5.52 90.49 4.04 90.18 4.66 C 89.88 5.27 90.89 7.74 92.45 10.17 C 94.01 12.60 95.52 14.08 95.83 13.46 C 96.14 12.85 95.10 10.38 93.57 7.95 Z'
const bubbleStart = [
  { x: .28, y: .14 },
  { x: .52, y: .21 },
  { x: .76, y: .15 },
  { x: .9, y: .29 },
  { x: .76, y: .41 },
]
const decorationStart = [
  { x: .18, y: .14 }, { x: .36, y: .2 }, { x: .6, y: .11 },
  { x: .82, y: .13 }, { x: .84, y: .36 }, { x: .63, y: .32 },
]
const decorationSizes = [2.5, 3.1, 2.2, 3.5, 2.8, 2.4]
const lampTriangle = [
  { x: .0656959, y: .0406435 },
  { x: .9026414, y: .0482642 },
  { x: .9585168, y: .1261643 },
  { x: .9766339, y: .6107818 },
]
const bubbleSpeed = [[36, 24], [-28, 32], [31, -29], [-25, -34], [23, 28]]
const decorationSpeed = [[-18, 22], [22, -16], [-24, 18], [20, 24], [-17, -22], [26, 14]]

export function GameplayLampControls({ players, activePlayer, onFinish, onRestart, onOpenGuide }: Props) {
  const [lampOn, setLampOn] = useState(false)
  const [showScores, setShowScores] = useState(false)
  const bubbleNodes = useRef<(HTMLButtonElement | null)[]>([])
  const decorationNodes = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (!lampOn || showScores) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const board = document.querySelector<HTMLElement>('.board-art')
    if (!board) return
    const rect = board.getBoundingClientRect()
    const buttons = bubbleNodes.current.slice(0, bubbleStart.length)
    const decorations = decorationNodes.current.slice(0, decorationStart.length)
    const nodes = [...buttons, ...decorations]
    const starts = [...bubbleStart, ...decorationStart]
    const speeds = [...bubbleSpeed, ...decorationSpeed]
    if (buttons.length !== bubbleStart.length || buttons.some(node => !node) || decorations.length !== decorationStart.length || decorations.some(node => !node)) return
    const vertices = lampTriangle.map(point => ({ x: point.x * rect.width, y: point.y * rect.height }))
    const edges = vertices.map((a, index) => ({ a, b: vertices[(index + 1) % vertices.length] }))
    const balls = nodes.map((node, index) => {
      const bounds = node!.getBoundingClientRect()
      const radius = bounds.width / 2
      return {
        node: node!,
        x: starts[index].x * rect.width,
        y: starts[index].y * rect.height,
        radius,
        vx: speeds[index][0],
        vy: speeds[index][1],
        mass: radius * radius,
      }
    })
    let animation = 0
    let previous = 0

    const keepInsideTriangle = (ball: typeof balls[number]) => {
      for (const { a, b } of edges) {
        const dx = b.x - a.x
        const dy = b.y - a.y
        const length = Math.hypot(dx, dy)
        const nx = -dy / length
        const ny = dx / length
        const distance = ((ball.x - a.x) * -dy + (ball.y - a.y) * dx) / length
        if (distance < ball.radius) {
          const correction = ball.radius - distance
          ball.x += nx * correction
          ball.y += ny * correction
          const speedIntoEdge = ball.vx * nx + ball.vy * ny
          if (speedIntoEdge < 0) {
            ball.vx -= 2 * speedIntoEdge * nx
            ball.vy -= 2 * speedIntoEdge * ny
          }
        }
      }
    }

    const animate = (time: number) => {
      const dt = previous ? Math.min((time - previous) / 1000, .035) : 0
      previous = time
      for (const ball of balls) {
        ball.x += ball.vx * dt
        ball.y += ball.vy * dt
        keepInsideTriangle(ball)
      }
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i]
          const b = balls[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const distance = Math.hypot(dx, dy) || .001
          const minimum = a.radius + b.radius
          if (distance >= minimum) continue
          const nx = dx / distance
          const ny = dy / distance
          const overlap = minimum - distance
          const totalMass = a.mass + b.mass
          a.x -= nx * overlap * (b.mass / totalMass)
          a.y -= ny * overlap * (b.mass / totalMass)
          b.x += nx * overlap * (a.mass / totalMass)
          b.y += ny * overlap * (a.mass / totalMass)
          const relativeSpeed = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
          if (relativeSpeed < 0) {
            const impulse = -2 * relativeSpeed / (1 / a.mass + 1 / b.mass)
            a.vx -= impulse / a.mass * nx
            a.vy -= impulse / a.mass * ny
            b.vx += impulse / b.mass * nx
            b.vy += impulse / b.mass * ny
          }
        }
      }
      for (const ball of balls) {
        keepInsideTriangle(ball)
        ball.node.style.left = `${ball.x}px`
        ball.node.style.top = `${ball.y}px`
      }
      animation = requestAnimationFrame(animate)
    }
    animation = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animation)
  }, [lampOn, showScores])

  const toggleLamp = () => {
    playLampSwitch()
    if (lampOn) setShowScores(false)
    setLampOn(!lampOn)
  }
  const finishGame = () => onFinish()

  return <>
    <svg className={`lamp-light ${lampOn ? 'lamp-light-on' : ''}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <mask id="lamp-shade-front-mask" maskUnits="userSpaceOnUse" mask-type="luminance" x="0" y="0" width="100" height="100">
          <rect width="100" height="100" fill="white" />
          <path d={lampFrameCutout} fill="black" />
          <path d={lampShadeCutout} fill="black" />
          <path d={lampBulbCutout} fill="black" />
        </mask>
      </defs>
      <image className="lamp-light-art" href="/assets/triangle-light-from-psd.png" x="0" y="0" width="100" height="100" preserveAspectRatio="none" mask="url(#lamp-shade-front-mask)" />
    </svg>

    <AnimatePresence>
      {lampOn && <motion.section
        className={`lamp-action-area ${showScores ? 'scores-expanded' : ''}`}
        aria-label="台灯照亮的游戏控制区"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.24, delay: 0.12 }}
      >
        {!showScores ? <>
          <div className="lamp-decorations" aria-hidden="true">
            {decorationStart.map((point, index) => <span
              key={index}
              ref={node => { decorationNodes.current[index] = node }}
              style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%`, width: `${decorationSizes[index]}%` }}
              className={`lamp-decoration lamp-decoration-${index % 4}`}
            />)}
          </div>
          <motion.button ref={node => { bubbleNodes.current[0] = node }} type="button" style={{ left: '28%', top: '14%' }} className="lamp-bubble lamp-guide" onClick={onOpenGuide}>
            <span>游戏介绍<br />指引</span>
          </motion.button>
          <motion.button ref={node => { bubbleNodes.current[1] = node }} type="button" style={{ left: '52%', top: '21%' }} className="lamp-bubble lamp-restart" onClick={onRestart}>
            <span>重新开始<br />游戏</span>
          </motion.button>
          <motion.button ref={node => { bubbleNodes.current[2] = node }} type="button" style={{ left: '76%', top: '15%' }} className="lamp-bubble lamp-finish" onClick={finishGame}>
            <span>结算<br />游戏</span>
          </motion.button>
          <motion.button ref={node => { bubbleNodes.current[3] = node }} type="button" style={{ left: '90%', top: '29%' }} className="lamp-bubble lamp-scores" onClick={() => setShowScores(true)}>
            <span>玩家<br />分数</span>
          </motion.button>
          <button ref={node => { bubbleNodes.current[4] = node }} type="button" style={{ left: '76%', top: '41%' }} className="lamp-bubble lamp-dengdeng" aria-label="等灯入口">
            <span>等灯</span>
          </button>
        </> : <>
          <div className="lamp-score-heading">本局流明</div>
          <button type="button" className="lamp-bubble lamp-score-back" onClick={() => setShowScores(false)} aria-label="返回游戏功能">
            <span>返回</span>
          </button>
          {players.map((player, index) => <motion.article
            className={`lamp-score-bubble lamp-score-${index + 1} ${index === activePlayer ? 'is-active' : ''}`}
            key={player.role}
            initial={{ opacity: 0, scale: 0.65, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18, delay: index * 0.045 }}
          >
            <strong>{player.role}</strong>
            <span>{player.lumens}<small> 流明</small></span>
            {player.redCards.length > 0 && <em>红卡 × {player.redCards.length}</em>}
          </motion.article>)}
        </>}
      </motion.section>}
    </AnimatePresence>

    <div className={`lamp-pull ${lampOn ? 'is-pulled' : ''}`}>
      <motion.span className="lamp-cord" animate={{ height: lampOn ? '34vh' : '32vh' }} transition={{ type: 'spring', stiffness: 150, damping: 20 }} />
      <motion.button
        type="button" className="lamp-pendant" onClick={toggleLamp}
        aria-label={lampOn ? '关闭台灯控制区' : '拉下吊坠，点亮游戏控制区'} aria-pressed={lampOn}
        animate={lampOn ? { rotate: [0, -5, 3, 0] } : { rotate: 0 }}
        transition={lampOn ? { duration: 0.42, ease: 'easeOut' } : { type: 'spring', stiffness: 190, damping: 14 }}
      >
        <b aria-hidden="true">PRESS ME</b>
      </motion.button>
    </div>
  </>
}
