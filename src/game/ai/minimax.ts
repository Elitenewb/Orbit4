import { applyMove, getLegalMoves } from '../engine'
import type { GameState, Player } from '../types'
import { getDifficultyProfile } from './difficulty'
import { evaluateBoard, getOpponent } from './evaluate'

interface ScoredMove {
  column: number
  score: number
}

interface SearchResult {
  score: number
  move: number | null
}

const WIN_SCORE = 900_000

const randomBetween = (min: number, max: number, rng: () => number): number => {
  return Math.floor(min + rng() * (max - min))
}

const hasImmediateWin = (state: GameState, player: Player, column: number): boolean => {
  const next = {
    ...state,
    currentPlayer: player,
  }
  const after = applyMove(next, column)
  return after.winner === player
}

const findForcedMove = (
  state: GameState,
  player: Player,
  shouldBlock: boolean,
): number | null => {
  const legalMoves = getLegalMoves(state.board)

  for (const column of legalMoves) {
    if (hasImmediateWin(state, player, column)) {
      return column
    }
  }

  if (!shouldBlock) {
    return null
  }

  const opponent = getOpponent(player)
  for (const column of legalMoves) {
    if (hasImmediateWin(state, opponent, column)) {
      return column
    }
  }

  return null
}

const terminalScore = (state: GameState, perspective: Player, depth: number): number | null => {
  if (state.winner === perspective) {
    return WIN_SCORE + depth
  }
  if (state.winner === getOpponent(perspective)) {
    return -WIN_SCORE - depth
  }
  return null
}

const orderMoves = (state: GameState, perspective: Player, moves: number[]): number[] => {
  return [...moves].sort((a, b) => {
    const scoreA = evaluateBoard(applyMove(state, a).board, perspective)
    const scoreB = evaluateBoard(applyMove(state, b).board, perspective)
    return scoreB - scoreA
  })
}

const minimax = (
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  perspective: Player,
): SearchResult => {
  const terminal = terminalScore(state, perspective, depth)
  if (terminal !== null) {
    return { score: terminal, move: null }
  }
  if (depth === 0) {
    return { score: evaluateBoard(state.board, perspective), move: null }
  }

  const legalMoves = getLegalMoves(state.board)
  if (legalMoves.length === 0) {
    return { score: 0, move: null }
  }

  const orderedMoves = orderMoves(state, perspective, legalMoves)
  let bestMove: number | null = orderedMoves[0] ?? null

  if (maximizing) {
    let bestScore = -Infinity
    for (const move of orderedMoves) {
      const childState = applyMove(state, move)
      const result = minimax(childState, depth - 1, alpha, beta, false, perspective)
      if (result.score > bestScore) {
        bestScore = result.score
        bestMove = move
      }
      alpha = Math.max(alpha, bestScore)
      if (beta <= alpha) {
        break
      }
    }
    return { score: bestScore, move: bestMove }
  }

  let bestScore = Infinity
  for (const move of orderedMoves) {
    const childState = applyMove(state, move)
    const result = minimax(childState, depth - 1, alpha, beta, true, perspective)
    if (result.score < bestScore) {
      bestScore = result.score
      bestMove = move
    }
    beta = Math.min(beta, bestScore)
    if (beta <= alpha) {
      break
    }
  }
  return { score: bestScore, move: bestMove }
}

const rankMoves = (state: GameState, player: Player, depth: number): ScoredMove[] => {
  const legalMoves = getLegalMoves(state.board)
  return legalMoves
    .map((column) => {
      const nextState = applyMove(state, column)
      const result = minimax(nextState, depth - 1, -Infinity, Infinity, false, player)
      return { column, score: result.score }
    })
    .sort((a, b) => b.score - a.score)
}

const pickFromCandidates = (
  ranked: ScoredMove[],
  candidatePool: number,
  noiseAmplitude: number,
  rng: () => number,
): number => {
  const candidates = ranked.slice(0, Math.min(candidatePool, ranked.length))
  const noisy = candidates
    .map((entry) => ({
      ...entry,
      noisyScore: entry.score + (rng() * 2 - 1) * noiseAmplitude,
    }))
    .sort((a, b) => b.noisyScore - a.noisyScore)

  return noisy[0].column
}

export const chooseAIMove = (
  state: GameState,
  difficulty: number,
  rng: () => number = Math.random,
): { column: number; thinkTimeMs: number } => {
  const profile = getDifficultyProfile(difficulty)
  const player = state.currentPlayer
  const legalMoves = getLegalMoves(state.board)

  if (legalMoves.length === 0) {
    return { column: 0, thinkTimeMs: 0 }
  }

  const forced = findForcedMove(state, player, profile.forceImmediateBlock)
  if (forced !== null && profile.forceImmediateWin) {
    return {
      column: forced,
      thinkTimeMs: randomBetween(profile.thinkTime[0], profile.thinkTime[1], rng),
    }
  }

  const ranked = rankMoves(state, player, profile.depth)
  const column = pickFromCandidates(
    ranked,
    profile.candidatePool,
    profile.noiseAmplitude,
    rng,
  )

  return {
    column,
    thinkTimeMs: randomBetween(profile.thinkTime[0], profile.thinkTime[1], rng),
  }
}
