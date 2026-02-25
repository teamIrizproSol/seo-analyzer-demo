'use client'

import { useState, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  url: string
  targetKeyword: string
  secondaryKeywords: string
  geoLocation: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractHtml(data: any): string | null {
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0]
    if (Array.isArray(first) && first.length > 0) {
      const item = first[0]
      if (typeof item === 'object' && item?.html) return item.html as string
    }
    if (typeof first === 'object' && first !== null && first.html) return first.html as string
  }
  if (typeof data === 'object' && data !== null) {
    if (data.html) return data.html as string
    if (data.result?.html) return data.result.html as string
  }
  if (typeof data === 'string' && data.trim().startsWith('<')) return data
  return null
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const INPUT: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}
const INPUT_FOCUS: React.CSSProperties = {
  ...INPUT,
  borderColor: 'rgba(59,130,246,0.6)',
  boxShadow: '0 0 0 3px rgba(59,130,246,0.18)',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="spin"
      style={{ width: 18, height: 18, flexShrink: 0 }}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
        style={{ opacity: 0.25 }}
      />
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        style={{ opacity: 0.85 }}
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg style={{ width: 32, height: 32 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

function Label({ children, required, optional }: {
  children: React.ReactNode
  required?: boolean
  optional?: boolean
}) {
  return (
    <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.78)', display: 'block', marginBottom: 6 }}>
      {children}
      {required && <span style={{ color: '#f87171', marginLeft: 4 }}>*</span>}
      {optional && <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginLeft: 6, fontWeight: 400 }}>optional</span>}
    </label>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SEOAnalyzerDemo() {
  const [form, setForm] = useState<FormState>({ url: '', targetKeyword: '', secondaryKeywords: '', geoLocation: 'IN' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const htmlContent = result ? extractHtml(result) : null
  const isDisabled = loading || !form.url.trim() || !form.targetKeyword.trim()

  const setField = (f: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isDisabled) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Analysis failed. Please try again.')
      } else {
        setResult(data)
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
      }
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : null) || 'Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(100,30,180,0.22) 0%, transparent 65%), #0d1117',
    }}>

      {/* Grid overlay */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(13,17,23,0.88)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(14px)',
      }}>
        <div className="nav-inner">
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, lineHeight: '1.2' }}>SEO Content Analyzer</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>by Irizpro</div>
            </div>
          </div>
          {/* Nav CTA */}
          <a
            href="https://api.whatsapp.com/send/?phone=15551611777&text=Hi+I+am+interested&type=phone_number&app_absent=0"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Contact Us
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className="page-wrap" style={{ position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          {/* <span style={{
            display: 'inline-block', marginBottom: 14,
            padding: '4px 14px', borderRadius: 99,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.28)',
            color: '#4ade80', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>Free Demo</span> */}
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>
            SEO Content{' '}
            <span style={{
              background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Analyzer</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
            Enter your content URL and keywords to get an instant SEO performance
            report with actionable recommendations.
          </p>
        </div>

        {/* ── Card ── */}
        <div style={{
          background: 'rgba(15,23,42,0.97)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 20,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
          overflow: 'hidden',
          marginBottom: 28,
        }}>
          {/* Card header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>🤖</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>SEO Content Analyzer</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', marginTop: 2 }}>Analyze the content</div>
              </div>
            </div>
            {result && (
              <button
                onClick={() => { setResult(null); setError(null) }}
                style={{
                  padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.65)', fontSize: 13,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.11)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >← New Analysis</button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '24px 24px 20px' }}>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Input Parameters</h2>
            </div>

            {/* 2×2 grid — always 2 columns */}
            <div className="form-grid">

              {/* Row 1 Left — Content URL */}
              <div>
                <Label required>Provide Content URL</Label>
                <input
                  type="url"
                  value={form.url}
                  onChange={setField('url')}
                  placeholder='e.g., "https://example.com/article"'
                  required
                  disabled={loading}
                  style={INPUT}
                  onFocus={e => Object.assign(e.currentTarget.style, INPUT_FOCUS)}
                  onBlur={e => Object.assign(e.currentTarget.style, INPUT)}
                />
              </div>

              {/* Row 1 Right — Target Keyword (textarea to match marketplace) */}
              <div>
                <Label required>Target Keyword</Label>
                <textarea
                  value={form.targetKeyword}
                  onChange={setField('targetKeyword')}
                  placeholder="e.g., seo content optimizer"
                  required
                  disabled={loading}
                  rows={3}
                  style={{ ...INPUT, resize: 'vertical', minHeight: 80 }}
                  onFocus={e => Object.assign(e.currentTarget.style, { ...INPUT_FOCUS, resize: 'vertical', minHeight: '80px' })}
                  onBlur={e => Object.assign(e.currentTarget.style, { ...INPUT, resize: 'vertical', minHeight: '80px' })}
                />
              </div>

              {/* Row 2 Left — Secondary Keywords */}
              <div>
                <Label optional>Secondary Keyword</Label>
                <input
                  type="text"
                  value={form.secondaryKeywords}
                  onChange={setField('secondaryKeywords')}
                  placeholder='"on-page seo", "content marketing"'
                  disabled={loading}
                  style={INPUT}
                  onFocus={e => Object.assign(e.currentTarget.style, INPUT_FOCUS)}
                  onBlur={e => Object.assign(e.currentTarget.style, INPUT)}
                />
              </div>

              {/* Row 2 Right — Geo Location */}
              <div>
                <Label optional>Geo Location</Label>
                <input
                  type="text"
                  value={form.geoLocation}
                  onChange={setField('geoLocation')}
                  placeholder='e.g.,"US" | "GB" | "CA" | "IN"'
                  disabled={loading}
                  style={INPUT}
                  onFocus={e => Object.assign(e.currentTarget.style, INPUT_FOCUS)}
                  onBlur={e => Object.assign(e.currentTarget.style, INPUT)}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 16, padding: '12px 16px', borderRadius: 10,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', fontSize: 14,
              }}>{error}</div>
            )}

            {/* Footer row */}
            <div style={{
              marginTop: 22, paddingTop: 18,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
            }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>
                {loading
                  ? '⏳ Analyzing… this may take up to 2 minutes'
                  : '✨ Free demo · No login required'}
              </div>

              <button
                type="submit"
                disabled={isDisabled}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 26px', borderRadius: 10, border: 'none', cursor: isDisabled ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: '#fff', fontWeight: 700, fontSize: 15,
                  opacity: isDisabled ? 0.5 : 1, transition: 'opacity 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.transform = 'scale(1.03)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                {loading ? <><Spinner /> Analyzing…</> : 'Execute Agent'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Result panel ── */}
        {htmlContent && (
          <div ref={resultRef} style={{ scrollMarginTop: 72 }}>
            <div style={{
              borderRadius: 20, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
            }}>
              {/* Result header bar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 22px',
                background: 'rgba(15,23,42,0.97)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 9, height: 9, borderRadius: '50%',
                    background: '#4ade80', boxShadow: '0 0 8px #4ade80',
                  }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>SEO Analysis Report</span>
                  <span style={{
                    padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                    background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24',
                  }}>PARTIAL PREVIEW</span>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>~35% of full report</span>
              </div>

              {/* Report with gradient cut-off */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{ maxHeight: 520, overflow: 'hidden', background: '#fff' }}
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
                {/* Fade overlay */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 300, pointerEvents: 'none',
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(13,17,23,0.55) 40%, rgba(13,17,23,0.93) 68%, #0d1117 100%)',
                }} />
              </div>

              {/* Unlock CTA */}
              <div style={{
                background: '#0d1117', padding: '44px 24px 40px', textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}>
                {/* Lock icon box */}
                <div style={{
                  width: 72, height: 72, margin: '0 auto 20px', borderRadius: 20,
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))',
                  border: '1px solid rgba(139,92,246,0.28)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa',
                }}>
                  <LockIcon />
                </div>

                <h3 style={{
                  fontSize: 22, fontWeight: 700, marginBottom: 10,
                  background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>Unlock Full SEO Report</h3>

                <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 15, maxWidth: 440, margin: '0 auto 20px' }}>
                  Get the complete analysis with all recommendations, competitor insights,
                  keyword opportunities, and a detailed action plan.
                </p>

                {/* Feature pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
                  {['✅ Full keyword analysis', '✅ Competitor benchmarks', '✅ Actionable recommendations', '✅ Downloadable PDF report', '✅ Priority fix list']
                    .map(item => (
                      <span key={item} style={{
                        padding: '5px 13px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.6)',
                      }}>{item}</span>
                    ))}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a
                    href="team@irizpro.com?subject=Unlock%20Full%20SEO%20Report&body=Hi%2C%20I%20just%20ran%20the%20free%20SEO%20demo%20and%20would%20like%20to%20unlock%20the%20full%20report."
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '12px 28px', borderRadius: 12, textDecoration: 'none',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: '#fff', fontWeight: 700, fontSize: 15,
                      boxShadow: '0 8px 28px rgba(139,92,246,0.28)',
                      transition: 'opacity 0.2s, transform 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.86'; e.currentTarget.style.transform = 'scale(1.03)' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
                  >📧 Contact Us to Unlock</a>

                  <button
                    onClick={() => { setResult(null); setError(null) }}
                    style={{
                      padding: '12px 24px', borderRadius: 12, cursor: 'pointer',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.68)', fontWeight: 600, fontSize: 15,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  >↩ Analyze Another URL</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: 20 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
            Powered by <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Irizpro</span>
            {' · '}
            <a href="mailto:team@irizpro.com" style={{ color: 'rgba(139,92,246,0.6)', textDecoration: 'none' }}>
              team@irizpro.com
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
