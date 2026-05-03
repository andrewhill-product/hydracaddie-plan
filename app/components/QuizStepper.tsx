'use client'

import { useState } from 'react'
import Image from 'next/image'
import type {
  QuizAnswers, HolesPlayed, ModeOfPlay, RoundDuration,
  Climate, SweatRate, WeightBucket, Handicap
} from '../../lib/types'

const G = {
  green:      '#1A7A3C',
  greenDark:  '#155F2E',
  greenLight: '#EAF4EE',
  white:      '#FFFFFF',
  text:       '#141414',
  muted:      '#6B7280',
  border:     '#E2E8E4',
}

type PartialAnswers = Partial<QuizAnswers>

// Maps the raw slider number to our Handicap type bucket
function sliderToHandicap(value: number): Handicap {
  if (value < 10)  return 'under10'
  if (value <= 18) return '10-18'
  if (value <= 28) return '19-28'
  return '28+'
}

// Reusable option button with emoji
function OptionButton({ emoji, label, onClick, isSelected }: {
  emoji?: string
  label: string
  onClick: () => void
  isSelected?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '18px 20px',
        borderRadius: 14,
        border: `2px solid ${isSelected ? G.green : G.border}`,
        background: isSelected ? G.greenLight : G.white,
        fontSize: 16,
        fontWeight: 700,
        color: G.text,
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        justifyContent: 'space-between',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {emoji && <span style={{ fontSize: 22 }}>{emoji}</span>}
        <span>{label}</span>
      </span>
      {isSelected && (
        <span style={{ color: G.green, fontSize: 18, fontWeight: 900 }}>✓</span>
      )}
    </button>
  )
}

// Shared wrapper for every question screen
// Handles the header, logo, progress bar, and back arrow in one place
function QuestionScreen({
  step,
  question,
  onBack,
  children,
}: {
  step: number
  question: string
  onBack: () => void
  children: React.ReactNode
}) {
  const progressPct = ((step) / 7) * 100

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: G.white }}>

      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 20px 0',
      }}>
        {/* Back arrow */}
        <button
          onClick={onBack}
          disabled={step === 1}
          style={{
            background: 'none',
            border: 'none',
            cursor: step === 1 ? 'default' : 'pointer',
            fontSize: 22,
            color: step === 1 ? G.border : G.text,
            padding: 4,
          }}
        >
          ←
        </button>

        {/* Step counter */}
        <p style={{ fontSize: 13, fontWeight: 700, color: G.muted, letterSpacing: 1 }}>
          {step} OF 7
        </p>

        {/* Logo */}
        <Image
          src="/hydracaddie-logo.png"
          alt="Hydracaddie"
          width={90}
          height={22}
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: G.border, marginTop: 16 }}>
        <div style={{
          height: 3,
          width: `${progressPct}%`,
          background: G.green,
          borderRadius: 2,
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Question and options */}
      <div style={{ padding: '36px 24px 40px' }}>
        <h2 style={{
          fontSize: 26,
          fontWeight: 900,
          color: G.text,
          lineHeight: 1.2,
          marginBottom: 32,
        }}>
          {question}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {children}
        </div>
      </div>

    </div>
  )
}

