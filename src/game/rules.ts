export type RoleId = '静静' | '跳跳姐姐' | '稻草人' | '好好老师' | '糖果叔叔' | '留灯人'
export type SceneId = 'home' | 'classroom' | 'playground' | 'field' | 'office' | 'shop'

export interface Player {
  role: RoleId
  lumens: number
  redCards: string[]
  officeSkips: number
}

export interface DengdengCard {
  id: string
  color: 'red' | 'black'
  lumens: number
}

export type LandingEffect =
  | { type: 'none' }
  | { type: 'reroll' }
  | { type: 'extra-interaction' }
  | { type: 'arm-scarecrow' }
  | { type: 'extra-question' }
  | { type: 'return-boost' }

export function createPlayer(role: RoleId): Player {
  return { role, lumens: 10, redCards: [], officeSkips: 0 }
}

export function resolveExactSceneLanding(player: Player, scene: SceneId): LandingEffect {
  const matchingScene: Record<RoleId, SceneId> = {
    静静: 'classroom',
    跳跳姐姐: 'playground',
    稻草人: 'field',
    好好老师: 'office',
    糖果叔叔: 'shop',
    留灯人: 'home',
  }

  if (matchingScene[player.role] !== scene) return { type: 'none' }

  const effectByRole: Record<RoleId, LandingEffect> = {
    静静: { type: 'reroll' },
    跳跳姐姐: { type: 'extra-interaction' },
    稻草人: { type: 'arm-scarecrow' },
    好好老师: { type: 'extra-question' },
    糖果叔叔: { type: 'return-boost' },
    留灯人: { type: 'none' },
  }

  return effectByRole[player.role]
}

export function resolveDengdengDraw(player: Player, card: DengdengCard, scarecrowProtection: boolean) {
  if (card.color === 'red') {
    return {
      player: { ...player, redCards: [...player.redCards, card.id] },
      returnToDeck: false,
      scarecrowProtectionUsed: false,
    }
  }

  if (scarecrowProtection) {
    return { player, returnToDeck: true, scarecrowProtectionUsed: true }
  }

  return {
    player: { ...player, lumens: Math.max(0, player.lumens - card.lumens), officeSkips: 1 },
    returnToDeck: true,
    scarecrowProtectionUsed: false,
  }
}

export function resolveOfficeTurn(player: Player) {
  if (player.officeSkips > 0) {
    return { canRoll: false, player: { ...player, officeSkips: player.officeSkips - 1 } }
  }

  return { canRoll: true, player }
}

export function shouldFinishTurnAfterLanding(effect: LandingEffect, opensCard: boolean): boolean {
  return !opensCard && effect.type !== 'reroll'
}

export function answersAreCorrect(selected: string[], expected: string[]): boolean {
  return selected.length === expected.length && [...selected].sort().every((answer, index) => answer === [...expected].sort()[index])
}
