import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import TrustBadge from './TrustBadge'

const NAV_LINKS = [
  { to: '/discover', label: 'Discover', icon: '🔍' },
  { to: '/connections', label: 'Connections', icon: '🤝' },
  { to: '/polls', label: 'Polls', icon: '🗳️' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link to="/discover" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: 22 }}>💜</span>
          <span style={{
            fontSize: 18,
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--primary-start), var(--primary-end))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>SoulSync</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                color: location.pathname === link.to ? 'var(--accent)' : 'var(--text-light)',
                background: location.pathname === link.to ? 'rgba(128, 90, 213, 0.08)' : 'transparent',
                transition: 'all 0.15s'
              }}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrustBadge score={user.trust_score} size="sm" />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                {user.name?.split(' ')[0]}
              </span>
            </div>
          )}
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: 13 }}
            onClick={handleLogout}
          >
            Logout
          </button>
          {/* Hamburger */}
          <button
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
              color: 'var(--text)'
            }}
            className="hamburger-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'white',
          borderTop: '1px solid var(--border)',
          padding: '12px 24px 16px'
        }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 0',
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                color: location.pathname === link.to ? 'var(--accent)' : 'var(--text)',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
