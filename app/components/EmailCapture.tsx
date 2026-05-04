'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { QuizAnswers } from '@/lib/types';

// Matches the G const in QuizStepper exactly so both screens look identical
const G = {
  green:      '#1A7A3C',
  greenDark:  '#155F2E',
  greenLight: '#EAF4EE',
  white:      '#FFFFFF',
  text:       '#141414',
  muted:      '#6B7280',
  border:     '#E2E8E4',
  error:      '#C0392B',
};

interface Props {
  answers: QuizAnswers;  // 7 quiz answers sent to Formspree alongside email
  onSuccess: () => void; // called when Formspree confirms receipt, flips to results
  onBack: () => void;    // back arrow returns user to the quiz
}

export default function EmailCapture({ answers, onSuccess, onBack }: Props) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');

  // Button only active when email is valid, box ticked, and not mid-submit
  const canSubmit = consent && /\S+@\S+\.\S+/.test(email) && submitState !== 'loading';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // prevents page reload on submit
    setSubmitState('loading');
    try {
      const response = await fetch(
        `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          // sends email + all 7 quiz answers as one payload to Formspree
          body: JSON.stringify({ email, ...answers }),
        }
      );
      if (response.ok) {
        setSubmitState('success');
        onSuccess();
      } else {
        setSubmitState('error');
      }
    } catch {
      setSubmitState('error');
    }
  };

  const buttonLabel = {
    idle:    'Send me my plan',
    loading: 'Sending...',
    error:   'Something went wrong, try again',
    success: 'Sending...',
  }[submitState];

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: G.white, display: 'flex', flexDirection: 'column' }}>

      {/* Header: matches QuizStepper exactly */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 0' }}>
        {/* Back arrow returns user to the quiz */}
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: G.text, padding: 4 }}
        >
          ←
        </button>
        {/* Status badge in place of "X OF 7" */}
        <p style={{ fontSize: 13, fontWeight: 700, color: G.muted, letterSpacing: 1 }}>
         
        </p>
        {/* Logo */}
        <Image src="/hydracaddie-logo.png" alt="Hydracaddie" width={90} height={22} style={{ objectFit: 'contain' }} />
      </div>

      {/* Progress bar at 100% — quiz is complete */}
      <div style={{ height: 3, background: G.border, marginTop: 16 }}>
        <div style={{ height: 3, width: '100%', background: G.green, borderRadius: 2 }} />
      </div>

      {/* Main content */}
      <div style={{ padding: '32px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Mailbox icon */}
        <div style={{ width: 72, height: 72, borderRadius: 18, background: G.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 24 }}>
          📬
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 900, color: G.text, lineHeight: 1.15, marginBottom: 10 }}>
          Where shall we send your plan?
        </h1>
        <p style={{ fontSize: 15, color: G.muted, lineHeight: 1.55, marginBottom: 28 }}>
        Your plan is ready. We&apos;ll email it over and add a free golf hydration guide.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

          {/* Email input */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={{ width: '100%', boxSizing: 'border-box', padding: '16px 18px', borderRadius: 14, border: `2px solid ${G.border}`, background: G.white, fontSize: 16, color: G.text, marginBottom: 20, outline: 'none', fontFamily: 'Nunito, sans-serif' }}
          />

          {/* Consent tickbox */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              style={{ marginTop: 3, width: 24, height: 24, flexShrink: 0, accentColor: G.green, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 14, fontWeight: 700, color: G.text, lineHeight: 1.5 }}>
              Yes, email me my plan and send me hydration tips and offers from Hydracaddie. I can unsubscribe anytime.
            </span>
          </label>

          <p style={{ fontSize: 13, color: G.muted, marginBottom: 32, paddingLeft: 36 }}>
            By ticking, you agree to our{' '}
            <a href="https://www.hydracaddie.com/policies/privacy-policy" style={{ color: G.green, textDecoration: 'underline' }}>Privacy Policy</a>
            {' '}and{' '}
            <a href="https://www.hydracaddie.com/policies/terms-of-service" style={{ color: G.green, textDecoration: 'underline' }}>Terms of Service</a>.
          </p>

          {/* Submit button — grey until both email and consent are valid */}
          <button
            type="submit"
            disabled={!canSubmit}
            style={{ width: '100%', padding: '18px 24px', borderRadius: 50, border: 'none', background: canSubmit ? G.green : G.border, color: G.white, fontSize: 18, fontWeight: 800, cursor: canSubmit ? 'pointer' : 'not-allowed', fontFamily: 'Nunito, sans-serif', transition: 'background 0.2s' }}
          >
            {buttonLabel}
          </button>

          {submitState === 'error' && (
            <p style={{ fontSize: 13, color: G.error, marginTop: 12, textAlign: 'center' }}>
              Please check your connection and try again.
            </p>
          )}

          <p style={{ fontSize: 12, color: G.muted, textAlign: 'center', marginTop: 16 }}>
            We respect your inbox. Unsubscribe anytime.
          </p>

        </form>
      </div>
    </div>
  );
}