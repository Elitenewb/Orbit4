import type { Player } from '../game/types'

interface GameHUDProps {
  currentPlayer: Player
  winner: Player | null
  isDraw: boolean
  difficulty: number
  aiMode: boolean
  onRotateLeft: () => void
  onRotateRight: () => void
  onRestart: () => void
  onBackToMenu: () => void
}

const playerLabel = (player: Player): string => (player === 'red' ? 'Red' : 'Yellow')

export function GameHUD({
  currentPlayer,
  winner,
  isDraw,
  difficulty,
  aiMode,
  onRotateLeft,
  onRotateRight,
  onRestart,
  onBackToMenu,
}: GameHUDProps) {
  return (
    <header className="hud">
      <div className="status-panel">
        {winner ? (
          <strong>{playerLabel(winner)} wins!</strong>
        ) : isDraw ? (
          <strong>Draw game</strong>
        ) : (
          <strong>{playerLabel(currentPlayer)} turn</strong>
        )}
        {aiMode && <span>AI difficulty {difficulty}</span>}
      </div>

      <div className="hud-buttons">
        <button type="button" onClick={onRotateLeft}>
          Rotate Left
        </button>
        <button type="button" onClick={onRotateRight}>
          Rotate Right
        </button>
        <button type="button" onClick={onRestart}>
          Restart
        </button>
        <button type="button" onClick={onBackToMenu}>
          Menu
        </button>
      </div>
    </header>
  )
}
