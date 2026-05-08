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
  '0-10':  '0-10°C',
  '11-15': '11-15°C',
  '16-20': '16-20°C',
  '21-25': '21-25°C',
  '26+':   '26°C+',
}
const SWEAT_LABEL: Record<string, string> = {
  low:    'Barely break a sweat',
  shower: "I'll need a shower after",
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

// Front 9 body copy varies by climate: hotter = more urgency, cooler = reassurance.
const FRONT9_BODY: Record<string, string> = {
  '0-10':  'Cool conditions slow your sweat rate, but you are still losing fluid. Sip every 3 holes to stay on top of it.',
  '11-15': 'Sip your sachet every 2-3 holes, topping up with plain water as needed. Steady sipping beats big gulps for absorption.',
  '16-20': 'Sip your sachet every 2-3 holes, topping up with plain water as needed. Steady sipping beats big gulps for absorption.',
  '21-25': 'Warm conditions mean your sweat rate is higher than it feels. Sip every 2-3 holes and get ahead of your thirst, not behind it.',
  '26+':   "Hot day. You are losing fluid faster than normal. Sip every 2 holes and do not wait for thirst. By the time you feel it, you are already behind.",
}

// Back 9 body copy varies by sweat rate: heavy sweaters need the fade warning.
const BACK9_BODY: Record<string, string> = {
  'low':    'Your sweat rate is low so your fluid balance should be holding up well. Keep sipping every few holes to stay comfortable through to 18.',
  'shower': 'Sip every 2-3 holes. The electrolytes from your sachet will keep working through the back nine.',
  'medium': 'Sip every 2-3 holes. The electrolytes from your sachet will keep working through the back nine.',
  'high':   'You lose fluid quickly, so the back nine is where most golfers start to fade. Keep sipping even when you feel fine. Your sachet electrolytes are still active.',
}

// Splits the calc total evenly across Front 9 and Back 9 so they sum to totalFluidMl.
// Front 9 is rounded to nearest 50ml; Back 9 takes the remainder to preserve the total.
// Post-round uses the 150% rehydration rule: replace 1.5x sweat loss after exercise.
function buildCheckpoints18(totalFluidMl: number, answers: QuizAnswers): Checkpoint[] {
  const front9Ml    = Math.round(totalFluidMl / 2 / 50) * 50
  const back9Ml     = totalFluidMl - front9Ml
  const postRoundMl = Math.round(totalFluidMl * 1.5 / 50) * 50

  return [
    {
      emoji:    '🏠',
      label:    'Pre-round',
      subtitle: 'Before the first tee',
      action:   'Mix one sachet in 500ml water',
      body:     'Start sipping 2 hours before your tee time, not on the first tee. Drink half your sachet in the build-up to your round and save the rest for the front nine. Getting ahead of your fluid needs before hole one is the easiest win in golf hydration.',
    },
    {
      emoji:    '⛳',
      label:    'Front 9',
      subtitle: 'Holes 1 to 9',
      action:   `Aim for ${front9Ml}ml by the turn`,
      body:     FRONT9_BODY[answers.climate],
    },
    {
      emoji:    '⛳',
      label:    'Back 9',
      subtitle: 'Holes 10 to 18',
      action:   `Top up with ${back9Ml}ml of plain water`,
      body:     BACK9_BODY[answers.sweat],
    },
    {
      emoji:    '🏆',
      label:    'Post-round',
      subtitle: 'After the 18th',
      action:   `${postRoundMl}ml plain water in the clubhouse`,
      body:     `Sports science recommends replacing 150% of fluid lost after exercise to fully rehydrate. Based on your estimated sweat loss of ${totalFluidMl}ml, aim for ${postRoundMl}ml before you head home.`,
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
      body:     'Start sipping 2 hours before your tee time. Drink half your sachet in the build-up and save the rest for the course.',
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
      action:   `${postRoundMl}ml plain water in the clubhouse`,
      body:     `Sports science recommends replacing 150% of fluid lost after exercise to fully rehydrate. Based on your estimated sweat loss of ${totalFluidMl}ml, aim for ${postRoundMl}ml before you head home.`,
    },
  ]
}


const PRODUCT_URL = 'https://www.hydracaddie.com/collections/electrolyte-powder?utm_source=hydration_plan&utm_medium=tool&utm_campaign=v1_launch'

export default function Results({ answers }: { answers: QuizAnswers }) {

  const plan = useMemo(() => calculateHydrationPlan(answers), [answers])
  const totalFormatted = Intl.NumberFormat('en-GB').format(plan.totalFluidMl)
  const checkpoints = answers.holes === 9 ? buildCheckpoints9(plan.totalFluidMl) : buildCheckpoints18(plan.totalFluidMl, answers)

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
          <p style={{ fontSize: 13, fontWeight: 600, color: G.muted, lineHeight: 1.5, marginTop: 12 }}>
            Your estimated sweat loss during the round. Your full drinking plan is below.
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

              {/* How we calculated this explanation */}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: G.muted, lineHeight: 1.6 }}>
                  Your plan is built on hydration guidelines from the American College of Sports Medicine, calibrated against the latest golf-specific evidence base (O&apos;Donnell et al., 2024, Sports Medicine).
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: G.muted, lineHeight: 1.6 }}>
                  The base recommendation is roughly 2.8ml of fluid per kilogram of body weight per hour for a typical golfer walking the course in mild conditions, derived from on-course sweat rate measurements. We then adjust for your weather, your sweat rate, and whether you walk or take a buggy.
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: G.muted, lineHeight: 1.6 }}>
                  The 150% post-round rule for replacing lost fluid is from ACSM guidance for full rehydration after exercise.
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: G.muted, lineHeight: 1.6 }}>
                  This estimate is guidance. Please consult with a healthcare professional for personalised advice.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: G.muted, lineHeight: 1.55, opacity: 0.75 }}>
                    Sawka et al. (2007), American College of Sports Medicine position stand on exercise and fluid replacement.{' '}
                    <a
                      href="https://pubmed.ncbi.nlm.nih.gov/17277604/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: G.green, textDecoration: 'underline' }}
                    >
                      pubmed.ncbi.nlm.nih.gov/17277604
                    </a>
                  </p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: G.muted, lineHeight: 1.55, opacity: 0.75 }}>
                    O&apos;Donnell et al. (2024), Nutrition and Golf Performance: A Systematic Scoping Review. Sports Medicine.{' '}
                    <a
                      href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11608286/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: G.green, textDecoration: 'underline' }}
                    >
                      pmc.ncbi.nlm.nih.gov/articles/PMC11608286
                    </a>
                  </p>
                </div>
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