import './styles.css'
import { useEffect } from 'react'
import { preloadBoardImage } from './modules/tabletop/useBoardImage'
import { useGame } from './game/useGame'
import { useSceneAudio } from './modules/audio/soundtrack'
import { Welcome } from './modules/welcome/Welcome'
import { RoleSelection } from './modules/selection/RoleSelection'
import { LanternStart } from './modules/setup/LanternStart'
import { FirstRoll, preloadFirstRollDice } from './modules/setup/FirstRoll'
import { Tabletop } from './modules/tabletop/Tabletop'
import { Finale } from './modules/results/Finale'

export default function App() {
  const { phase, setPhase, selectedRoles, selected, players, firstRolls, activePlayer, lastDie, diceRolling, pawBurst, message, modal, pendingDengdeng, pendingShopBoost, chooseShopBoost, addRole, startFirstRoll, chooseLanternStart, rollForFirst, rollTurn, resolveCard, playRedCard, endGame } = useGame()
  useSceneAudio(phase === 'welcome' ? 'welcome' : phase === 'select' ? 'select' : phase === 'lantern-start' ? 'lantern' : phase === 'first-roll' ? 'first-roll' : null)
  useEffect(() => {
    if (phase === 'select') {
      void preloadBoardImage()
      void preloadFirstRollDice().catch(() => { /* Lazy import reports failures if the player proceeds. */ })
    }
  }, [phase])

  if (phase === 'welcome') return <Welcome onStart={() => setPhase('select')} />

  if (phase === 'select') return <RoleSelection selectedIds={selectedRoles} onToggleRole={addRole} onStart={startFirstRoll} />

  if (phase === 'lantern-start') return <LanternStart onChoose={chooseLanternStart} />

  if (phase === 'first-roll') return <FirstRoll players={players} firstRolls={firstRolls} lastDie={lastDie} onRoll={rollForFirst} />

  if (phase === 'finished') return <Finale players={players} onRestart={() => window.location.reload()} />

  return <><Tabletop
    players={players}
    activePlayer={activePlayer}
    lastDie={lastDie}
    diceRolling={diceRolling}
    pawBurst={pawBurst}
    message={message}
    modal={modal}
    pendingDengdeng={pendingDengdeng}
    onRoll={rollTurn}
    onResolve={resolveCard}
    onHelp={playRedCard}
    onFinish={endGame}
    onRestart={() => window.location.reload()}
  />{pendingShopBoost && <div className="shop-boost-choice" role="dialog" aria-modal="true" aria-label="糖果叔叔本回合额外步数">
    <p>糖果叔叔 · 本回合额外前进</p>
    <button onClick={() => chooseShopBoost(1)}>1 格</button>
    <button onClick={() => chooseShopBoost(2)}>2 格</button>
  </div>}</>
}
