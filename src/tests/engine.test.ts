import { describe, expect, it } from 'vitest'
import { COLUMNS } from '../game/constants'
import {
  applyMove,
  createEmptyBoard,
  createInitialGameState,
  detectWinner,
  getDropRing,
} from '../game/engine'

describe('engine', () => {
  it('stacks inward toward the center on each radial column', () => {
    const initial = createInitialGameState()
    const afterFirst = applyMove(initial, 3)
    const afterSecond = applyMove(afterFirst, 3)

    expect(afterFirst.board[0][3]).toBe('red')
    expect(afterSecond.board[1][3]).toBe('yellow')
  })

  it('detects radial four in a row', () => {
    const board = createEmptyBoard()
    board[0][5] = 'red'
    board[1][5] = 'red'
    board[2][5] = 'red'
    board[3][5] = 'red'

    const winner = detectWinner(board)
    expect(winner?.winner).toBe('red')
  })

  it('detects ring wins that wrap around the seam', () => {
    const board = createEmptyBoard()
    board[2][12] = 'yellow'
    board[2][13] = 'yellow'
    board[2][0] = 'yellow'
    board[2][1] = 'yellow'

    const winner = detectWinner(board)
    expect(winner?.winner).toBe('yellow')
  })

  it('detects clockwise diagonal wins with column wrapping', () => {
    const board = createEmptyBoard()
    board[0][13] = 'red'
    board[1][0] = 'red'
    board[2][1] = 'red'
    board[3][2] = 'red'

    const winner = detectWinner(board)
    expect(winner?.winner).toBe('red')
  })

  it('marks full columns as unavailable', () => {
    const board = createEmptyBoard()
    for (let ring = 0; ring < board.length; ring += 1) {
      board[ring][4] = ring % 2 === 0 ? 'red' : 'yellow'
    }

    expect(getDropRing(board, 4)).toBeNull()
    expect(getDropRing(board, COLUMNS)).toBeNull()
  })
})
