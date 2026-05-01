// lib/calculateHydrationPlan.ts

import type { QuizAnswers, HydrationPlan } from './types'

// -------------------------------------------------------------------
// LOOKUP TABLES
// Adding a new option in future = add one line here. Nothing else.
// -------------------------------------------------------------------

const WEIGHT_MIDPOINTS: Record<QuizAnswers['weight'], number> = {
  'under60':  55,
  '60-70':    65,
  '70-80':    75,
  '80-90':    85,
  '90-100':   95,
  'over100':  105,
}

const DURATION_MINUTES: Record<QuizAnswers['duration'], number | null> = {
  '3h':       180,
  '4h':       240,
  '5h+':      300,
  'not-sure': null,
}

// Default duration when user picks "not sure", keyed by holes played.
// Adding 27 or 36 holes in future = add one line here.
const DEFAULT_DURATION_BY_HOLES: Record<number, number> = {
  9:  120,
  18: 240,
  27: 360,
  36: 480,
}

const INTENSITY: Record<QuizAnswers['mode'], number> = {
  'walking': 0.35,
  'buggy':   0.20,
}

const CLIMATE: Record<QuizAnswers['climate'], number> = {
  'cool': 1.0,
  'mild': 1.1,
  'warm': 1.4,
  'hot':  1.7,
}

const SWEAT: Record<QuizAnswers['sweat'], number> = {
  'low':    0.85,
  'medium': 1.0,
  'high':   1.25,
}

// -------------------------------------------------------------------
// HELPER
// -------------------------------------------------------------------

function roundToNearest50(ml: number): number {
  return Math.round(ml / 50) * 50
}

// -------------------------------------------------------------------
// MAIN FUNCTION
// -------------------------------------------------------------------

export function calculateHydrationPlan(answers: QuizAnswers): HydrationPlan {

  const weightKg = WEIGHT_MIDPOINTS[answers.weight]

  const rawDuration = DURATION_MINUTES[answers.duration]
  const durationMinutes = rawDuration !== null
    ? rawDuration
    : DEFAULT_DURATION_BY_HOLES[answers.holes]

  const blocks = durationMinutes / 15

  const baseFluidMl = weightKg * 2 * blocks

  const adjustedFluidMl =
    baseFluidMl *
    INTENSITY[answers.mode] *
    CLIMATE[answers.climate] *
    SWEAT[answers.sweat]

  const totalFluidMl = roundToNearest50(adjustedFluidMl)

  const litresLost = totalFluidMl / 1000

  return {
    totalFluidMl,
    sodiumRangeMg: {
      min: Math.round(litresLost * 500),
      max: Math.round(litresLost * 2000),
    },
    potassiumRangeMg: {
      min: Math.round(litresLost * 100),
      max: Math.round(litresLost * 500),
    },
  }
}