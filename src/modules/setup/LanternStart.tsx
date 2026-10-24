import { nightLightStartIndexes } from '../../game/board'
import { useEffect } from 'react'
import { playLanternLowering, playSoftChoiceClick } from '../audio/soundtrack'
import './setup.css'

export function LanternStart({ onChoose }: { onChoose: (index: number) => void }) {
  useEffect(() => {
    let stop: (() => void) | undefined
    const timer = window.setTimeout(() => { stop = playLanternLowering() }, 30)
    return () => { window.clearTimeout(timer); stop?.() }
  }, [])
  return <main className="setup lantern-start">
    <div className="lantern-start-heading">
      <div className="lantern-start-lamp" aria-hidden="true">
        <svg viewBox="0 0 240 220">
          <path d="M120 -2000V82" fill="none" stroke="#111" strokeWidth="3" />
          <path d="M120 82L204 165H36Z" fill="#ed1717" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="120" cy="165" rx="84" ry="14" fill="#fff200" stroke="#111" strokeWidth="3" />
          <path d="M109 163Q120 180 131 163" fill="#fff9c2" />
        </svg>
      </div>
      <span className="lantern-start-beam" aria-hidden="true" />
      <h1>留灯人请选择起点位置</h1>
      <p className="lantern-start-caption">选择夜灯区内的一个格子，从那里提灯出发。</p>
    </div>
    <div className="start-options">{nightLightStartIndexes.map(index => <button key={index} onClick={() => { playSoftChoiceClick(); onChoose(index) }}>{index === 0 ? 'Home 家' : `夜灯区第 ${index + 1} 格`}</button>)}</div>
  </main>
}
