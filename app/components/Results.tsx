'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { QuizAnswers } from '../../lib/types'
import { calculateHydrationPlan } from '../../lib/calculateHydrationPlan'

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

// Human-readable labels for the YOUR CALCULATION summary table.
// Lookup tables mean adding a new answer option = one line here, nothing else.
const HOLES_LABEL: Record<number, string> = {
  9:  '9 holes',
  18: '18 holes',
}
const MODE_LABEL: Record<string, string> = {
  walking: 'Walking',
  buggy:   'Buggy',
}
const DURATION_LABEL: Record<string, string> = {
  '3h':       'Around 3 hours',
  '4h':       'Around 4 hours',
  '5h+':      '5 hours or more',
  'not-sure': 'Not sure (average used)',
}
const CLIMATE_LABEL: Record<string, string> = {
  cool: 'Cool (under 15C)',
  mild: 'Mild (15-22C)',
  warm: 'Warm (22-28C)',
  hot:  'Hot (28C+)',
}
const SWEAT_LABEL: Record<string, string> = {
  low:    'Barely break a sweat',
  medium: 'Damp shirt by the back nine',
  high:   'Soaked through, often',
}
const WEIGHT_LABEL: Record<string, string> = {
  'under60': '60kg or below',
  '60-70':   '60-70kg',
  '70-80':   '70-80kg',
  '80-90':   '80-90kg',
  '90-100':  '90-100kg',
  'over100': 'Over 100kg',
}

type Checkpoint = {
  emoji: string
  label: string
  subtitle: string
  action: string
  body: string
}

// Checkpoint copy locked in CLAUDE.md. Do not edit without updating CLAUDE.md first.
const CHECKPOINTS_18: Checkpoint[] = [
  {
    emoji:    '🏠',
    label:    'Pre-round',
    subtitle: 'Before the first tee',
    action:   'Mix one sachet in 500ml water',
    body:     'Drink half before you head out, save the rest for the front nine. Pre-hydrating primes your electrolyte levels and stops the back-nine fade before it starts.',
  },
  {
    emoji:    '⛳',
    label:    'Front 9',
    subtitle: 'Holes 1 to 9',
    action:   'Sip every 2-3 holes',
    body:     'Aim to finish the rest of your sachet by the turn. Steady sipping beats big gulps for absorption.',
  },
  {
    emoji:    '🔄',
    label:    'Back 9',
    subtitle: 'Holes 10 to 18',
    action:   'Top up with plain water',
    body:     'Sip every 2-3 holes again. The electrolytes from your sachet will keep working through the back nine.',
  },
  {
    emoji:    '🏆',
    label:    'Post-round',
    subtitle: 'After the 18th',
    action:   '500ml plain water in the clubhouse',
    body:     'Replaces what you have lost and helps recovery for tomorrow.',
  },
]

const CHECKPOINTS_9: Checkpoint[] = [
  {
    emoji:    '🏠',
    label:    'Pre-round',
    subtitle: 'Before the first tee',
    action:   'Mix one sachet in 500ml water',
    body:     'Drink half before you tee off.',
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
    action:   '250-500ml plain water',
    body:     'In the clubhouse to recover.',
  },
]

// Adding a new hole count in future = add one line here.
const CHECKPOINTS_BY_HOLES: Record<number, Checkpoint[]> = {
  9:  CHECKPOINTS_9,
  18: CHECKPOINTS_18,
}

const PRODUCT_URL = 'https://www.hydracaddie.com?utm_source=hydration_plan&utm_medium=tool&utm_campaign=v1_launch'

export default function Results({ answers }: { answers: QuizAnswers }) {

  const plan = useMemo(() => calculateHydrationPlan(answers), [answers])
  const totalFormatted = Intl.NumberFormat('en-GB').format(plan.totalFluidMl)
  const checkpoints = CHECKPOINTS_BY_HOLES[answers.holes] ?? CHECKPOINTS_18

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
            YOUR ROUND HYDRATION PLAN
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
        </div>

        {/* Card 2: Electrolytes */}
        <div style={{
          background: G.white,
          border: `2px solid ${G.border}`,
          borderRadius: 16,
          padding: '28px 24px',
          marginBottom: 24,
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
                See the optimal hydration for your round
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
            <div style={{ borderTop: `1px solid ${G.border}`, maxHeight: 480, overflowY: 'auto' }}>

              {/* YOUR CALCULATION summary table */}
              <div style={{ background: G.greenLight, padding: '20px 24px', marginBottom: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: G.green, letterSpacing: 1.2, marginBottom: 16 }}>
                  YOUR CALCULATION
                </p>
                {[
                  { label: 'Round',      value: HOLES_LABEL[answers.holes]     },
                  { label: 'Mode',       value: MODE_LABEL[answers.mode]       },
                  { label: 'Duration',   value: DURATION_LABEL[answers.duration] },
                  { label: 'Climate',    value: CLIMATE_LABEL[answers.climate]  },
                  { label: 'Sweat rate', value: SWEAT_LABEL[answers.sweat]     },
                  { label: 'Weight',     value: WEIGHT_LABEL[answers.weight]   },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: G.muted }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: G.text }}>{value}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: G.border, margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: G.green }}>Total fluid</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: G.green }}>{totalFormatted}ml</span>
                </div>
              </div>

              {/* Galpin explanation */}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: G.muted, lineHeight: 1.6 }}>
                  We use the Galpin equation, a sports-science formula for fluid intake during activity, then adjust it for the conditions of a round of golf.
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: G.muted, lineHeight: 1.6 }}>
                  The base formula is: 2ml of fluid per kg of body weight, every 15 minutes of activity.
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: G.text }}>From there we apply three adjustments:</p>
                <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li style={{ fontSize: 14, fontWeight: 600, color: G.muted, lineHeight: 1.55 }}>Mode of play: walking burns more energy than riding in a buggy.</li>
                  <li style={{ fontSize: 14, fontWeight: 600, color: G.muted, lineHeight: 1.55 }}>Climate: hotter conditions raise sweat rate.</li>
                  <li style={{ fontSize: 14, fontWeight: 600, color: G.muted, lineHeight: 1.55 }}>Self-reported sweat rate: a personal multiplier on top of the climate adjustment.</li>
                </ul>
                <p style={{ fontSize: 14, fontWeight: 600, color: G.muted, lineHeight: 1.6 }}>
                  Galpin&apos;s formula was calibrated for running. We apply a golf-specific intensity multiplier to account for the lower energy demand of a round.
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: G.muted, lineHeight: 1.6 }}>
                  Source: Fallowfield et al. (1996), Effect of water ingestion on endurance capacity during prolonged running, Journal of Sports Sciences, 14(6), 497-502.
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

      </div>
    </div>
  )
}