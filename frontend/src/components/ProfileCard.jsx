import React from 'react'
import TrustBadge from './TrustBadge'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function getCompatColor(score) {
  if (score >= 70) return '#48bb78'
  if (score >= 40) return '#ed8936'
  return '#e53e3e'
}

const AVATAR_GRADIENTS = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#a18cd1', '#fbc2eb'],
]

function getGradient(name) {
  if (!name) return AVATAR_GRADIENTS[0]
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length
  return AVATAR_GRADIENTS[idx]
}

export default function ProfileCard({ profile, onConnect, connectLoading }) {
  const compat = profile.compatibility_score ?? profile.compatibilityScore ?? 0
  const compatColor = getCompatColor(compat)
  const [g1, g2] = getGradient(profile.name)

  const parseList = (val) => {
    if (!val) return []
    if (Array.isArray(val)) return val
    try { return JSON.parse(val) } catch { return [] }
  }

  const interests = parseList(profile.interests)
  const displayInterests = interests.slice(0, 3)

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {/* Avatar */}
      <div style={{
        background: `linear-gradient(135deg, ${g1}, ${g2})`,
        height: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: 1 }}>
          {getInitials(profile.name)}
        </span>
        {/* Compat badge */}
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'white',
          borderRadius: 20,
          padding: '3px 10px',
          fontSize: 12,
          fontWeight: 700,
          color: compatColor,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          {compat}% match
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              {profile.name}
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
              {profile.age ? `${profile.age} yrs` : ''}
              {profile.location ? ` · ${profile.location}` : ''}
            </span>
          </div>
          <TrustBadge score={profile.trust_score} size="sm" />
        </div>

        {profile.intentions && (
          <span className="badge" style={{
            background: 'rgba(128, 90, 213, 0.1)',
            color: 'var(--accent)',
            alignSelf: 'flex-start',
            fontSize: 11
          }}>
            {profile.intentions}
          </span>
        )}

        {displayInterests.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {displayInterests.map(i => (
              <span key={i} style={{
                background: '#f7fafc',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '2px 7px',
                fontSize: 11,
                color: 'var(--text-light)'
              }}>{i}</span>
            ))}
            {interests.length > 3 && (
              <span style={{ fontSize: 11, color: 'var(--text-light)', padding: '2px 4px' }}>
                +{interests.length - 3} more
              </span>
            )}
          </div>
        )}

        <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
          🔒 Contact hidden
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <button
          className="btn btn-primary"
          style={{ width: '100%', fontSize: 13 }}
          onClick={() => onConnect && onConnect(profile)}
          disabled={connectLoading}
        >
          {connectLoading ? <span className="spinner" /> : '✨ Connect'}
        </button>
      </div>
    </div>
  )
}
