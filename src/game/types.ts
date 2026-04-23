export type Player = 'red' | 'yellow'

export type Cell = Player | null

export type Board = Cell[][]

export interface Position {
  ring: number
  column: number
}

export interface MoveResult {
  board: Board
  landing: Position
}

export interface GameState {
  board: Board
  currentPlayer: Player
  winner: Player | null
  winningLine: Position[] | null
  moveCount: number
  lastMove: Position | null
}

export type GameMode = 'local' | 'ai'

export interface AnimationState {
  active: boolean
  column: number
  targetRing: number
  player: Player
  startTime: number
  durationMs: number
}
