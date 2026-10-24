import type { GamePlayer } from '../../game/types'
import { lazy, Suspense, useRef, useState } from 'react'
import { playSoftChoiceClick } from '../audio/soundtrack'
import { randomDie } from '../dice/config'
import './setup.css'
import './first-roll.css'
let diceModule: ReturnType<typeof importDice> | undefined
function importDice() { return import('../dice/ThreeDie') }
export function preloadFirstRollDice() { return diceModule ??= importDice() }
const ThreeDie = lazy(preloadFirstRollDice)

export function FirstRoll({ players, firstRolls, lastDie, onRoll }: { players: GamePlayer[]; firstRolls: number[]; lastDie: number | null; onRoll: (value: number) => void }) {
  const [rolling, setRolling] = useState(false)
  const [displayValue, setDisplayValue] = useState(lastDie ?? 2)
  const [ready, setReady] = useState(false)
  const pendingResult = useRef<number | null>(null)
  const busy = useRef(false)
  const player = players[firstRolls.length]
  const roll = () => {
    if (!player || busy.current || !ready) return
    busy.current = true
    playSoftChoiceClick()
    const result = randomDie()
    pendingResult.current = result
    setDisplayValue(result)
    setRolling(true)
  }
  const settle = () => {
    if (!busy.current || pendingResult.current === null) return
    const result = pendingResult.current
    pendingResult.current = null
    busy.current = false
    setRolling(false)
    onRoll(result)
  }
  return <main className="first-roll-page">
    <header className="first-roll-heading"><h1>决定谁先出发</h1><p lang="en">Please roll the dice.</p></header>
    <section className="first-roll-results" aria-label="玩家投掷结果" aria-live="polite">
      {players.map((entry, index) => <article key={entry.role} className={`first-roll-player ${index % 2 ? 'on-right' : 'on-left'} ${entry.role === player?.role ? 'is-current' : ''}`} style={{ gridRow: Math.floor(index / 2) + 1 }}>
        <span>{entry.role}</span><strong>{firstRolls[index] ?? '—'}</strong>
      </article>)}
    </section>
    <div className="first-roll-floor" aria-hidden="true"><div /></div>
    <div className="first-roll-die-stage">
      <Suspense fallback={<span role="status">骰子准备中…</span>}><ThreeDie value={displayValue} rolling={rolling} onReady={() => setReady(true)} onSettled={settle} /></Suspense>
    </div>
    <div className="first-roll-controls"><p>{rolling ? `${player?.role} 正在掷骰子` : player ? `请 ${player.role} 掷骰子` : '正在确定先手'}</p><button className="roll-button" disabled={!player || rolling || !ready} onClick={roll}>掷骰子</button></div>
  </main>
}
