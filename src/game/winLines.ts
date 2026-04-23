import { COLUMNS, CONNECT_LENGTH, RINGS } from './constants'
import type { Position } from './types'

const wrapColumn = (column: number): number => {
  return ((column % COLUMNS) + COLUMNS) % COLUMNS
}

const buildLine = (
  startRing: number,
  startColumn: number,
  ringDelta: number,
  columnDelta: number,
): Position[] => {
  return Array.from({ length: CONNECT_LENGTH }, (_, index) => ({
    ring: startRing + ringDelta * index,
    column: wrapColumn(startColumn + columnDelta * index),
  }))
}

const radialLines: Position[][] = []
for (let ring = 0; ring <= RINGS - CONNECT_LENGTH; ring += 1) {
  for (let column = 0; column < COLUMNS; column += 1) {
    radialLines.push(buildLine(ring, column, 1, 0))
  }
}

const ringLines: Position[][] = []
for (let ring = 0; ring < RINGS; ring += 1) {
  for (let column = 0; column < COLUMNS; column += 1) {
    ringLines.push(buildLine(ring, column, 0, 1))
  }
}

const diagonalCwLines: Position[][] = []
const diagonalCcwLines: Position[][] = []
for (let ring = 0; ring <= RINGS - CONNECT_LENGTH; ring += 1) {
  for (let column = 0; column < COLUMNS; column += 1) {
    diagonalCwLines.push(buildLine(ring, column, 1, 1))
    diagonalCcwLines.push(buildLine(ring, column, 1, -1))
  }
}

export const WIN_LINES: Position[][] = [
  ...radialLines,
  ...ringLines,
  ...diagonalCwLines,
  ...diagonalCcwLines,
]
