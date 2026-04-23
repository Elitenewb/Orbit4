import { COLUMNS } from '../constants'
import { WIN_LINES } from '../winLines'
import type { Board, Player } from '../types'

const WEIGHTS = {
  two: 10,
  three: 45,
}

export const getOpponent = (player: Player): Player => {
  return player === 'red' ? 'yellow' : 'red'
}

const lineScore = (mine: number, theirs: number): number => {
  if (mine > 0 && theirs > 0) {
    return 0
  }
  if (mine === 0 && theirs === 0) {
    return 1
  }
  if (mine === 4) {
    return 100_000
  }
  if (theirs === 4) {
    return -100_000
  }
  if (mine === 3) {
    return WEIGHTS.three
  }
  if (theirs === 3) {
    return -WEIGHTS.three
  }
  if (mine === 2) {
    return WEIGHTS.two
  }
  if (theirs === 2) {
    return -WEIGHTS.two
  }
  return 0
}

const centerColumnBias = (column: number): number => {
  const center = (COLUMNS - 1) / 2
  return -Math.abs(column - center) + center
}

export const evaluateBoard = (board: Board, player: Player): number => {
  const opponent = getOpponent(player)
  let score = 0

  for (const line of WIN_LINES) {
    let mine = 0
    let theirs = 0
    for (const position of line) {
      const cell = board[position.ring][position.column]
      if (cell === player) {
        mine += 1
      } else if (cell === opponent) {
        theirs += 1
      }
    }
    score += lineScore(mine, theirs)
  }

  for (let column = 0; column < COLUMNS; column += 1) {
    let playerCount = 0
    let opponentCount = 0
    for (let ring = 0; ring < board.length; ring += 1) {
      const cell = board[ring][column]
      if (cell === player) {
        playerCount += 1
      } else if (cell === opponent) {
        opponentCount += 1
      }
    }
    score += centerColumnBias(column) * (playerCount - opponentCount)
  }

  return score
}
