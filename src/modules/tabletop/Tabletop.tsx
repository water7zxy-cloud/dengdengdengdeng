import { AnimatePresence, motion } from 'motion/react'
import { board } from '../../game/board'
import { roleFor } from '../../game/helpers'
import type { GamePlayer, CardModal } from '../../game/types'
import { CardDialog } from '../cards/CardDialog'
import { DiceOverlay } from '../dice/DiceOverlay'
import { useBoardImage } from './useBoardImage'
import { GameplayLampControls } from './GameplayLampControls'
import { MapFocusGuide } from '../rules-guide/MapFocusGuide'
import { useState } from 'react'
import './tabletop.css'

export function Tabletop({ players, activePlayer, lastDie, diceRolling, pawBurst, modal, pendingDengdeng, onResolve, onHelp, onFinish, onRestart, introGuideOpen = false, onIntroGuideExit }: { players: GamePlayer[]; activePlayer: number; lastDie: number | null; diceRolling: boolean; pawBurst: boolean; modal: CardModal | null; pendingDengdeng: CardModal | null; onResolve: (success?: boolean) => void; onHelp: (index: number) => void; onFinish: () => void; onRestart: () => void; introGuideOpen?: boolean; onIntroGuideExit?: () => void }) {
  const [guideOpen, setGuideOpen] = useState(false)
  const mapImage = useBoardImage()
  if (!mapImage.src) return <main className="tabletop map-loading" aria-busy={!mapImage.error}>
    <img src="/assets/logo.png" alt="等灯 dengdeng" />
    {mapImage.error ? <><p role="alert">地图加载失败：{mapImage.error}</p><button onClick={mapImage.retry}>重新加载地图</button></> : <><p role="status">地图加载中 {mapImage.progress}%</p><progress max="100" value={mapImage.progress} aria-label="地图下载进度" /></>}
  </main>
  const guideVisible = introGuideOpen || guideOpen
  const closeGuide = () => {
    if (introGuideOpen) onIntroGuideExit?.()
    else setGuideOpen(false)
  }
  return <main className="tabletop">
    <section className="board-shell">
      <div className="board-art">
        <img className="board-image" src={mapImage.src} alt="等灯游戏地图" />
        {mapImage.error && <p role="alert">地图加载失败，请刷新页面重试。</p>}
        <div className="tokens">
          {players.map((player, index) => {
            const tile = board[player.boardIndex]
            return <motion.div
              key={player.role}
              className={`token-slot ${index === activePlayer ? 'active-token' : ''}`}
              animate={{ left: `${tile.x}%`, top: `${tile.y}%` }}
              transition={{ type: 'spring', stiffness: 220, damping: 19 }}
            >
              <img className="token" src={roleFor(player.role).image} alt={`${player.role}棋子`} />
            </motion.div>
          })}
        </div>
        <GameplayLampControls
          players={players}
          activePlayer={activePlayer}
          onFinish={onFinish}
          onRestart={onRestart}
          onOpenGuide={() => setGuideOpen(true)}
        />
        {guideVisible && <MapFocusGuide mode={introGuideOpen ? 'intro' : 'overlay'} onExit={closeGuide} />}
      </div>
    </section>
    <AnimatePresence>
      {diceRolling && <DiceOverlay value={lastDie} />}
      {pawBurst && <motion.div className="paw-burst" initial={{ opacity: 0, scale: .2, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 8 }} exit={{ opacity: 0, scale: 1.8, rotate: 30 }}>🐾</motion.div>}
      {modal && <CardDialog key={modal.image} modal={modal} players={players} activePlayer={activePlayer} pending={pendingDengdeng} onResolve={onResolve} onHelp={onHelp} />}
    </AnimatePresence>
  </main>
}
