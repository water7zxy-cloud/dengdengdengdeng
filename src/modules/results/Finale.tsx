import type { GamePlayer } from '../../game/types'
import '../setup/setup.css'
import './results.css'

export function Finale({ players, onRestart }: { players: GamePlayer[]; onRestart: () => void }) { const ranking = [...players].sort((a, b) => b.lumens - a.lumens); return <main className="setup finale"><h1>等灯结算</h1>{ranking.map((player, index) => <p key={player.role}>第 {index + 1} 名：{player.role} · {player.lumens} 流明</p>)}<button className="start-button" onClick={onRestart}>再玩一局</button></main> }
