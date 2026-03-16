import React from 'react'
import { Link } from 'react-router-dom'

const FEATURES = [
  { icon: '💜', title: 'Compatibility Matching', desc: 'Smart algorithm analyzes your personality, values, and life goals to surface genuinely aligned connections.' },
  { icon: '🔒', title: 'Privacy First', desc: 'Your contact info stays completely hidden until you consciously choose to reveal it to a trusted connection.' },
  { icon: '🤝', title: 'Trust Agreement', desc: 'Both parties must commit to respectful communication before any personal details are shared.' },
  { icon: '⭐', title: 'Trust Score', desc: 'Build your reputation through verified interactions and community feedback over time.' },
  { icon: '💬', title: 'Contact Reveal', desc: 'Unlock communication only when both souls are genuinely ready — on your terms, always.' },
  { icon: '🗳️', title: 'Community Polls', desc: 'Shape the platform\'s future through democratic feature voting and community-driven decisions.' },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'inherit' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            width: [300, 200, 150, 400, 250][i],
            height: [300, 200, 150, 400, 250][i],
            top: ['10%', '70%', '30%', '-5%', '60%'][i],
            left: ['-5%', '80%', '85%', '60%', '-8%'][i],
            pointerEvents: 'none'
          }} />
        ))}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>💜</div>
          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 80px)',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-2px',
            lineHeight: 1.1,
            marginBottom: 16,
            textShadow: '0 2px 20px rgba(0,0,0,0.2)'
          }}>
            SoulSync
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 3vw, 24px)',
            color: 'rgba(255,255,255,0.92)',
            fontWeight: 500,
            marginBottom: 12,
            letterSpacing: 0.5
          }}>
            Where Emotions Are Built Through Trust.
          </p>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 17px)',
            color: 'rgba(255,255,255,0.78)',
            maxWidth: 520,
            margin: '0 auto 40px',
            lineHeight: 1.7
          }}>
            SoulSync is the trust-based connection platform designed for people who value depth over superficiality.
            Build meaningful relationships through verified trust, shared values, and mutual consent.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register">
              <button style={{
                background: 'white',
                color: '#764ba2',
                border: 'none',
                padding: '14px 36px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)' }}
              >
                ✨ Get Started
              </button>
            </Link>
            <Link to="/login">
              <button style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.7)',
                padding: '14px 36px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(8px)'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)' }}
              >
                Sign In
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 56, flexWrap: 'wrap' }}>
            {[['Trust-First', 'Platform'], ['Privacy', 'Protected'], ['Values-Based', 'Matching']].map(([a, b]) => (
              <div key={a} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{a}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          color: 'rgba(255,255,255,0.6)',
          fontSize: 12
        }}>
          <span>Scroll to explore</span>
          <div style={{
            width: 24, height: 36, border: '2px solid rgba(255,255,255,0.4)',
            borderRadius: 12, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 4
          }}>
            <div style={{
              width: 4, height: 8, background: 'rgba(255,255,255,0.6)',
              borderRadius: 2, animation: 'scrollDown 1.5s ease infinite'
            }} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>
              Why SoulSync?
            </h2>
            <p style={{ fontSize: 17, color: 'var(--text-light)', maxWidth: 520, margin: '0 auto' }}>
              Everything you need to build genuine, trust-based connections that last.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24
          }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card" style={{ padding: 28, transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-light)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        padding: '64px 24px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 12 }}>
          Ready to find your soul connection?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 28, fontSize: 16 }}>
          Join SoulSync today and start building relationships that matter.
        </p>
        <Link to="/register">
          <button style={{
            background: 'white',
            color: '#764ba2',
            border: 'none',
            padding: '14px 40px',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            transition: 'all 0.2s'
          }}>
            Create Free Account →
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1a202c',
        padding: '32px 24px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>💜</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>SoulSync</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
          Where Emotions Are Built Through Trust. · {new Date().getFullYear()}
        </p>
      </footer>

      <style>{`
        @keyframes scrollDown {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
