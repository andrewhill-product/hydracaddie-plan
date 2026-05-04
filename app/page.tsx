'use client'

import { useState } from 'react'
import Image from 'next/image'
import QuizStepper from './components/QuizStepper'
import Results from './components/Results'
import EmailCapture from './components/EmailCapture'
import type { QuizAnswers } from '../lib/types'

// Partial answers while the quiz is in progress (not all 7 yet)
type PartialAnswers = Partial<QuizAnswers>

// The four screens the tool can show, in order
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
        padding: '52px 28px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles in the hero background */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>

          <div style={{ marginBottom: 40 }}>
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
            Your personal<br />round hydration<br />plan
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15.5, lineHeight: 1.55, maxWidth: 300 }}>
            60 seconds. Built on the Galpin equation. Tells you exactly how much to drink across your round.
          </p>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: 13, lineHeight: 1.65, fontWeight: 600 }}>
              Just 1-3% body water loss can cut exercise capacity by around 10%. Most golfers play under-hydrated. The Galpin equation tells you exactly what your body needs, based on you and your round.
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '36px 28px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

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
            Used by <strong style={{ color: G.text }}>2,400+</strong> golfers
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: '⚡', text: 'Takes under 60 seconds' },
            { icon: '🔬', text: 'Based on the Galpin equation' },
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
          {/* Clicking Start moves us from landing to quiz */}
          <button
            onClick={() => setStep('quiz')}
            style={{
              display: 'block', width: '100%', border: 'none',
              cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
              fontWeight: 800, fontSize: 18,
              borderRadius: 50, padding: '16px 24px',
              background: G.green, color: '#fff',
            }}
          >
            Start your plan
          </button>
          <p style={{ textAlign: 'center', fontSize: 12.5, color: G.muted, marginTop: 12, fontWeight: 600 }}>
            Free. No account needed.
          </p>
        </div>

      </div>
    </div>
  )
}