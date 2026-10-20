import type { GamePlayer } from '../../game/types'
import { Die } from '../dice/Die'
import './setup.css'

export function FirstRoll({ players, firstRolls, lastDie, onRoll }: { players: GamePlayer[]; firstRolls: number[]; lastDie: number | null; onRoll: () => void }) { const player = players[firstRolls.length]; return <main className="setup"><h1>决定谁先出发</h1><p>{player ? `请 ${player.role} 掷骰子` : '正在确定先手'}</p><Die value={lastDie} /><button className="roll-button" disabled={!player} onClick={onRoll}>掷骰子</button><div className="first-rolls">{players.map((entry, index) => <span key={entry.role}>{entry.role}：{firstRolls[index] ?? '—'}</span>)}</div></main> }
