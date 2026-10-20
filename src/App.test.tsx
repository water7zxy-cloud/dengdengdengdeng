import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('welcome and role selection', () => {
  it('opens the six-role selection table only after the lamp is lit', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: '等灯 dengdeng' })).toBeInTheDocument()
    expect(screen.queryByText('静静')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '点亮小灯' }))

    expect(screen.getByText('请选择本局角色')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /选择/ })).toHaveLength(6)
  })

  it('shows the selected role description and prevents duplicate selection', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '点亮小灯' }))

    fireEvent.click(screen.getByRole('button', { name: '选择静静' }))

    expect(screen.getByText('纪律委员')).toBeInTheDocument()
    expect(screen.getByText('到达教室后，可以再掷一次骰子。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '静静已加入' })).toBeDisabled()
  })
})
