import React, { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import ProfileCard from '../components/ProfileCard'
import TrustBadge from '../components/TrustBadge'

const INTENTIONS = ['All', 'Long-term relationship', 'Friendship', 'Marriage', 'Not sure yet']
const PERSONALITIES = ['All', 'Introvert', 'Extrovert', 'Ambivert']
const SORT_OPTIONS = [
  { value: 'compatibility', label: 'Best Match' },
  { value: 'newest', label: 'Newest' },
  { value: 'trust', label: 'Highest Trust' },
]

export default function DiscoverPage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const [filters, setFilters] = useState({ intentions: 'All', personality: 'All', minAge: '', maxAge: '' })
  const [sortBy, setSortBy] = useState('compatibility')
  const [connectTarget, setConnectTarget] = useState(null)
  const [connectMsg, setConnectMsg] = useState('')
  const [connectLoading, setConnectLoading] = useState(false)
  const [connectSuccess, setConnectSuccess] = useState('')
  const [connectError, setConnectError] = useState('')

  const fetchProfiles = useCallback(async (pg = 1, append = false) => {
    try {
      const res = await api.get('/profiles', { params: { page: pg, limit: 12 } })
      const data = Array.isArray(res.data) ? res.data : res.data.profiles || res.data.data || []
      setProfiles(prev => append ? [...prev, ...data] : data)
      setHasMore(data.length === 12)
    } catch {
      setError('Failed to load profiles.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => { fetchProfiles(1) }, [fetchProfiles])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    setLoadingMore(true)
    fetchProfiles(nextPage, true)
  }

  const handleConnect = async () => {
    if (!connectTarget) return
    setConnectLoading(true)
    setConnectError('')
    try {
      await api.post('/connections', { recipient_id: connectTarget.id, message: connectMsg })
      setConnectSuccess(`Connection request sent to ${connectTarget.name}! 🎉`)
      setConnectTarget(null)
      setConnectMsg('')
      setTimeout(() => setConnectSuccess(''), 4000)
    } catch (err) {
      setConnectError(err.response?.data?.message || err.response?.data?.error || 'Failed to send request.')
    } finally {
      setConnectLoading(false)
    }
  }

  const sortedFiltered = () => {
    let list = [...profiles]

    if (filters.intentions !== 'All') list = list.filter(p => p.intentions === filters.intentions)
    if (filters.personality !== 'All') list = list.filter(p => p.personality_type === filters.personality)
    if (filters.minAge) list = list.filter(p => p.age >= Number(filters.minAge))
    if (filters.maxAge) list = list.filter(p => p.age <= Number(filters.maxAge))

    if (sortBy === 'compatibility') list.sort((a, b) => (b.compatibility_score ?? 0) - (a.compatibility_score ?? 0))
    else if (sortBy === 'trust') list.sort((a, b) => (b.trust_score ?? 0) - (a.trust_score ?? 0))
    else if (sortBy === 'newest') list.sort((a, b) => b.id - a.id)

    return list
  }

  const setFilter = (k, v) => setFilters(p => ({ ...p, [k]: v }))

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-loading"><div className="spinner spinner-dark" style={{ width: 36, height: 36, borderWidth: 3 }} /><span>Finding matches…</span></div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        {/* Header strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="section-title">Discover Connections</h1>
            <p className="section-subtitle">Find your compatible matches</p>
          </div>
          {user && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <TrustBadge score={user.trust_score} size="md" />
              </div>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {connectSuccess && <div className="success-message">{connectSuccess}</div>}

        {/* Filter + Sort bar */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label" style={{ marginBottom: 4 }}>Looking for</label>
            <select className="form-select" value={filters.intentions} onChange={e => setFilter('intentions', e.target.value)} style={{ fontSize: 13 }}>
              {INTENTIONS.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label className="form-label" style={{ marginBottom: 4 }}>Personality</label>
            <select className="form-select" value={filters.personality} onChange={e => setFilter('personality', e.target.value)} style={{ fontSize: 13 }}>
              {PERSONALITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div>
              <label className="form-label" style={{ marginBottom: 4 }}>Min Age</label>
              <input className="form-input" type="number" value={filters.minAge} onChange={e => setFilter('minAge', e.target.value)} placeholder="18" style={{ width: 70, fontSize: 13 }} />
            </div>
            <div>
              <label className="form-label" style={{ marginBottom: 4 }}>Max Age</label>
              <input className="form-input" type="number" value={filters.maxAge} onChange={e => setFilter('maxAge', e.target.value)} placeholder="60" style={{ width: 70, fontSize: 13 }} />
            </div>
          </div>
          <div style={{ minWidth: 140 }}>
            <label className="form-label" style={{ marginBottom: 4 }}>Sort by</label>
            <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ fontSize: 13 }}>
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Grid */}
        {sortedFiltered().length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No profiles match your filters</p>
            <p style={{ fontSize: 14 }}>Try adjusting your search criteria</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
              {sortedFiltered().map(profile => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onConnect={setConnectTarget}
                />
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button className="btn btn-secondary" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? <><span className="spinner spinner-dark" /> Loading…</> : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Connect Modal */}
      {connectTarget && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setConnectTarget(null) }}>
          <div className="modal-box">
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Connect with {connectTarget.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>
              Send a connection request with a personal message.
            </p>

            {connectError && <div className="error-message">{connectError}</div>}

            <div className="form-group">
              <label className="form-label">Message (optional)</label>
              <textarea
                className="form-input"
                rows={3}
                value={connectMsg}
                onChange={e => setConnectMsg(e.target.value)}
                placeholder={`Hi ${connectTarget.name}, I came across your profile and think we might connect well…`}
                style={{ resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setConnectTarget(null); setConnectError('') }}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConnect} disabled={connectLoading}>
                {connectLoading ? <span className="spinner" /> : '✨ Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
