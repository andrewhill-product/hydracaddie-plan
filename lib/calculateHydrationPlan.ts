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
const DEFAULT_DURATION_BY_HOLES: Record<number, number> = {
  9:  120,
  18: 240,
}

// Base fluid rate in ml per kg of body weight per hour, anchored on
// O'Donnell et al. 2024 (Sports Medicine) golf-specific sweat rate data.
const BASELINE_ML_PER_KG_PER_HOUR: Record<QuizAnswers['mode'], number> = {
  'walking': 2.8,
  'buggy':   1.6,
}

// Multipliers calibrated against measured sweat rate variation across
// temperature ranges. Source: ACSM position stand (Sawka et al. 2007).
const CLIMATE: Record<QuizAnswers['climate'], number> = {
  '0-10':  0.85,
  '11-15': 1.0,
  '16-20': 1.2,
  '21-25': 1.4,
  '26+':   2.0,
}

const SWEAT: Record<QuizAnswers['sweat'], number> = {
  'low':    0.85,
  'shower': 0.95,
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
// BREAKDOWN (for the results page step-by-step display)
// -------------------------------------------------------------------

export interface CalcBreakdown {
  weightKg: number      // weight bucket midpoint in kg
  baseRate: number      // ml/kg/hr baseline (walking or buggy)
  climateMult: number   // climate band multiplier
  hours: number         // round duration in hours
  step1: number         // weightKg x baseRate, rounded to whole number (ml/hr before climate)
  step2: number         // step1 x climateMult, rounded to whole number (ml/hr after climate)
}

export function getCalcBreakdown(answers: QuizAnswers): CalcBreakdown {
  const weightKg = WEIGHT_MIDPOINTS[answers.weight]
  const rawDuration = DURATION_MINUTES[answers.duration]
  const durationMinutes = rawDuration !== null ? rawDuration : DEFAULT_DURATION_BY_HOLES[answers.holes]
  const hours = durationMinutes / 60
  const baseRate = BASELINE_ML_PER_KG_PER_HOUR[answers.mode]
  const climateMult = CLIMATE[answers.climate]
  const step1 = Math.round(weightKg * baseRate)
  const step2 = Math.round(step1 * climateMult)
  return { weightKg, baseRate, climateMult, hours, step1, step2 }
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

  const hours = durationMinutes / 60

  const baseline = BASELINE_ML_PER_KG_PER_HOUR[answers.mode]

  const fluidMl =
    weightKg *
    baseline *
    hours *
    CLIMATE[answers.climate] *
    SWEAT[answers.sweat]

  const totalFluidMl = roundToNearest50(fluidMl)

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