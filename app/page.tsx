'use client'

import { useState } from 'react'
import Image from 'next/image'
import QuizStepper from './components/QuizStepper'
import Results from './components/Results'
import EmailCapture from './components/EmailCapture'
import type { QuizAnswers } from '../lib/types'

// Partial answers while the quiz is in progress (not all 7 yet)
type PartialAnswers = Partial<QuizAnswers>

// The screens the tool can show, in order
type Step = 'landing' | 'quiz' | 'email' | 'results'

const G = {
  green:      '#1A7A3C',
  greenDark:  '#155F2E',
  greenMid:   '#2A9B52',
  greenLight: '#EAF4EE',
  cream:      '#FAFAF8',
  white:      '#FFFFFF',
  text:       '#141414',
  muted:      '#6B7280',
  border:     '#E2E8E4',
}

export default function Home() {

  // Which screen are we on?
  const [step, setStep] = useState<Step>('landing')

  // Quiz answers accumulate as the user progresses
  const [answers, setAnswers] = useState<PartialAnswers>({})
  const [quizStartStep, setQuizStartStep] = useState(0) // which Q to return to if user goes back from email
  const [disclaimerChecked, setDisclaimerChecked] = useState(false)

  

  // Show results after email is submitted
  if (step === 'results') {
    return <Results answers={answers as QuizAnswers} />
  }

  // Show email capture between quiz and results
  if (step === 'email') {
    return (
    <EmailCapture
  answers={answers as QuizAnswers}
  onSuccess={() => setStep('results')}
  onBack={() => { setQuizStartStep(6); setStep('quiz'); }}
/>
    )
  }

  // Show quiz once started
  if (step === 'quiz') {
    return <QuizStepper answers={answers} setAnswers={setAnswers} onComplete={() => setStep('email')} initialStep={quizStartStep} />
  }

  // Default: landing page
  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: G.white }}>

      <div style={{
        background: `linear-gradient(170deg, ${G.greenDark} 0%, ${G.green} 60%, ${G.greenMid} 100%)`,
        padding: '20px 28px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles in the hero background */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>

          <div style={{ marginBottom: 12 }}>
            <Image
              src='/hydracaddie-logo.png'
              alt='Hydracaddie'
              width={260}
              height={60}
              priority
              style={{ filter: 'brightness(0) invert(1)', opacity: 0.92, maxWidth: '100%' }}
            />
          </div>

          <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.5px', marginBottom: 16 }}>
            Your Fairway Hydration Plan
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15.5, lineHeight: 1.55, maxWidth: 320 }}>
            Use this tool to help your performance when out on the golf course.
          </p>
        </div>
      </div>

      <div style={{ padding: '14px 28px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex' }}>
            {['#b0d4bc', '#88bc9a', '#60a47a'].map((c, i) => (
              <div key={i} style={{
                width: 32, height: 32, borderRadius: '50%', background: c,
                border: '2px solid #fff', marginLeft: i ? -8 : 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13,
              }}>
                ⛳
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13.5, color: G.muted, fontWeight: 600 }}>
            Used by <strong style={{ color: G.text }}>150+</strong> golfers
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: '⚡', text: 'Takes under 60 seconds' },
            { icon: '🔬', text: 'Based on sports science guidelines' },
            { icon: '🎯', text: 'Personalised to your round' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: G.greenLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>{icon}</div>
              <span style={{ fontSize: 15, fontWeight: 600, color: G.text }}>{text}</span>
            </div>
          ))}
        </div>

        <div>
          <p style={{ fontSize: 11.5, color: G.muted, marginBottom: 10, lineHeight: 1.5, opacity: 0.75 }}>
            Disclaimer: This tool provides general hydration guidance for golf. It does not constitute formal medical diagnosis or treatment. Consult your GP if you have specific health concerns.
          </p>

          {/* Checkbox gate — button stays disabled until ticked */}
          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            cursor: 'pointer', marginBottom: 16,
          }}>
            <input
              type="checkbox"
              checked={disclaimerChecked}
              onChange={e => setDisclaimerChecked(e.target.checked)}
              style={{ marginTop: 2, accentColor: G.green, width: 16, height: 16, flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: G.muted, lineHeight: 1.5 }}>
              By ticking this box, I understand this tool provides general guidance only and is not a substitute for medical advice.
            </span>
          </label>

          {/* Clicking Start moves us from landing to quiz */}
          <button
            onClick={() => { if (disclaimerChecked) setStep('quiz') }}
            disabled={!disclaimerChecked}
            style={{
              display: 'block', width: '100%', border: 'none',
              cursor: disclaimerChecked ? 'pointer' : 'not-allowed',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800, fontSize: 18,
              borderRadius: 50, padding: '16px 24px',
              background: disclaimerChecked ? G.green : G.border,
              color: disclaimerChecked ? '#fff' : G.muted,
              transition: 'background 0.2s ease, color 0.2s ease',
            }}
          >
            Start your plan
          </button>
          <p style={{ textAlign: 'center', fontSize: 12.5, color: G.muted, marginTop: 12, fontWeight: 600 }}>
            Free. Fuel your swing.
          </p>
        </div>

      </div>
    </div>
  )
}