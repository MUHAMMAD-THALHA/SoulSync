import React, { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import TrustBadge from '../components/TrustBadge'

const AVATAR_GRADIENTS = [
  ['#667eea', '#764ba2'], ['#f093fb', '#f5576c'], ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'], ['#fa709a', '#fee140'], ['#a18cd1', '#fbc2eb'],
]

function getGradient(name) {
  if (!name) return AVATAR_GRADIENTS[0]
  return AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length]
}

function Avatar({ name, size = 48 }) {
  const [g1, g2] = getGradient(name)
  const initials = (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${g1}, ${g2})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color: 'white', flexShrink: 0
    }}>
      {initials}
    </div>
  )
}

function ConnectionCard({ connection, currentUserId, onRespond, onTrustAgree, onRevealContact, onViewContact }) {
  const isRequester = connection.requester_id === currentUserId
  const otherUser = isRequester ? connection.recipient : connection.requester
  const status = connection.status

  const myTrustAgreed = isRequester ? connection.requester_trust_agreed : connection.recipient_trust_agreed
  const theirTrustAgreed = isRequester ? connection.recipient_trust_agreed : connection.requester_trust_agreed
  const bothTrustAgreed = myTrustAgreed && theirTrustAgreed

  const myRevealConsented = isRequester ? connection.requester_reveal_consented : connection.recipient_reveal_consented
  const theirRevealConsented = isRequester ? connection.recipient_reveal_consented : connection.requester_reveal_consented
  const bothRevealed = myRevealConsented && theirRevealConsented

  const compat = connection.compatibility_score ?? 0
  const compatColor = compat >= 70 ? 'var(--trust-green)' : compat >= 40 ? 'var(--warning)' : 'var(--danger)'

  if (!otherUser) return null

  return (
    <div className="card" style={{ padding: 20 }}>
      {/* Profile header */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
        <Avatar name={otherUser.name} size={52} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{otherUser.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-light)' }}>
                {otherUser.age ? `${otherUser.age} yrs` : ''}
                {otherUser.location ? ` · ${otherUser.location}` : ''}
              </p>
            </div>
            <TrustBadge score={otherUser.trust_score} size="sm" />
          </div>
          {otherUser.intentions && (
            <span className="badge" style={{ background: 'rgba(128,90,213,0.1)', color: 'var(--accent)', fontSize: 11, marginTop: 4 }}>
              {otherUser.intentions}
            </span>
          )}
        </div>
      </div>

      {/* Compat score */}
      {compat > 0 && (
        <div style={{ background: '#f7fafc', borderRadius: 8, padding: '8px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Compatibility</span>
          <div style={{ flex: 1 }}>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${compat}%`, background: compatColor }} />
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: compatColor }}>{compat}%</span>
        </div>
      )}

      {/* Connection message */}
      {connection.message && (
        <div style={{ background: '#f7fafc', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 13, color: 'var(--text-light)', fontStyle: 'italic' }}>
          "{connection.message}"
        </div>
      )}

      {/* Pending actions */}
      {status === 'pending' && !isRequester && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-success" style={{ flex: 1 }} onClick={() => onRespond(connection.id, 'accepted')}>
            ✓ Accept
          </button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => onRespond(connection.id, 'rejected')}>
            ✕ Decline
          </button>
        </div>
      )}

      {status === 'pending' && isRequester && (
        <div style={{ padding: '8px 12px', background: '#fffbeb', borderRadius: 8, fontSize: 13, color: 'var(--warning)', textAlign: 'center' }}>
          ⏳ Waiting for {otherUser.name}'s response…
        </div>
      )}

      {/* Active connection: Trust Agreement */}
      {status === 'accepted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Trust section */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>🤝</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Trust Agreement</span>
              {bothTrustAgreed && <span className="badge" style={{ background: 'rgba(72,187,120,0.12)', color: 'var(--trust-green)', marginLeft: 'auto' }}>✅ Signed</span>}
            </div>

            {!bothTrustAgreed && (
              <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 10, lineHeight: 1.5 }}>
                Before communication, both parties must agree to respectful and honest interactions per SoulSync community guidelines.
              </p>
            )}

            {!myTrustAgreed ? (
              <button className="btn btn-primary" style={{ width: '100%', fontSize: 13 }} onClick={() => onTrustAgree(connection.id)}>
                🤝 Sign Trust Agreement
              </button>
            ) : !theirTrustAgreed ? (
              <div style={{ fontSize: 13, color: 'var(--warning)', textAlign: 'center', padding: '6px 0' }}>
                ⏳ Waiting for {otherUser.name} to agree…
              </div>
            ) : null}
          </div>

          {/* Contact Reveal — only after both trust agreed */}
          {bothTrustAgreed && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>💬</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Contact Reveal</span>
                {bothRevealed && <span className="badge" style={{ background: 'rgba(72,187,120,0.12)', color: 'var(--trust-green)', marginLeft: 'auto' }}>✅ Revealed</span>}
              </div>

              {!bothRevealed && !myRevealConsented && (
                <>
                  <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 10 }}>
                    When both parties consent, contact information will be revealed.
                  </p>
                  <button className="btn btn-primary" style={{ width: '100%', fontSize: 13, background: 'linear-gradient(135deg, #f093fb, #f5576c)' }} onClick={() => onRevealContact(connection.id)}>
                    💜 Reveal My Contact
                  </button>
                </>
              )}

              {myRevealConsented && !theirRevealConsented && (
                <div style={{ fontSize: 13, color: 'var(--warning)', textAlign: 'center', padding: '6px 0' }}>
                  ⏳ Awaiting {otherUser.name}'s consent…
                </div>
              )}

              {bothRevealed && (
                <button className="btn btn-success" style={{ width: '100%', fontSize: 13 }} onClick={() => onViewContact(connection.id)}>
                  👁 View Contact Info
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {status === 'rejected' && (
        <div style={{ padding: '8px 12px', background: '#fff5f5', borderRadius: 8, fontSize: 13, color: 'var(--danger)', textAlign: 'center' }}>
          Connection declined
        </div>
      )}
    </div>
  )
}

export default function ConnectionsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('received')
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [contactModal, setContactModal] = useState(null)
  const [contactLoading, setContactLoading] = useState(false)

  const fetchConnections = useCallback(async () => {
    try {
      const res = await api.get('/connections')
      const data = Array.isArray(res.data) ? res.data : res.data.connections || []
      setConnections(data)
    } catch {
      setError('Failed to load connections.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchConnections() }, [fetchConnections])

  const showMsg = (msg) => {
    setActionMsg(msg)
    setTimeout(() => setActionMsg(''), 3500)
  }

  const handleRespond = async (id, status) => {
    try {
      await api.put(`/connections/${id}/respond`, { status })
      await fetchConnections()
      showMsg(status === 'accepted' ? '✅ Connection accepted!' : 'Connection declined.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to respond.')
    }
  }

  const handleTrustAgree = async (id) => {
    try {
      await api.post(`/connections/${id}/trust-agreement`)
      await fetchConnections()
      showMsg('🤝 Trust agreement signed!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign trust agreement.')
    }
  }

  const handleRevealContact = async (id) => {
    try {
      await api.post(`/connections/${id}/contact-reveal`)
      await fetchConnections()
      showMsg('💜 Contact reveal consent submitted!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit consent.')
    }
  }

  const handleViewContact = async (id) => {
    setContactLoading(true)
    try {
      const res = await api.get(`/connections/${id}/contact`)
      setContactModal(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load contact info.')
    } finally {
      setContactLoading(false)
    }
  }

  const pending = connections.filter(c => c.status === 'pending')
  const received = pending.filter(c => c.recipient_id === user?.id)
  const sent = pending.filter(c => c.requester_id === user?.id)
  const active = connections.filter(c => c.status === 'accepted')

  const tabData = { received, sent, active }
  const tabLabels = {
    received: `Received (${received.length})`,
    sent: `Sent (${sent.length})`,
    active: `Active (${active.length})`
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-loading"><div className="spinner spinner-dark" style={{ width: 36, height: 36, borderWidth: 3 }} /><span>Loading connections…</span></div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{ maxWidth: 900 }}>
        <h1 className="section-title">Connections</h1>
        <p className="section-subtitle">Manage your trust-based connections</p>

        {error && <div className="error-message">{error}</div>}
        {actionMsg && <div className="success-message">{actionMsg}</div>}

        <div className="tabs">
          {Object.entries(tabLabels).map(([key, label]) => (
            <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              {key === 'received' ? '📥' : key === 'sent' ? '📤' : '✅'} {label}
            </button>
          ))}
        </div>

        {tabData[tab].length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {tab === 'received' ? '📭' : tab === 'sent' ? '📨' : '🤝'}
            </div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>
              {tab === 'received' ? 'No pending requests' : tab === 'sent' ? 'No sent requests' : 'No active connections yet'}
            </p>
            <p style={{ fontSize: 14 }}>
              {tab === 'active' ? 'Accept connection requests to start building trust!' : ''}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {tabData[tab].map(conn => (
              <ConnectionCard
                key={conn.id}
                connection={conn}
                currentUserId={user?.id}
                onRespond={handleRespond}
                onTrustAgree={handleTrustAgree}
                onRevealContact={handleRevealContact}
                onViewContact={handleViewContact}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contact Info Modal */}
      {contactModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setContactModal(null) }}>
          <div className="modal-box">
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>💜 Contact Information</h2>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>Both parties have consented to share.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {contactModal.phone && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px', background: '#f7fafc', borderRadius: 8 }}>
                  <span style={{ fontSize: 20 }}>📱</span>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600 }}>Phone</div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{contactModal.phone}</div>
                  </div>
                </div>
              )}
              {contactModal.social_links && (() => {
                let links = contactModal.social_links
                if (typeof links === 'string') { try { links = JSON.parse(links) } catch { links = {} } }
                return Object.entries(links).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px', background: '#f7fafc', borderRadius: 8 }}>
                    <span style={{ fontSize: 20 }}>{k === 'instagram' ? '📸' : k === 'twitter' ? '🐦' : '💼'}</span>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600 }}>{k.charAt(0).toUpperCase() + k.slice(1)}</div>
                      <a href={v} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>{v}</a>
                    </div>
                  </div>
                ))
              })()}
              {!contactModal.phone && !contactModal.social_links && (
                <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '20px 0' }}>No contact info available.</p>
              )}
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={() => setContactModal(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  )
}
