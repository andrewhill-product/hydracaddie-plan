'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { QuizAnswers } from '../../lib/types'
import { calculateHydrationPlan, getCalcBreakdown } from '../../lib/calculateHydrationPlan'

const G = {
  green:      '#1A7A3C',
  greenDark:  '#155F2E',
  greenMid:   '#2A9B52',
  greenLight: '#EAF4EE',
  white:      '#FFFFFF',
  text:       '#141414',
  muted:      '#6B7280',
  border:     '#E2E8E4',
}

// Human-readable labels used in the "How we calculated this" inputs section.
// Adding a new answer option = one line here, nothing else.
const MODE_LABEL: Record<string, string> = {
  walking: 'Walking',
  buggy:   'Buggy',
}
const CLIMATE_LABEL: Record<string, string> = {
  '0-10':  '0-10°C',
  '11-15': '11-15°C',
  '16-20': '16-20°C',
  '21-25': '21-25°C',
  '26+':   '26°C+',
}

type Checkpoint = {
  emoji: string
  label: string
  subtitle: string
  action: string
  body: string
}

// Post-round uses the 150% rehydration rule: replace 1.5x fluid needs after exercise.
function buildCheckpoints18(totalFluidMl: number): Checkpoint[] {
  const front9Ml    = Math.round(totalFluidMl / 2 / 50) * 50
  const postRoundMl = Math.round(totalFluidMl * 1.5 / 50) * 50

  return [
    {
      emoji:    '🏠',
      label:    'Pre-round',
      subtitle: 'Before the first tee',
      action:   'Mix one sachet in 500ml water',
      body:     'Make sure your body is hydrated before you reach the first tee. We recommend having a sachet of electrolytes in the build-up to your round. Start sipping 2 hours before your tee time. Getting ahead of your fluid needs before hole one is the easiest win in golf hydration.',
    },
    {
      emoji:    '⛳',
      label:    'Front 9',
      subtitle: 'Holes 1 to 9',
      action:   `Aim for ${front9Ml}ml by the turn`,
      body:     `Based on your recommended total of ${totalFluidMl}ml, aim to consume half by the turn. Sip every 2-3 holes, topping up with plain water as needed. Steady sipping beats big gulps for absorption.`,
    },
    {
      emoji:    '⛳',
      label:    'Back 9',
      subtitle: 'Holes 10 to 18',
      action:   `Aim for ${totalFluidMl}ml by the 18th`,
      body:     `Aim to consume your full ${totalFluidMl}ml by the end of the round. The electrolytes from your sachet will keep working through the back nine. Top up with plain water between holes.`,
    },
    {
      emoji:    '🏆',
      label:    'Post-round',
      subtitle: 'After the 18th',
      action:   `${postRoundMl}ml to recover`,
      body:     `Recovery starts with giving your body the right fluids. Based on your estimated fluid needs of ${totalFluidMl}ml, aim for ${postRoundMl}ml after your round to recover properly. If post-round drinks are happening, rehydrate with water first.`,
    },
  ]
}

function buildCheckpoints9(totalFluidMl: number): Checkpoint[] {
  const postRoundMl = Math.round(totalFluidMl * 1.5 / 50) * 50

  return [
    {
      emoji:    '🏠',
      label:    'Pre-round',
      subtitle: 'Before the first tee',
      action:   'Mix one sachet in 500ml water',
      body:     'Make sure your body is hydrated before you reach the first tee. We recommend having a sachet of electrolytes in the build-up to your round. Start sipping 2 hours before your tee time. Getting ahead of your fluid needs before hole one is the easiest win in golf hydration.',
    },
    {
      emoji:    '⛳',
      label:    'Mid-round',
      subtitle: 'Around hole 5',
      action:   'Sip every 2-3 holes',
      body:     'Sip the rest of your sachet through the round.',
    },
    {
      emoji:    '🏆',
      label:    'Post-round',
      subtitle: 'After the 9th',
      action:   `${postRoundMl}ml to recover`,
      body:     `Recovery starts with giving your body the right fluids. Based on your estimated fluid needs of ${totalFluidMl}ml, aim for ${postRoundMl}ml after your round to recover properly. If post-round drinks are happening, rehydrate with water first.`,
    },
  ]
}


