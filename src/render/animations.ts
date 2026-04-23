import { RINGS } from '../game/constants'
import type { AnimationState } from '../game/types'

export interface AnimationFrame {
  activeRings: number[]
  pulse: number
  done: boolean
}

export const createMoveAnimation = (
  column: number,
  targetRing: number,
  player: 'red' | 'yellow',
): AnimationState => {
  const steps = RINGS - targetRing
  return {
    active: true,
    column,
    targetRing,
    player,
    startTime: performance.now(),
    durationMs: Math.max(320, steps * 85),
  }
}

export const getAnimationFrame = (
  animation: AnimationState | null,
  now: number,
): AnimationFrame | null => {
  if (!animation || !animation.active) {
    return null
  }

  const elapsed = now - animation.startTime
  const progress = Math.min(1, elapsed / animation.durationMs)
  const ringSpan = RINGS - animation.targetRing
  const currentStep = Math.floor(progress * ringSpan)

  const activeRings: number[] = []
  for (let ring = RINGS - 1; ring >= animation.targetRing; ring -= 1) {
    if (RINGS - 1 - ring <= currentStep) {
      activeRings.push(ring)
    }
  }

  return {
    activeRings,
    pulse: 0.55 + Math.sin(elapsed / 48) * 0.25,
    done: progress >= 1,
  }
}
