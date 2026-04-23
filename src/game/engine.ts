import { COLUMNS, RINGS, TOTAL_CELLS } from './constants'
import type { Board, Cell, GameState, MoveResult, Player, Position } from './types'
import { WIN_LINES } from './winLines'

const OTHER_PLAYER: Record<Player, Player> = {
  red: 'yellow',
  yellow: 'red',
}

export const createEmptyBoard = (): Board => {
  return Array.from({ length: RINGS }, () =>
    Array.from({ length: COLUMNS }, () => null as Cell),
  )
}

export const cloneBoard = (board: Board): Board => {
  return board.map((row) => [...row])
}

export const createInitialGameState = (): GameState => {
  return {
    board: createEmptyBoard(),
    currentPlayer: 'red',
    winner: null,
    winningLine: null,
    moveCount: 0,
    lastMove: null,
  }
}

export const getDropRing = (board: Board, column: number): number | null => {
  if (column < 0 || column >= COLUMNS) {
    return null
  }

  for (let ring = 0; ring < RINGS; ring += 1) {
    if (board[ring][column] === null) {
      return ring
    }
  }

  return null
}

export const getLegalMoves = (board: Board): number[] => {
  const moves: number[] = []
  for (let column = 0; column < COLUMNS; column += 1) {
    if (getDropRing(board, column) !== null) {
      moves.push(column)
    }
  }
  return moves
}

export const resolveMove = (
  board: Board,
  column: number,
  player: Player,
): MoveResult | null => {
  const dropRing = getDropRing(board, column)
  if (dropRing === null) {
    return null
  }

  const nextBoard = cloneBoard(board)
  nextBoard[dropRing][column] = player

  return {
    board: nextBoard,
    landing: { ring: dropRing, column },
  }
}

export const detectWinner = (board: Board): { winner: Player; line: Position[] } | null => {
  for (const line of WIN_LINES) {
    const first = board[line[0].ring][line[0].column]
    if (first === null) {
      continue
    }

    const isWinningLine = line.every((position) => {
      return board[position.ring][position.column] === first
    })

    if (isWinningLine) {
      return { winner: first, line }
    }
  }

  return null
}

export const applyMove = (state: GameState, column: number): GameState => {
  if (state.winner !== null) {
    return state
  }

  const move = resolveMove(state.board, column, state.currentPlayer)
  if (!move) {
    return state
  }

  const winnerInfo = detectWinner(move.board)
  const moveCount = state.moveCount + 1
  const isDraw = winnerInfo === null && moveCount >= TOTAL_CELLS

  return {
    board: move.board,
    currentPlayer:
      winnerInfo !== null || isDraw ? state.currentPlayer : OTHER_PLAYER[state.currentPlayer],
    winner: winnerInfo?.winner ?? null,
    winningLine: winnerInfo?.line ?? null,
    moveCount,
    lastMove: move.landing,
  }
}

export const isBoardFull = (board: Board): boolean => {
  return getLegalMoves(board).length === 0
}