const PRODUCT_URL = 'https://www.hydracaddie.com/collections/electrolyte-powder?utm_source=hydration_plan&utm_medium=tool&utm_campaign=v1_launch'

export default function Results({ answers }: { answers: QuizAnswers }) {

  const plan      = useMemo(() => calculateHydrationPlan(answers), [answers])
  const breakdown = useMemo(() => getCalcBreakdown(answers), [answers])
  const totalFormatted = Intl.NumberFormat('en-GB').format(plan.totalFluidMl)
  const checkpoints = answers.holes === 9 ? buildCheckpoints9(plan.totalFluidMl) : buildCheckpoints18(plan.totalFluidMl)

  // Both accordions closed by default.
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [calcOpen, setCalcOpen]         = useState(false)

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: G.white }}>

      {/* Green header */}
      <div style={{
        background: `linear-gradient(160deg, ${G.greenDark} 0%, ${G.green} 60%, ${G.greenMid} 100%)`,
        padding: '40px 28px 44px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Image
            src="/hydracaddie-logo.png"
            alt="Hydracaddie"
            width={160}
            height={38}
            style={{ filter: 'brightness(0) invert(1)', opacity: 0.9, marginBottom: 28 }}
          />
          <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: 1.5, marginBottom: 10 }}>
            YOUR FAIRWAY HYDRATION PLAN
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: G.white, lineHeight: 1.2, margin: 0 }}>
            You&apos;ll need a solid drink strategy.
          </h1>
        </div>
      </div>

      <div style={{ padding: '32px 24px 48px' }}>

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
          <p style={{ fontSize: 52, fontWeight: 900, color: G.green, lineHeight: 1, margin: 0 }}>
            {totalFormatted}
            <span style={{ fontSize: 22, fontWeight: 700, marginLeft: 4 }}>ml</span>
          </p>
          <p style={{ fontSize: 13, fontWeight: 600, color: G.muted, lineHeight: 1.5, marginTop: 12 }}>
            Your estimated fluid needs during the round. Your full drinking plan is below.
          </p>
        </div>


        {/* Accordion 1: Timeline — green header, closed by default */}
        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16, border: `2px solid ${G.green}` }}>

          <button
            onClick={() => setTimelineOpen(prev => !prev)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 20px',
              background: G.green,
              border: 'none',
              cursor: 'pointer',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>⛳</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: G.white, textAlign: 'left' }}>
                Your suggested hydration schedule
              </span>
            </div>
            {timelineOpen
              ? <ChevronUp size={18} color={G.white} style={{ flexShrink: 0 }} />
              : <ChevronDown size={18} color={G.white} style={{ flexShrink: 0 }} />
            }
          </button>

          {timelineOpen && (
            // maxHeight + overflowY makes this scrollable on mobile
            <div style={{ background: G.white, padding: '24px 20px' }}>
              <div style={{ position: 'relative', paddingLeft: 8 }}>

                {/* Vertical connecting line */}
                <div style={{
                  position: 'absolute',
                  left: 23,
                  top: 24,
                  bottom: 24,
                  width: 2,
                  background: G.border,
                }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {checkpoints.map(({ emoji, label, subtitle, action, body }, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14 }}>

                      {/* Emoji circle */}
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: G.greenLight,
                        border: `2px solid ${G.green}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: 20,
                        zIndex: 1,
                      }}>
                        {emoji}
                      </div>

                      {/* Text block */}
                      <div style={{ flex: 1, paddingTop: 2 }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: G.text, marginBottom: 2 }}>
                          {label}
                        </p>
                        <p style={{ fontSize: 12, fontWeight: 600, color: G.muted, marginBottom: 10 }}>
                          {subtitle}
                        </p>
                        {/* Highlighted action box */}
                        <div style={{
                          background: G.greenLight,
                          borderRadius: 10,
                          padding: '10px 14px',
                          marginBottom: 8,
                        }}>
                          <p style={{ fontSize: 14, fontWeight: 800, color: G.green, margin: 0 }}>
                            {action}
                          </p>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: G.muted, lineHeight: 1.55 }}>
                          {body}
                        </p>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 2: How we calculated this */}
        <div style={{ border: `2px solid ${G.border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 32 }}>

          <button
            onClick={() => setCalcOpen(prev => !prev)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              background: G.white,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 800, color: G.text }}>
              How we calculated this
            </span>
            {calcOpen
              ? <ChevronUp size={18} color={G.muted} />
              : <ChevronDown size={18} color={G.muted} />
            }
          </button>

          {calcOpen && (
            <div style={{ borderTop: `1px solid ${G.border}` }}>

              {/* YOUR INPUTS */}
              <div style={{ background: G.greenLight, padding: '20px 24px' }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: G.green, letterSpacing: 1.2, marginBottom: 16 }}>
                  YOUR INPUTS
                </p>
                {[
                  { label: 'Body weight',        value: `${breakdown.weightKg}kg`              },
                  { label: 'Round type',          value: MODE_LABEL[answers.mode]               },
                  { label: 'Weather conditions',  value: CLIMATE_LABEL[answers.climate]         },
                  { label: 'Round duration',      value: `${breakdown.hours} hours`             },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: G.muted }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: G.text }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* THE CALCULATION */}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: G.green, letterSpacing: 1.2 }}>
                  THE CALCULATION
                </p>

                {/* Step 1 */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: G.green, letterSpacing: 1, marginBottom: 6 }}>
                    STEP 1 — BASE HYDRATION RATE
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: G.muted, marginBottom: 8 }}>
                    Base rate for a {answers.mode} round
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: G.muted }}>
                    <span style={{ fontWeight: 800, color: G.text }}>{breakdown.weightKg}kg</span>
                    {' x '}
                    <span style={{ fontWeight: 800, color: G.text }}>{breakdown.baseRate}ml/kg/hr</span>
                    {' = '}
                    <span style={{ fontWeight: 800, color: G.green }}>{breakdown.step1}ml per hour</span>
                  </p>
                </div>

                <div style={{ height: 1, background: G.border }} />

                {/* Step 2 */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: G.green, letterSpacing: 1, marginBottom: 6 }}>
                    STEP 2 — CLIMATE ADJUSTMENT
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: G.muted, marginBottom: 8 }}>
                    {CLIMATE_LABEL[answers.climate]} conditions (x{breakdown.climateMult} adjustment)
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: G.muted }}>
                    <span style={{ fontWeight: 800, color: G.text }}>{breakdown.step1}ml/hr</span>
                    {' x '}
                    <span style={{ fontWeight: 800, color: G.text }}>{breakdown.climateMult}</span>
                    {' = '}
                    <span style={{ fontWeight: 800, color: G.green }}>{breakdown.step2}ml per hour</span>
                  </p>
                </div>

                <div style={{ height: 1, background: G.border }} />

                {/* Step 3 */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: G.green, letterSpacing: 1, marginBottom: 6 }}>
                    STEP 3 — YOUR ROUND TOTAL
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: G.muted, marginBottom: 8 }}>
                    Total fluid for your {breakdown.hours}-hour round
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: G.muted }}>
                    <span style={{ fontWeight: 800, color: G.text }}>{breakdown.step2}ml/hr</span>
                    {' x '}
                    <span style={{ fontWeight: 800, color: G.text }}>{breakdown.hours}hrs</span>
                    {' = '}
                    <span style={{ fontWeight: 800, color: G.green }}>{totalFormatted}ml</span>
                  </p>
                </div>

                <p style={{ fontSize: 12, fontWeight: 600, color: G.muted, lineHeight: 1.55, opacity: 0.75 }}>
                  Recommendations based on established sports science guidelines for exercise hydration.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Get your sachets CTA */}
        <button
          onClick={() => window.open(PRODUCT_URL, '_blank')}
          style={{
            display: 'block',
            width: '100%',
            padding: '18px 24px',
            borderRadius: 50,
            border: 'none',
            background: G.green,
            color: G.white,
            fontSize: 17,
            fontWeight: 800,
            textAlign: 'center',
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
        >
          Get your sachets
        </button>
        <p style={{ textAlign: 'center', fontSize: 12.5, color: G.muted, marginTop: 10, fontWeight: 600 }}>
          Free UK delivery over £15
        </p>
        <p style={{ textAlign: 'center', fontSize: 12.5, color: G.muted, marginTop: 16, fontWeight: 600, lineHeight: 1.5 }}>
          We&apos;re working on emailing your personalised plan automatically. Coming soon.
        </p>

      </div>
    </div>
  )
}