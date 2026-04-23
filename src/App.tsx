import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { chooseAIMove } from './game/ai/minimax'
import { TOTAL_CELLS } from './game/constants'
import { applyMove, createInitialGameState, getDropRing } from './game/engine'
import type { AnimationState, GameMode, GameState, Player } from './game/types'
import { CanvasBoard } from './render/CanvasBoard'
import { createMoveAnimation } from './render/animations'
import { GameHUD } from './ui/GameHUD'
import { MenuScreen } from './ui/MenuScreen'

type Screen = 'menu' | 'game'

const AI_PLAYER: Player = 'yellow'

function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [mode, setMode] = useState<GameMode>('ai')
  const [difficulty, setDifficulty] = useState(3)
  const [gameState, setGameState] = useState<GameState>(createInitialGameState)
  const [rotationDeg, setRotationDeg] = useState(0)
  const [hoverColumn, setHoverColumn] = useState<number | null>(null)
  const [animation, setAnimation] = useState<AnimationState | null>(null)

  const aiThinkTimeoutRef = useRef<number | null>(null)
  const moveCommitTimeoutRef = useRef<number | null>(null)

  const isDraw = useMemo(
    () => gameState.winner === null && gameState.moveCount === TOTAL_CELLS,
    [gameState.moveCount, gameState.winner],
  )

  const clearTimers = () => {
    if (aiThinkTimeoutRef.current !== null) {
      window.clearTimeout(aiThinkTimeoutRef.current)
      aiThinkTimeoutRef.current = null
    }
    if (moveCommitTimeoutRef.current !== null) {
      window.clearTimeout(moveCommitTimeoutRef.current)
      moveCommitTimeoutRef.current = null
    }
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  const resetGame = () => {
    clearTimers()
    setAnimation(null)
    setHoverColumn(null)
    setRotationDeg(0)
    setGameState(createInitialGameState())
  }

  const startGame = () => {
    resetGame()
    setScreen('game')
  }

  const backToMenu = () => {
    resetGame()
    setScreen('menu')
  }

  const beginAnimatedMove = useCallback(
    (column: number): boolean => {
      if (animation !== null) {
        return false
      }

      const targetRing = getDropRing(gameState.board, column)
      if (targetRing === null) {
        return false
      }

      const moveAnimation = createMoveAnimation(column, targetRing, gameState.currentPlayer)
      setAnimation(moveAnimation)

      moveCommitTimeoutRef.current = window.setTimeout(() => {
        setGameState((prev) => applyMove(prev, column))
        setAnimation(null)
        moveCommitTimeoutRef.current = null
      }, moveAnimation.durationMs)

      return true
    },
    [animation, gameState.board, gameState.currentPlayer],
  )

  const aiTurnActive =
    screen === 'game' &&
    mode === 'ai' &&
    gameState.winner === null &&
    !isDraw &&
    gameState.currentPlayer === AI_PLAYER &&
    animation === null

  const onSelectColumn = (column: number) => {
    if (animation !== null) {
      return
    }
    if (gameState.winner !== null || isDraw || aiTurnActive) {
      return
    }

    if (mode === 'ai' && gameState.currentPlayer === AI_PLAYER) {
      return
    }

    beginAnimatedMove(column)
  }

  useEffect(() => {
    if (!aiTurnActive) {
      return
    }

    if (aiThinkTimeoutRef.current !== null) {
      return
    }

    const aiMove = chooseAIMove(gameState, difficulty)
    aiThinkTimeoutRef.current = window.setTimeout(() => {
      aiThinkTimeoutRef.current = null
      beginAnimatedMove(aiMove.column)
    }, aiMove.thinkTimeMs)

    return () => {
      if (aiThinkTimeoutRef.current !== null) {
        window.clearTimeout(aiThinkTimeoutRef.current)
        aiThinkTimeoutRef.current = null
      }
    }
  }, [aiTurnActive, beginAnimatedMove, difficulty, gameState])

  if (screen === 'menu') {
    return (
      <div className="shell">
        <MenuScreen
          mode={mode}
          difficulty={difficulty}
          onModeChange={setMode}
          onDifficultyChange={setDifficulty}
          onStart={startGame}
        />
      </div>
    )
  }

  return (
    <div className="shell">
      <GameHUD
        currentPlayer={gameState.currentPlayer}
        winner={gameState.winner}
        isDraw={isDraw}
        difficulty={difficulty}
        aiMode={mode === 'ai'}
        onRestart={resetGame}
        onBackToMenu={backToMenu}
      />

      <main className="game-surface">
        <CanvasBoard
          board={gameState.board}
          rotationDeg={rotationDeg}
          disabled={animation !== null || aiTurnActive || gameState.winner !== null || isDraw}
          hoverColumn={hoverColumn}
          animation={animation}
          winningLine={gameState.winningLine}
          onHoverColumn={setHoverColumn}
          onSelectColumn={onSelectColumn}
          onRotationChange={setRotationDeg}
        />
      </main>
    </div>
  )
}

export default App
