// lib/types.ts
// This file defines the "shape" of data flowing through the tool.
// Think of it like a contract: if you write QuizAnswers, TypeScript
// knows exactly what fields to expect and will warn you if one is missing.
// This is for the galpin calc

export type HolesPlayed = 9 | 18

export type ModeOfPlay = 'walking' | 'buggy'

export type RoundDuration = '3h' | '4h' | '5h+' | 'not-sure'

export type Climate = '0-10' | '11-15' | '16-20' | '21-25' | '26+'

export type SweatRate = 'low' | 'shower' | 'medium' | 'high'

export type WeightBucket =
  | 'under60'
  | '60-70'
  | '70-80'
  | '80-90'
  | '90-100'
  | 'over100'

export type Handicap =
  | 'under10'
  | '10-18'
  | '19-28'
  | '28+'
  | 'none'

// QuizAnswers holds everything the user tells us across all 7 questions.
export interface QuizAnswers {
  holes: HolesPlayed       // Q1
  mode: ModeOfPlay         // Q2
  duration: RoundDuration  // Q3
  climate: Climate         // Q4
  sweat: SweatRate         // Q5
  weight: WeightBucket     // Q6
  handicap: Handicap       // Q7 - collected for insight only, not used in calc
}

// HydrationPlan is what the calc returns: the numbers to display on the results page.
export interface HydrationPlan {
  totalFluidMl: number
  sodiumRangeMg: { min: number; max: number }
  potassiumRangeMg: { min: number; max: number }
}