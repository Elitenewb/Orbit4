export interface DifficultyProfile {
  level: number
  depth: number
  noiseAmplitude: number
  candidatePool: number
  forceImmediateWin: boolean
  forceImmediateBlock: boolean
  thinkTime: [number, number]
}

const PROFILES: Record<number, DifficultyProfile> = {
  1: {
    level: 1,
    depth: 1,
    noiseAmplitude: 34,
    candidatePool: 4,
    forceImmediateWin: true,
    forceImmediateBlock: false,
    thinkTime: [220, 420],
  },
  2: {
    level: 2,
    depth: 2,
    noiseAmplitude: 22,
    candidatePool: 3,
    forceImmediateWin: true,
    forceImmediateBlock: true,
    thinkTime: [280, 520],
  },
  3: {
    level: 3,
    depth: 3,
    noiseAmplitude: 12,
    candidatePool: 2,
    forceImmediateWin: true,
    forceImmediateBlock: true,
    thinkTime: [350, 650],
  },
  4: {
    level: 4,
    depth: 4,
    noiseAmplitude: 5,
    candidatePool: 1,
    forceImmediateWin: true,
    forceImmediateBlock: true,
    thinkTime: [500, 900],
  },
  5: {
    level: 5,
    depth: 5,
    noiseAmplitude: 0,
    candidatePool: 1,
    forceImmediateWin: true,
    forceImmediateBlock: true,
    thinkTime: [700, 1100],
  },
}

export const getDifficultyProfile = (level: number): DifficultyProfile => {
  return PROFILES[level] ?? PROFILES[3]
}
