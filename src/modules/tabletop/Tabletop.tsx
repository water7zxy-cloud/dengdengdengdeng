import { AnimatePresence, motion } from 'motion/react'
import { board } from '../../game/board'
import { roleFor } from '../../game/helpers'
import type { GamePlayer, CardModal } from '../../game/types'
import { CardDialog } from '../cards/CardDialog'
import { DiceOverlay } from '../dice/DiceOverlay'
import { useBoardImage } from './useBoardImage'
import './tabletop.css'

export function Tabletop({ players, activePlayer, lastDie, diceRolling, pawBurst, message, modal, pendingDengdeng, onRoll, onResolve, onHelp, onFinish, onRestart }: { players: GamePlayer[]; activePlayer: number; lastDie: number | null; diceRolling: boolean; pawBurst: boolean; message: string; modal: CardModal | null; pendingDengdeng: CardModal | null; onRoll: () => void; onResolve: (success?: boolean) => void; onHelp: (index: number) => void; onFinish: () => void; onRestart: () => void }) {
  const active = players[activePlayer]
  const mapImage = useBoardImage()
  return <main className="tabletop"><section className="board-shell"><div className="board-art"><img className="board-image" src={mapImage.src} alt="等灯游戏地图" />{mapImage.error && <p role="alert">地图加载失败，请刷新页面重试。</p>}<div className="tokens">{players.map((player, index) => { const tile = board[player.boardIndex]; return <motion.div key={player.role} className={`token-slot ${index === activePlayer ? 'active-token' : ''}`} animate={{ left: `${tile.x}%`, top: `${tile.y}%` }} transition={{ type: 'spring', stiffness: 220, damping: 19 }}><img className="token" src={roleFor(player.role).image} alt={`${player.role}棋子`} /></motion.div> })}</div><section className="score-zone">{players.map((player, index) => <article className={index === activePlayer ? 'active-player' : ''} key={player.role}><strong>{player.role}</strong><span>{player.lumens} 流明</span>{player.redCards.length > 0 && <em>红卡 × {player.redCards.length}</em>}</article>)}</section><aside className="turn-panel"><p>轮到 <strong>{active?.role}</strong></p><p>{message}</p><button className="roll-button" onClick={onRoll}>掷骰子</button><button className="finish-check" onClick={onFinish}>结算</button><button className="restart-button" onClick={onRestart}>重新开始游戏</button></aside></div></section><AnimatePresence>{diceRolling && <DiceOverlay value={lastDie} />}{pawBurst && <motion.div className="paw-burst" initial={{ opacity: 0, scale: .2, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 8 }} exit={{ opacity: 0, scale: 1.8, rotate: 30 }}>🐾</motion.div>}{modal && <CardDialog key={modal.image} modal={modal} players={players} activePlayer={activePlayer} pending={pendingDengdeng} onResolve={onResolve} onHelp={onHelp} />}</AnimatePresence></main>
}
