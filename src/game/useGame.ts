import { useMemo, useState } from 'react'
import { assetPath, blackLumens, redLumens } from './content'
import { board, nextBoardIndex, type BoardTile } from './board'
import { createPlayer, resolveDengdengDraw, resolveExactSceneLanding, resolveOfficeTurn, shouldFinishTurnAfterLanding, type RoleId } from './rules'
import type { Phase, GamePlayer, CardModal } from './types'
import { roleFor, randomCard } from './helpers'
import { randomDie } from '../modules/dice/config'

export function useGame() {
  const [phase, setPhase] = useState<Phase>('welcome')
  const [selectedRoles, setSelectedRoles] = useState<RoleId[]>([])
  const [players, setPlayers] = useState<GamePlayer[]>([])
  const [firstRolls, setFirstRolls] = useState<number[]>([])
  const [activePlayer, setActivePlayer] = useState(0)
  const [lastDie, setLastDie] = useState<number | null>(null)
  const [modal, setModal] = useState<CardModal | null>(null)
  const [scarecrowProtection, setScarecrowProtection] = useState(false)
  const [message, setMessage] = useState('点亮小灯，开始今天的旅程。')
  const [pendingDengdeng, setPendingDengdeng] = useState<CardModal | null>(null)
  const [pawBurst, setPawBurst] = useState(false)
  const [diceRolling, setDiceRolling] = useState(false)
  const [pendingShopBoost, setPendingShopBoost] = useState(false)

  const active = players[activePlayer]
  const selected = useMemo(() => selectedRoles.map(roleFor), [selectedRoles])

  const addRole = (role: RoleId) => {
    setSelectedRoles(current => current.includes(role)
      ? current.filter(id => id !== role)
      : current.length < 6 ? [...current, role] : current)
  }

  const startFirstRoll = () => {
    const roster = selectedRoles.map((role) => ({ ...createPlayer(role), boardIndex: 0, returning: false, completed: false, returnBoost: false }))
    setPlayers(roster)
    setFirstRolls([])
    setPhase(selectedRoles.includes('留灯人') ? 'lantern-start' : 'first-roll')
  }

  const chooseLanternStart = (index: number) => {
    setPlayers((current) => current.map((player) => player.role === '留灯人' ? { ...player, boardIndex: index } : player))
    setPhase('first-roll')
  }

  const rollForFirst = (roll = randomDie()) => {
    const next = [...firstRolls, roll]
    setLastDie(roll)
    setFirstRolls(next)
    if (next.length === players.length) {
      const winner = next.reduce((best, score, index) => score > next[best] ? index : best, 0)
      setActivePlayer(winner)
      setMessage(`${players[winner].role} 掷出最高点数，先行。`)
      window.setTimeout(() => setPhase('playing'), 1600)
    }
  }

  const movePlayer = (index: number, steps: number) => {
    setPlayers((current) => current.map((player, playerIndex) => {
      if (playerIndex !== index) return player
      const nextIndex = nextBoardIndex(player.boardIndex, steps, player.returning)
      const reachedShop = board[nextIndex].id === 'shop'
      const reachedHome = board[nextIndex].id === 'home-return'
      return { ...player, boardIndex: nextIndex, returning: player.returning || reachedShop, completed: player.completed || reachedHome }
    }))
  }

  const openTile = (player: GamePlayer, tile: BoardTile) => {
    let opensCard = false
    let sceneEffect = resolveExactSceneLanding(player, 'home')
    if (tile.kind === 'animal') {
      setPlayers((current) => current.map((entry) => entry.role === player.role ? { ...entry, lumens: entry.lumens + 2 } : entry))
      setMessage(`${player.role} 善待了流浪小动物，获得 2 流明。`)
      setPawBurst(true)
      window.setTimeout(() => setPawBurst(false), 950)
    }
    if (tile.kind === 'question') {
      const id = randomCard()
      opensCard = true
      setModal({ type: 'question', image: assetPath.question(id), title: '问题卡牌', lumens: 2, questionId: id })
    }
    if (tile.kind === 'interaction') {
      opensCard = true
      setModal({ type: 'interaction', image: assetPath.interaction(randomCard()), title: '互动卡牌', lumens: 2 })
    }
    if (tile.kind === 'dengdeng') {
      opensCard = true
      const color = Math.random() > 0.5 ? 'red' : 'black'
      const id = randomCard()
      const lumens = color === 'red' ? redLumens[id - 1] : blackLumens[id - 1]
      const card: CardModal = { type: 'dengdeng', image: color === 'red' ? assetPath.red(id) : assetPath.black(id), title: color === 'red' ? '红色 dengdeng 卡' : '黑色 dengdeng 卡', color, lumens, cardId: `${color}-${id}` }
      setModal(card)
      if (color === 'black') setPendingDengdeng(card)
    }
    if (tile.kind === 'scene' && tile.scene) {
      sceneEffect = resolveExactSceneLanding(player, tile.scene)
      if (sceneEffect.type === 'reroll') setMessage('静静到达教室，可以再掷一次骰子。')
      if (sceneEffect.type === 'extra-interaction') {
        opensCard = true
        setModal({ type: 'interaction', image: assetPath.interaction(randomCard()), title: '跳跳姐姐的额外互动卡', lumens: 2 })
      }
      if (sceneEffect.type === 'arm-scarecrow') {
        setScarecrowProtection(true)
        setMessage('稻草人在田野守望：下一张黑卡会被抵消。')
      }
      if (sceneEffect.type === 'extra-question') {
        const id = randomCard()
        opensCard = true
        setModal({ type: 'question', image: assetPath.question(id), title: '好好老师的额外问题卡', lumens: 2, questionId: id })
      }
      if (sceneEffect.type === 'return-boost') {
        setPendingShopBoost(true)
        setMessage('糖果叔叔抵达小卖铺：本回合请选择额外前进 1 或 2 格。')
        return false
      }
    }
    return shouldFinishTurnAfterLanding(sceneEffect, opensCard)
  }

  const finishTurn = () => {
    setPendingShopBoost(false)
    setPendingDengdeng(null)
    setModal(null)
    setLastDie(null)
    setActivePlayer((current) => (current + 1) % players.length)
  }

  const resolveCard = (success = true) => {
    if (!active || !modal) return
    if (modal.type === 'question' || modal.type === 'interaction') {
      if (success) setPlayers((current) => current.map((entry, index) => index === activePlayer ? { ...entry, lumens: entry.lumens + (modal.lumens ?? 0) } : entry))
      finishTurn()
      return
    }
    if (modal.color === 'red') {
      setPlayers((current) => current.map((entry, index) => index === activePlayer ? { ...entry, redCards: [...entry.redCards, modal.cardId!] } : entry))
      setMessage(`${active.role} 获得一张红色 dengdeng 卡。`)
      finishTurn()
      return
    }
    const outcome = resolveDengdengDraw(active, { id: modal.cardId!, color: 'black', lumens: modal.lumens ?? 0 }, scarecrowProtection)
    setPlayers((current) => current.map((entry, index) => index === activePlayer ? { ...entry, ...outcome.player } : entry))
    setScarecrowProtection((armed) => outcome.scarecrowProtectionUsed ? false : armed)
    setMessage(outcome.scarecrowProtectionUsed ? '稻草人抵消了这张黑卡，黑卡回到牌堆。' : `${active.role} 被黑卡扣除流明，并要在办公室停一轮。`)
    finishTurn()
  }

  const playRedCard = (helperIndex: number) => {
    if (!pendingDengdeng) return
    const helper = players[helperIndex]
    const redCard = helper.redCards[0]
    if (!redCard) return
    const value = redLumens[Number(redCard.split('-')[1]) - 1]
    setPlayers((current) => current.map((entry, index) => index === helperIndex ? { ...entry, redCards: entry.redCards.slice(1), lumens: entry.lumens + value } : entry))
    setMessage(`${helper.role} 打出红卡帮助同伴，获得 ${value} 流明。黑卡回到牌堆。`)
    finishTurn()
  }

  const chooseShopBoost = (steps: 1 | 2) => {
    if (!pendingShopBoost || !active || diceRolling) return
    setPendingShopBoost(false)
    setDiceRolling(true)
    movePlayer(activePlayer, steps)
    const nextIndex = nextBoardIndex(active.boardIndex, steps, true)
    window.setTimeout(() => {
      setDiceRolling(false)
      const finish = openTile({ ...active, returning: true, boardIndex: nextIndex }, board[nextIndex])
      if (finish) finishTurn()
    }, steps * 120)
  }

  const rollTurn = () => {
    if (!active || pendingShopBoost || diceRolling || modal) return
    const office = resolveOfficeTurn(active)
    if (!office.canRoll) {
      setPlayers((current) => current.map((entry, index) => index === activePlayer ? { ...entry, ...office.player } : entry))
      setMessage(`${active.role} 在办公室停留，本轮跳过。`)
      window.setTimeout(finishTurn, 650)
      return
    }
    const result = randomDie()
    setDiceRolling(true)
    setLastDie(result)
    movePlayer(activePlayer, result)
    window.setTimeout(() => {
      setDiceRolling(false)
      const updated = players[activePlayer]
      const nextIndex = nextBoardIndex(updated.boardIndex, result, updated.returning)
      const finish = openTile({ ...updated, boardIndex: nextIndex }, board[nextIndex])
      if (finish) finishTurn()
    }, result * 120)
  }

  const endGame = () => {
    const allDone = players.length > 0 && players.every((player) => player.completed)
    if (allDone) setPhase('finished')
  }

  return { phase, setPhase, selectedRoles, selected, players, firstRolls, activePlayer, lastDie, diceRolling, pawBurst, message, modal, pendingDengdeng, pendingShopBoost, chooseShopBoost, addRole, startFirstRoll, chooseLanternStart, rollForFirst, rollTurn, resolveCard, playRedCard, endGame }
}
