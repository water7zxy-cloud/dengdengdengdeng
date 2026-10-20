import { describe, expect, it } from 'vitest'
import {
  createPlayer,
  resolveDengdengDraw,
  resolveExactSceneLanding,
  resolveOfficeTurn,
  shouldFinishTurnAfterLanding,
  answersAreCorrect,
} from './rules'

describe('exact scene skills', () => {
  it('triggers 静静 only when she finishes on classroom', () => {
    const quiet = createPlayer('静静')

    expect(resolveExactSceneLanding(quiet, 'classroom')).toEqual({ type: 'reroll' })
    expect(resolveExactSceneLanding(quiet, 'playground')).toEqual({ type: 'none' })
  })

  it('arms 稻草人的 next-black-card protection only at field', () => {
    const scarecrow = createPlayer('稻草人')

    expect(resolveExactSceneLanding(scarecrow, 'field')).toEqual({ type: 'arm-scarecrow' })
    expect(resolveExactSceneLanding(scarecrow, 'office')).toEqual({ type: 'none' })
  })
})

describe('dengdeng card lifecycle', () => {
  it('keeps a red card in the drawing player hand', () => {
    const player = createPlayer('静静')

    const result = resolveDengdengDraw(player, { id: 'red-1', color: 'red', lumens: 1 }, false)

    expect(result.player.redCards).toEqual(['red-1'])
    expect(result.returnToDeck).toBe(false)
  })

  it('returns a protected black card to the deck without a penalty', () => {
    const player = createPlayer('静静')

    const result = resolveDengdengDraw(player, { id: 'black-3', color: 'black', lumens: 3 }, true)

    expect(result.player.lumens).toBe(10)
    expect(result.player.officeSkips).toBe(0)
    expect(result.scarecrowProtectionUsed).toBe(true)
    expect(result.returnToDeck).toBe(true)
  })

  it('penalizes an unprotected black card and sends the player to office for one turn', () => {
    const player = createPlayer('静静')

    const result = resolveDengdengDraw(player, { id: 'black-4', color: 'black', lumens: 4 }, false)

    expect(result.player.lumens).toBe(6)
    expect(result.player.officeSkips).toBe(1)
    expect(result.returnToDeck).toBe(true)
  })
})

describe('office turns', () => {
  it('skips exactly one office turn before allowing the player to continue', () => {
    const player = { ...createPlayer('静静'), officeSkips: 1 }

    expect(resolveOfficeTurn(player)).toMatchObject({ canRoll: false, player: { officeSkips: 0 } })
    expect(resolveOfficeTurn({ ...player, officeSkips: 0 })).toMatchObject({ canRoll: true })
  })
})

describe('turn handoff', () => {
  it('hands off after a normal landing but keeps 静静 turn for a reroll', () => {
    expect(shouldFinishTurnAfterLanding({ type: 'none' }, false)).toBe(true)
    expect(shouldFinishTurnAfterLanding({ type: 'arm-scarecrow' }, false)).toBe(true)
    expect(shouldFinishTurnAfterLanding({ type: 'reroll' }, false)).toBe(false)
    expect(shouldFinishTurnAfterLanding({ type: 'none' }, true)).toBe(false)
  })
})

describe('question card answers', () => {
  it('accepts the full answer set regardless of selection order and rejects partial answers', () => {
    expect(answersAreCorrect(['C', 'A', 'B'], ['A', 'B', 'C'])).toBe(true)
    expect(answersAreCorrect(['A', 'B'], ['A', 'B', 'C'])).toBe(false)
  })
})
