import { describe, expect, it } from 'vitest'
import { chooseAIMove } from '../game/ai/minimax'
import { createEmptyBoard } from '../game/engine'
import type { GameState } from '../game/types'

const buildState = (overrides: Partial<GameState>): GameState => {
  return {
    board: createEmptyBoard(),
    currentPlayer: 'yellow',
    winner: null,
    winningLine: null,
    moveCount: 0,
    lastMove: null,
    ...overrides,
  }
}

describe('ai', () => {
  it('takes an immediate winning move on max difficulty', () => {
    const board = createEmptyBoard()
    board[0][0] = 'yellow'
    board[1][0] = 'yellow'
    board[2][0] = 'yellow'

    const state = buildState({ board, currentPlayer: 'yellow' })
    const move = chooseAIMove(state, 5, () => 0.5)
    expect(move.column).toBe(0)
  })

  it('blocks an immediate opponent win on medium difficulty', () => {
    const board = createEmptyBoard()
    board[0][8] = 'red'
    board[1][8] = 'red'
    board[2][8] = 'red'

    const state = buildState({ board, currentPlayer: 'yellow' })
    const move = chooseAIMove(state, 3, () => 0.4)
    expect(move.column).toBe(8)
  })
})
