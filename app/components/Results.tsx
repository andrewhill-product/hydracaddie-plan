'use client'

import { useMemo } from 'react'
import type { QuizAnswers } from '../../lib/types'
import { calculateHydrationPlan } from '../../lib/calculateHydrationPlan'

const G = {
  green:      '#1A7A3C',
  greenDark:  '#155F2E',
  greenLight: '#EAF4EE',
  white:      '#FFFFFF',
  text:       '#141414',
  muted:      '#6B7280',
  border:     '#E2E8E4',
}

export default function Results({ answers }: { answers: QuizAnswers }) {

  const plan = useMemo(() => calculateHydrationPlan(answers), [answers])

  const totalFormatted = Intl.NumberFormat('en-GB').format(plan.totalFluidMl)

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: G.white, padding: '40px 24px' }}>

      <h1 style={{
        fontSize: 28,
        fontWeight: 900,
        color: G.text,
        lineHeight: 1.2,
        marginBottom: 32,
      }}>
        Your round hydration plan
      </h1>

      {/* Card 1: Total fluid */}
      <div style={{
        background: G.greenLight,
        border: `2px solid ${G.border}`,
        borderRadius: 16,
        padding: '28px 24px',
        marginBottom: 16,
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: G.muted, letterSpacing: 1, marginBottom: 12 }}>
          TOTAL FLUID FOR YOUR ROUND
        </p>
        <p style={{ fontSize: 52, fontWeight: 900, color: G.green, lineHeight: 1 }}>
          {totalFormatted}
          <span style={{ fontSize: 22, fontWeight: 700, marginLeft: 4 }}>ml</span>
        </p>
      </div>

      {/* Card 2: Electrolytes */}
      <div style={{
        background: G.white,
        border: `2px solid ${G.border}`,
        borderRadius: 16,
        padding: '28px 24px',
        marginBottom: 16,
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: G.muted, letterSpacing: 1, marginBottom: 20 }}>
          ELECTROLYTES YOU&apos;LL LOSE
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: G.text }}>Sodium</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: G.green }}>
              {Intl.NumberFormat('en-GB').format(plan.sodiumRangeMg.min)}&ndash;{Intl.NumberFormat('en-GB').format(plan.sodiumRangeMg.max)}mg
            </span>
          </div>

          <div style={{ height: 1, background: G.border }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: G.text }}>Potassium</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: G.green }}>
              {Intl.NumberFormat('en-GB').format(plan.potassiumRangeMg.min)}&ndash;{Intl.NumberFormat('en-GB').format(plan.potassiumRangeMg.max)}mg
            </span>
          </div>

        </div>
      </div>

    </div>
  )
}