export default function QuizStepper() {

  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState<PartialAnswers>({})
  const [sliderVal, setSliderVal] = useState(18) // default slider position
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')

  function handleAnswer(key: keyof QuizAnswers, value: QuizAnswers[keyof QuizAnswers]) {
    setAnswers(prev => ({ ...prev, [key]: value }))
    setStep(prev => prev + 1)
  }

  function goBack() {
    setStep(prev => Math.max(0, prev - 1))
  }

  // Q1
  if (step === 0) {
    return (
      <QuestionScreen step={1} question="How many holes are you playing?" onBack={goBack}>
        {([
          { emoji: '⛳', label: '9 holes',  value: 9  },
          { emoji: '🏌️', label: '18 holes', value: 18 },
        ] as { emoji: string; label: string; value: HolesPlayed }[]).map(({ emoji, label, value }) => (
          <OptionButton key={value}
  emoji={emoji}
  label={label}
  isSelected={answers.holes === value}
  onClick={() => handleAnswer('holes', value)}
/>
        ))}
      </QuestionScreen>
    )
  }

  // Q2
  if (step === 1) {
    return (
      <QuestionScreen step={2} question="Walking or in a buggy?" onBack={goBack}>
        {([
          { emoji: '🚶', label: 'Walking', value: 'walking' },
          { emoji: '🛺', label: 'Buggy',   value: 'buggy'   },
        ] as { emoji: string; label: string; value: ModeOfPlay }[]).map(({ emoji, label, value }) => (
          <OptionButton key={value} emoji={emoji} label={label}  onClick={() => handleAnswer('mode', value)} isSelected={answers.mode === value} />
        ))}
      </QuestionScreen>
    )
  }

  // Q3
  if (step === 2) {
    return (
      <QuestionScreen step={3} question="How long does your round usually take?" onBack={goBack}>
        {([
          { emoji: '🕒', label: 'Around 3 hours', value: '3h'       },
          { emoji: '🕓', label: 'Around 4 hours', value: '4h'       },
          { emoji: '🕔', label: '5 hours or more', value: '5h+'     },
          { emoji: '🤷', label: 'Not sure',        value: 'not-sure' },
        ] as { emoji: string; label: string; value: RoundDuration }[]).map(({ emoji, label, value }) => (
          <OptionButton key={value} emoji={emoji} label={label} onClick={() => handleAnswer('duration', value)} isSelected={answers.duration === value} />
        ))}
      </QuestionScreen>
    )
  }

  // Q4
  if (step === 3) {
    return (
      <QuestionScreen step={4} question="What's the weather like when you usually play?" onBack={goBack}>
        {([
          { emoji: '🧊', label: 'Cool (under 15C)', value: 'cool' },
          { emoji: '🌤️', label: 'Mild (15-22C)',    value: 'mild' },
          { emoji: '☀️', label: 'Warm (22-28C)',    value: 'warm' },
          { emoji: '🔥', label: 'Hot (28C+)',        value: 'hot'  },
        ] as { emoji: string; label: string; value: Climate }[]).map(({ emoji, label, value }) => (
          <OptionButton key={value} emoji={emoji} label={label} onClick={() => handleAnswer('climate', value)} isSelected={answers.climate === value} />
        ))}
      </QuestionScreen>
    )
  }

  // Q5
  if (step === 4) {
    return (
      <QuestionScreen step={5} question="How much do you typically sweat on the course?" onBack={goBack}>
        {([
          { emoji: '😎', label: 'Barely break a sweat',        value: 'low'    },
          { emoji: '💧', label: 'Damp shirt by the back nine', value: 'medium' },
          { emoji: '🥵', label: 'Soaked through, often',       value: 'high'   },
        ] as { emoji: string; label: string; value: SweatRate }[]).map(({ emoji, label, value }) => (
          <OptionButton key={value} emoji={emoji} label={label} onClick={() => handleAnswer('sweat', value)} isSelected={answers.sweat === value} />
        ))}
      </QuestionScreen>
    )
  }

  // Q6
 // Q6
  if (step === 5) {

    const kgOptions = [
      { label: '60kg or below', value: 'under60' as WeightBucket },
      { label: '60-70kg',       value: '60-70'   as WeightBucket },
      { label: '70-80kg',       value: '70-80'   as WeightBucket },
      { label: '80-90kg',       value: '80-90'   as WeightBucket },
      { label: '90-100kg',      value: '90-100'  as WeightBucket },
      { label: 'Over 100kg',    value: 'over100' as WeightBucket },
    ]

    const lbsOptions = [
      { label: '132lbs or below', value: 'under60' as WeightBucket },
      { label: '132-154lbs',      value: '60-70'   as WeightBucket },
      { label: '154-176lbs',      value: '70-80'   as WeightBucket },
      { label: '176-198lbs',      value: '80-90'   as WeightBucket },
      { label: '198-220lbs',      value: '90-100'  as WeightBucket },
      { label: 'Over 220lbs',     value: 'over100' as WeightBucket },
    ]

    const options = weightUnit === 'kg' ? kgOptions : lbsOptions

    return (
      <QuestionScreen step={6} question="Roughly what do you weigh?" onBack={goBack}>

        {/* kg / lbs toggle */}
        <div style={{
          display: 'inline-flex',
          background: G.greenLight,
          borderRadius: 50,
          padding: 4,
          marginBottom: 8,
          alignSelf: 'flex-start',
        }}>
          {(['kg', 'lbs'] as const).map(unit => (
            <button
              key={unit}
              onClick={() => setWeightUnit(unit)}
              style={{
                padding: '8px 20px',
                borderRadius: 50,
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 800,
                background: weightUnit === unit ? G.green : 'transparent',
                color: weightUnit === unit ? G.white : G.muted,
                transition: 'all 0.2s ease',
              }}
            >
              {unit}
            </button>
          ))}
        </div>

        {/* Weight options, no emojis */}
       {options.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleAnswer('weight', value)}
            style={{
              width: '100%',
              padding: '18px 20px',
              borderRadius: 14,
              border: `2px solid ${answers.weight === value ? G.green : G.border}`,
              background: answers.weight === value ? G.greenLight : G.white,
              fontSize: 16,
              fontWeight: 700,
              color: G.text,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{label}</span>
            {answers.weight === value && (
              <span style={{ color: G.green, fontSize: 18, fontWeight: 900 }}>✓</span>
            )}
          </button>
        ))}

      </QuestionScreen>
    )
  }

  // Q7: handicap slider
  if (step === 6) {
    const displayValue = sliderVal >= 30 ? '30+' : String(sliderVal)
    const handicapBucket = sliderToHandicap(sliderVal)

    return (
      <QuestionScreen step={7} question="What's your handicap?" onBack={goBack}>

        {/* Big value display card */}
        <div style={{
          border: `2px solid ${G.green}`,
          borderRadius: 16,
          padding: '32px 20px',
          textAlign: 'center',
          marginBottom: 8,
        }}>
          <p style={{ fontSize: 64, fontWeight: 900, color: G.green, lineHeight: 1 }}>
            {displayValue}
          </p>
          <p style={{ fontSize: 14, color: G.muted, marginTop: 8, fontWeight: 600 }}>
            handicap
          </p>
        </div>

        {/* Slider */}
        <div style={{ padding: '8px 4px 4px' }}>
          <input
            type="range"
            min={-10}
            max={30}
            value={sliderVal}
            onChange={e => setSliderVal(Number(e.target.value))}
            style={{ width: '100%', accentColor: G.green }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 12, color: G.muted, fontWeight: 600 }}>-10 (scratch+)</span>
            <span style={{ fontSize: 12, color: G.muted, fontWeight: 600 }}>30+</span>
          </div>
        </div>

        {/* I don&apos;t have one yet */}
        <button
          onClick={() => handleAnswer('handicap', 'none')}
          style={{
            width: '100%',
            padding: '18px 20px',
            borderRadius: 14,
            border: `2px solid ${G.border}`,
            background: G.white,
            fontSize: 16,
            fontWeight: 700,
            color: G.muted,
            cursor: 'pointer',
            textAlign: 'left',
            marginTop: 4,
          }}
        >
          I don&apos;t have one yet
        </button>

        {/* Confirm button */}
        <button
          onClick={() => handleAnswer('handicap', handicapBucket)}
          style={{
            width: '100%',
            padding: '18px 20px',
            borderRadius: 50,
            border: 'none',
            background: G.green,
            fontSize: 17,
            fontWeight: 800,
            color: G.white,
            cursor: 'pointer',
            marginTop: 16,
          }}
        >
          Confirm →
        </button>

      </QuestionScreen>
    )
  }

  // All 7 done. Placeholder until results page in 3c.
  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: G.white, padding: '40px 24px' }}>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: G.text, marginBottom: 16 }}>
        All done.
      </h2>
      <p style={{ color: G.muted, fontSize: 15 }}>
        Holes: {answers.holes}, Mode: {answers.mode}, Duration: {answers.duration}, Climate: {answers.climate}, Sweat: {answers.sweat}, Weight: {answers.weight}, Handicap: {answers.handicap}
      </p>
    </div>
  )
}