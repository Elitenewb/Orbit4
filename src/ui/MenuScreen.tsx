import type { GameMode } from '../game/types'

interface MenuScreenProps {
  mode: GameMode
  difficulty: number
  onModeChange: (mode: GameMode) => void
  onDifficultyChange: (difficulty: number) => void
  onStart: () => void
}

export function MenuScreen({
  mode,
  difficulty,
  onModeChange,
  onDifficultyChange,
  onStart,
}: MenuScreenProps) {
  return (
    <div className="menu-screen">
      <h1>Circular Connect Four</h1>
      <p className="subtitle">Retro handheld vibes. Strange elegant board logic.</p>

      <div className="menu-card">
        <h2>Choose Mode</h2>
        <div className="mode-buttons" role="radiogroup" aria-label="Game mode">
          <button
            type="button"
            className={mode === 'ai' ? 'selected' : ''}
            onClick={() => onModeChange('ai')}
          >
            Play vs AI
          </button>
          <button
            type="button"
            className={mode === 'local' ? 'selected' : ''}
            onClick={() => onModeChange('local')}
          >
            Two Players
          </button>
        </div>

        {mode === 'ai' && (
          <div className="difficulty-wrap">
            <label htmlFor="difficulty">AI Difficulty: {difficulty}</label>
            <input
              id="difficulty"
              type="range"
              min={1}
              max={5}
              step={1}
              value={difficulty}
              onChange={(event) => onDifficultyChange(Number(event.target.value))}
            />
            <div className="difficulty-scale">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>
        )}

        <button type="button" className="start-button" onClick={onStart}>
          Start Game
        </button>
      </div>
    </div>
  )
}
