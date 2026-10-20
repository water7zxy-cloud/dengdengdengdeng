import type { Player } from './rules'

export type Phase = 'welcome' | 'select' | 'lantern-start' | 'first-roll' | 'playing' | 'finished'
export type CardType = 'question' | 'interaction' | 'dengdeng'

export interface GamePlayer extends Player {
  boardIndex: number
  returning: boolean
  completed: boolean
  returnBoost: boolean
}

export interface CardModal {
  type: CardType
  image: string
  title: string
  lumens?: number
  color?: 'red' | 'black'
  cardId?: string
  questionId?: number
}
