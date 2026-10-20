import type { SceneId } from './rules'

export type TileKind = 'normal' | 'question' | 'interaction' | 'dengdeng' | 'animal' | 'scene'

export interface BoardTile {
  id: string
  x: number
  y: number
  kind: TileKind
  scene?: SceneId
}

const step = (id: string, x: number, y: number, kind: TileKind = 'normal'): BoardTile => ({ id, x, y, kind })

// Coordinates are percentages of the unchanged 5906×3543 map artwork.
export const board: BoardTile[] = [
  { id: 'home', x: 16.8, y: 28.5, kind: 'scene', scene: 'home' },
  step('out-1', 12.7, 34.9),
  step('out-2', 10.2, 40.3, 'question'),
  step('out-3', 8.5, 47.1),
  step('out-4', 7.1, 54.3, 'interaction'),
  step('out-5', 7.2, 61.9, 'dengdeng'),
  { id: 'classroom', x: 13.1, y: 77.6, kind: 'scene', scene: 'classroom' },
  step('out-6', 20.2, 79.0, 'question'),
  step('out-7', 25.7, 82.2),
  step('out-8', 31.2, 84.8, 'animal'),
  step('out-9', 37.1, 87.4, 'interaction'),
  { id: 'field', x: 48.0, y: 89.2, kind: 'scene', scene: 'field' },
  step('out-10', 58.0, 87.7, 'question'),
  step('out-11', 64.2, 89.2),
  step('out-12', 70.2, 88.6, 'dengdeng'),
  step('out-13', 76.8, 88.4, 'question'),
  { id: 'shop', x: 89.7, y: 81.6, kind: 'scene', scene: 'shop' },
  step('return-1', 88.7, 70.8, 'question'),
  step('return-2', 84.5, 66.8, 'interaction'),
  step('return-3', 79.6, 63.0),
  { id: 'office', x: 74.8, y: 62.3, kind: 'scene', scene: 'office' },
  step('return-4', 68.8, 58.0, 'dengdeng'),
  step('return-5', 63.4, 54.2),
  step('return-6', 57.0, 49.9, 'question'),
  { id: 'playground', x: 43.2, y: 42.5, kind: 'scene', scene: 'playground' },
  step('return-7', 34.9, 38.1, 'interaction'),
  step('return-8', 27.8, 34.2, 'dengdeng'),
  step('return-9', 22.3, 31.3, 'question'),
  { id: 'home-return', x: 16.8, y: 28.5, kind: 'scene', scene: 'home' },
]

export const nightLightStartIndexes = [0, 1, 2, 3, 4]

export function nextBoardIndex(index: number, steps: number, returning: boolean): number {
  const destination = index + steps
  const edge = returning ? board.length - 1 : board.findIndex((tile) => tile.id === 'shop')
  return Math.min(destination, edge)
}
