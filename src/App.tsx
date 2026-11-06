import './styles.css'
import { useEffect } from 'react'
import { preloadBoardImage } from './modules/tabletop/useBoardImage'
import { useGame } from './game/useGame'
import { useSceneAudio } from './modules/audio/soundtrack'
import { Welcome } from './modules/welcome/Welcome'
import { RoleSelection, preloadRoleImages } from './modules/selection/RoleSelection'
import { LanternStart } from './modules/setup/LanternStart'
import { FirstRoll, preloadFirstRollDice } from './modules/setup/FirstRoll'
import { Tabletop } from './modules/tabletop/Tabletop'
import { Finale } from './modules/results/Finale'

export default function App() {
  const { phase, setPhase, selectedRoles, selected, players, firstRolls, activePlayer, lastDie, diceRolling, pawBurst, modal, pendingDengdeng, pendingShopBoost, chooseShopBoost, addRole, startFirstRoll, chooseLanternStart, rollForFirst, resolveCard, playRedCard, endGame } = useGame()
  useSceneAudio(phase === 'welcome' ? 'welcome' : phase === 'rules-intro' ? 'guide' : phase === 'select' || phase === 'lantern-start' || phase === 'first-roll' ? 'select' : null)
  useEffect(() => {
    if (phase === 'select') {
      void preloadFirstRollDice().catch(() => { /* Lazy import reports failures if the player proceeds. */ })
      // Avoid competing with the character portraits on slow links.
      void preloadRoleImages().then(() => preloadBoardImage())
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
    modal={modal}
    pendingDengdeng={pendingDengdeng}
    onResolve={resolveCard}
    onHelp={playRedCard}
    onFinish={endGame}
    onRestart={() => window.location.reload()}
    introGuideOpen={phase === 'rules-intro'}
    onIntroGuideExit={() => setPhase('playing')}
  />{pendingShopBoost && <div className="shop-boost-choice" role="dialog" aria-modal="true" aria-label="糖果叔叔本回合额外步数">
    <p>糖果叔叔 · 本回合额外前进</p>
    <button onClick={() => chooseShopBoost(1)}>1 格</button>
    <button onClick={() => chooseShopBoost(2)}>2 格</button>
  </div>}</>
}
