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
const INNER_FILL_FACTOR = 0.96
const SLOT_GROWTH_RATIO = 1.25

export const toRadians = (degrees: number): number => (degrees * Math.PI) / 180

export const normalizeColumn = (column: number): number => {
  return ((column % COLUMNS) + COLUMNS) % COLUMNS
}

interface NormalizedLayout {
  ringRadii: number[]
  slotRadii: number[]
  outerRadius: number
  innerHoleRadius: number
}

const buildNormalizedLayout = (): NormalizedLayout => {
  const slotRadii: number[] = []
  for (let ring = 0; ring < RINGS; ring += 1) {
    slotRadii.push(Math.pow(SLOT_GROWTH_RATIO, ring))
  }

  const ringRadii: number[] = []
  const innermostRingRadius = slotRadii[0] / (TANGENT_STEP * INNER_FILL_FACTOR)
  ringRadii.push(innermostRingRadius)

  for (let ring = 1; ring < RINGS; ring += 1) {
    ringRadii.push(ringRadii[ring - 1] + slotRadii[ring - 1] + slotRadii[ring])
  }

  const outerRadius = ringRadii[RINGS - 1] + slotRadii[RINGS - 1]
  const innerHoleRadius = ringRadii[0] - slotRadii[0]

  return { ringRadii, slotRadii, outerRadius, innerHoleRadius }
}

const NORMALIZED_LAYOUT = buildNormalizedLayout()

export const getBoardGeometry = (width: number, height: number): BoardGeometry => {
  const centerX = width / 2
  const centerY = height / 2
  const boardRadius = Math.min(width, height) * 0.48

  const scale = boardRadius / NORMALIZED_LAYOUT.outerRadius

  const ringRadii = NORMALIZED_LAYOUT.ringRadii.map((value) => value * scale)
  const slotRadii = NORMALIZED_LAYOUT.slotRadii.map((value) => value * scale)
  const holeRadius = NORMALIZED_LAYOUT.innerHoleRadius * scale

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
