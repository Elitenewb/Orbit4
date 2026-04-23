import { useEffect, useMemo, useRef } from 'react'
import type { MouseEvent } from 'react'
import { COLUMNS, RINGS } from '../game/constants'
import type { AnimationState, Board, Position } from '../game/types'
import { getAnimationFrame } from './animations'
import {
  getBoardGeometry,
  getColumnAngle,
  getColumnFromPoint,
  getSlotGeometry,
  toRadians,
} from './geometry'

const BOARD_SIZE = 760

interface CanvasBoardProps {
  board: Board
  rotationDeg: number
  disabled: boolean
  hoverColumn: number | null
  animation: AnimationState | null
  winningLine: Position[] | null
  onHoverColumn: (column: number | null) => void
  onSelectColumn: (column: number) => void
}

const chipColor = (cell: Board[number][number]): string => {
  if (cell === 'red') {
    return '#d9575f'
  }
  if (cell === 'yellow') {
    return '#e7ca4f'
  }
  return '#6d737a'
}

const hasWinningCell = (winningLine: Position[] | null, ring: number, column: number): boolean => {
  if (!winningLine) {
    return false
  }

  return winningLine.some((position) => {
    return position.ring === ring && position.column === column
  })
}

export function CanvasBoard({
  board,
  rotationDeg,
  disabled,
  hoverColumn,
  animation,
  winningLine,
  onHoverColumn,
  onSelectColumn,
}: CanvasBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotationRad = useMemo(() => toRadians(rotationDeg), [rotationDeg])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    let frame = 0

    const draw = () => {
      const geometry = getBoardGeometry(BOARD_SIZE, BOARD_SIZE)
      const animationFrame = getAnimationFrame(animation, performance.now())

      context.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE)

      context.fillStyle = '#9ea1a3'
      context.beginPath()
      context.arc(geometry.centerX, geometry.centerY, geometry.boardRadius + 34, 0, Math.PI * 2)
      context.fill()

      context.fillStyle = '#84898d'
      context.beginPath()
      context.arc(geometry.centerX, geometry.centerY, geometry.boardRadius + 10, 0, Math.PI * 2)
      context.fill()

      context.fillStyle = '#3f454a'
      context.beginPath()
      context.arc(geometry.centerX, geometry.centerY, geometry.boardRadius, 0, Math.PI * 2)
      context.fill()

      context.fillStyle = '#252b30'
      context.beginPath()
      context.arc(geometry.centerX, geometry.centerY, geometry.holeRadius, 0, Math.PI * 2)
      context.fill()

      for (let ring = 0; ring < RINGS; ring += 1) {
        for (let column = 0; column < COLUMNS; column += 1) {
          const slot = getSlotGeometry(ring, column, geometry, rotationRad)
          const cell = board[ring][column]

          context.beginPath()
          context.arc(slot.x, slot.y, slot.radius, 0, Math.PI * 2)
          context.fillStyle = chipColor(cell)
          context.fill()

          const highlightedByColumn = hoverColumn === column && cell === null
          const highlightedByAnimation =
            animationFrame &&
            animation &&
            animation.column === column &&
            animationFrame.activeRings.includes(ring)
          const highlightedByWin = hasWinningCell(winningLine, ring, column)

          if (highlightedByAnimation) {
            context.strokeStyle = animation?.player === 'red' ? '#f38b90' : '#fff2aa'
            context.lineWidth = Math.max(2, slot.radius * 0.33)
            context.globalAlpha = animationFrame.pulse
            context.beginPath()
            context.arc(slot.x, slot.y, slot.radius * 0.86, 0, Math.PI * 2)
            context.stroke()
            context.globalAlpha = 1
          } else if (highlightedByWin) {
            context.strokeStyle = '#d8f0ff'
            context.lineWidth = Math.max(2, slot.radius * 0.3)
            context.beginPath()
            context.arc(slot.x, slot.y, slot.radius * 0.86, 0, Math.PI * 2)
            context.stroke()
          } else if (highlightedByColumn) {
            context.strokeStyle = '#b6d3de'
            context.lineWidth = 2
            context.beginPath()
            context.arc(slot.x, slot.y, slot.radius * 0.86, 0, Math.PI * 2)
            context.stroke()
          }

          context.strokeStyle = '#262c31'
          context.lineWidth = 1.5
          context.beginPath()
          context.arc(slot.x, slot.y, slot.radius, 0, Math.PI * 2)
          context.stroke()
        }
      }

      if (hoverColumn !== null) {
        const angle = getColumnAngle(hoverColumn, rotationRad)
        context.strokeStyle = '#cad7df'
        context.lineWidth = 2
        context.setLineDash([5, 7])
        context.beginPath()
        context.moveTo(
          geometry.centerX + Math.cos(angle) * geometry.holeRadius,
          geometry.centerY + Math.sin(angle) * geometry.holeRadius,
        )
        context.lineTo(
          geometry.centerX + Math.cos(angle) * geometry.boardRadius,
          geometry.centerY + Math.sin(angle) * geometry.boardRadius,
        )
        context.stroke()
        context.setLineDash([])
      }

      if (animationFrame && !animationFrame.done) {
        frame = requestAnimationFrame(draw)
      }
    }

    draw()

    return () => {
      if (frame) {
        cancelAnimationFrame(frame)
      }
    }
  }, [animation, board, hoverColumn, rotationRad, winningLine])

  const pointFromEvent = (event: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return null
    }
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * BOARD_SIZE,
      y: ((event.clientY - rect.top) / rect.height) * BOARD_SIZE,
    }
  }

  const onMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    if (disabled) {
      onHoverColumn(null)
      return
    }
    const point = pointFromEvent(event)
    if (!point) {
      return
    }
    const geometry = getBoardGeometry(BOARD_SIZE, BOARD_SIZE)
    const column = getColumnFromPoint(point.x, point.y, geometry, rotationRad)
    onHoverColumn(column)
  }

  const onMouseLeave = () => onHoverColumn(null)

  const onClick = (event: MouseEvent<HTMLCanvasElement>) => {
    if (disabled) {
      return
    }
    const point = pointFromEvent(event)
    if (!point) {
      return
    }
    const geometry = getBoardGeometry(BOARD_SIZE, BOARD_SIZE)
    const column = getColumnFromPoint(point.x, point.y, geometry, rotationRad)
    onSelectColumn(column)
  }

  return (
    <div className="board-frame">
      <canvas
        ref={canvasRef}
        width={BOARD_SIZE}
        height={BOARD_SIZE}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        role="img"
        aria-label="Circular connect four board"
      />
    </div>
  )
}
