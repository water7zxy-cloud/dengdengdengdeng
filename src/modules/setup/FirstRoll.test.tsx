import { useEffect } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FirstRoll } from './FirstRoll'
import { createPlayer } from '../../game/rules'

vi.mock('../dice/ThreeDie', () => ({ default: ({ value, rolling, onReady, onSettled }: { value: number; rolling: boolean; onReady: () => void; onSettled: () => void }) => {
  useEffect(() => { onReady() }, [])
  return <div><span role="img" aria-label={`3D结果 ${value}`} /><button disabled={!rolling} onClick={onSettled}>模拟 GPU 动画完成</button></div>
} }))
vi.mock('../audio/soundtrack', () => ({ playSoftChoiceClick() {} }))
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('first roll animation handoff', () => {
  it('commits exactly the visible result only when the animation settles, ignoring double clicks', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(.55)
    const results: number[] = []
    render(<FirstRoll players={[{ ...createPlayer('静静'), boardIndex: 0, completed: false, returning: false, returnBoost: false }]} firstRolls={[]} lastDie={null} onRoll={value => results.push(value)} />)
    const button = await screen.findByRole('button', { name: '掷骰子' })
    await screen.findByRole('img', { name: '3D结果 2' })
    await waitFor(() => expect(button).toBeEnabled())
    fireEvent.click(button)
    fireEvent.click(button)
    expect(button).toBeDisabled()
    expect(screen.getByRole('img', { name: '3D结果 4' })).toBeInTheDocument()
    expect(results).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: '模拟 GPU 动画完成' }))
    expect(results).toEqual([4])
    expect(button).toBeEnabled()
  })
})
