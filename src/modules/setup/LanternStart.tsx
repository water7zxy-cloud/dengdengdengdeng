import { nightLightStartIndexes } from '../../game/board'
import './setup.css'

export function LanternStart({ onChoose }: { onChoose: (index: number) => void }) { return <main className="setup"><h1>留灯人的起点</h1><p>选择夜灯区内的一个格子，从那里提灯出发。</p><div className="start-options">{nightLightStartIndexes.map((index) => <button key={index} onClick={() => onChoose(index)}>{index === 0 ? 'Home 家' : `夜灯区第 ${index + 1} 格`}</button>)}</div></main> }
