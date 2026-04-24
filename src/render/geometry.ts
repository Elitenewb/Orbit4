import { COLUMNS, RINGS } from '../game/constants'

export interface BoardGeometry {
  centerX: number
  centerY: number
  boardRadius: number
  holeRadius: number
  ringRadii: number[]
  slotRadii: number[]
}

export interface SlotGeometry {
  x: number
  y: number
  radius: number
  angle: number
  ringRadius: number
}

const TANGENT_STEP = Math.sin(Math.PI / COLUMNS)
const FILL_FACTOR = 0.96
const EFFECTIVE_STEP = TANGENT_STEP * FILL_FACTOR
const GROWTH_RATIO = (1 + EFFECTIVE_STEP) / (1 - EFFECTIVE_STEP)

export const toRadians = (degrees: number): number => (degrees * Math.PI) / 180

export const normalizeColumn = (column: number): number => {
  return ((column % COLUMNS) + COLUMNS) % COLUMNS
}

const computeRingRadii = (boardRadius: number): number[] => {
  const lastRingRadius = boardRadius / (1 + EFFECTIVE_STEP)
  const innerRingRadius = lastRingRadius / Math.pow(GROWTH_RATIO, RINGS - 1)
  return Array.from({ length: RINGS }, (_, ring) =>
    innerRingRadius * Math.pow(GROWTH_RATIO, ring),
  )
}

export const getBoardGeometry = (width: number, height: number): BoardGeometry => {
  const centerX = width / 2
  const centerY = height / 2
  const boardRadius = Math.min(width, height) * 0.48

  const ringRadii = computeRingRadii(boardRadius)
  const slotRadii = ringRadii.map((ringRadius) => ringRadius * EFFECTIVE_STEP)
  const holeRadius = ringRadii[0] * (1 - EFFECTIVE_STEP)

  return {
    centerX,
    centerY,
    boardRadius,
    holeRadius,
    ringRadii,
    slotRadii,
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
  const ringRadius = geometry.ringRadii[ring]
  const radius = geometry.slotRadii[ring]
  const angle = getColumnAngle(column, rotationRad)
  const x = geometry.centerX + Math.cos(angle) * ringRadius
  const y = geometry.centerY + Math.sin(angle) * ringRadius

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
