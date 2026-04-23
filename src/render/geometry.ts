import { COLUMNS, RINGS } from '../game/constants'

export interface BoardGeometry {
  centerX: number
  centerY: number
  boardRadius: number
  holeRadius: number
  ringStep: number
}

export interface SlotGeometry {
  x: number
  y: number
  radius: number
  angle: number
  ringRadius: number
}

export const toRadians = (degrees: number): number => (degrees * Math.PI) / 180

export const normalizeColumn = (column: number): number => {
  return ((column % COLUMNS) + COLUMNS) % COLUMNS
}

export const getBoardGeometry = (width: number, height: number): BoardGeometry => {
  const centerX = width / 2
  const centerY = height / 2
  const boardRadius = Math.min(width, height) * 0.44
  const holeRadius = boardRadius * 0.28
  const ringStep = (boardRadius - holeRadius) / RINGS

  return {
    centerX,
    centerY,
    boardRadius,
    holeRadius,
    ringStep,
  }
}

export const getColumnAngle = (column: number, rotationRad: number): number => {
  return -Math.PI / 2 + (normalizeColumn(column) * Math.PI * 2) / COLUMNS + rotationRad
}

export const getSlotGeometry = (
  ring: number,
  column: number,
  geometry: BoardGeometry,
  rotationRad: number,
): SlotGeometry => {
  const ringRadius = geometry.holeRadius + geometry.ringStep * (ring + 0.5)
  const angle = getColumnAngle(column, rotationRad)
  const x = geometry.centerX + Math.cos(angle) * ringRadius
  const y = geometry.centerY + Math.sin(angle) * ringRadius
  const arcLength = (Math.PI * 2 * ringRadius) / COLUMNS
  const radius = Math.min(geometry.ringStep * 0.44, arcLength * 0.42)

  return { x, y, radius, angle, ringRadius }
}

export const getColumnFromPoint = (
  x: number,
  y: number,
  geometry: BoardGeometry,
  rotationRad: number,
): number => {
  const angle = Math.atan2(y - geometry.centerY, x - geometry.centerX)
  const unrotated = angle - rotationRad + Math.PI / 2
  const normalizedAngle = ((unrotated % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  const step = (Math.PI * 2) / COLUMNS
  const nearest = Math.round(normalizedAngle / step)
  return normalizeColumn(nearest)
}
