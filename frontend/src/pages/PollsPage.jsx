import React, { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'

function PollCard({ poll, onVote }) {
  const [voting, setVoting] = useState(false)

  const totalVotes = poll.options?.reduce((s, o) => s + (o.vote_count || 0), 0) || 0
  const hasVoted = poll.options?.some(o => o.user_voted)
  const isActive = poll.status === 'active'

  const handleVote = async (optionId) => {
    if (!isActive || hasVoted || voting) return
    setVoting(true)
    try {
      await onVote(poll.id, optionId)
    } finally {
      setVoting(false)
    }
  }

  const getPct = (count) => totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100)

  return (
    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 }}>{poll.title}</h3>
        <span className="badge" style={{
          background: isActive ? 'rgba(72,187,120,0.12)' : '#edf2f7',
          color: isActive ? 'var(--trust-green)' : 'var(--text-light)',
          flexShrink: 0
        }}>
          {isActive ? '🟢 Active' : '⚫ Ended'}
        </span>
      </div>

      {poll.description && (
        <p style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.6, marginTop: -8 }}>{poll.description}</p>
      )}

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {poll.options?.map(option => {
          const pct = getPct(option.vote_count || 0)
          const voted = option.user_voted
          const canVote = isActive && !hasVoted && !voting

          return (
            <div
              key={option.id}
              onClick={() => canVote && handleVote(option.id)}
              style={{
                position: 'relative',
                padding: '11px 14px',
                borderRadius: 10,
                border: `2px solid ${voted ? 'var(--accent)' : 'var(--border)'}`,
                cursor: canVote ? 'pointer' : 'default',
                overflow: 'hidden',
                background: voted ? 'rgba(128,90,213,0.05)' : 'white',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { if (canVote) e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={e => { if (!voted) e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              {/* Vote bar background */}
              {(hasVoted || !isActive) && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${pct}%`,
                  background: voted ? 'rgba(128,90,213,0.1)' : 'rgba(0,0,0,0.03)',
                  transition: 'width 0.4s ease'
                }} />
              )}

              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {voted && <span style={{ fontSize: 14 }}>✓</span>}
                  <span style={{ fontSize: 14, fontWeight: voted ? 700 : 500, color: voted ? 'var(--accent)' : 'var(--text)' }}>
                    {option.option_text}
                  </span>
                </div>
                {(hasVoted || !isActive) && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: voted ? 'var(--accent)' : 'var(--text-light)' }}>
                    {pct}%
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
          🗳️ {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
        {!isActive && <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Poll has ended</span>}
        {isActive && hasVoted && <span style={{ fontSize: 12, color: 'var(--trust-green)', fontWeight: 600 }}>✓ You voted</span>}
        {isActive && !hasVoted && <span style={{ fontSize: 12, color: 'var(--accent)' }}>Click to vote</span>}
      </div>
    </div>
  )
}

export default function PollsPage() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [voteMsg, setVoteMsg] = useState('')

  const fetchPolls = useCallback(async () => {
    try {
      const res = await api.get('/polls')
      const data = Array.isArray(res.data) ? res.data : res.data.polls || []
      setPolls(data)
    } catch {
      setError('Failed to load polls.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPolls() }, [fetchPolls])

  const handleVote = async (pollId, optionId) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { option_id: optionId })
      await fetchPolls()
      setVoteMsg('🗳️ Vote recorded!')
      setTimeout(() => setVoteMsg(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to cast vote.')
      setTimeout(() => setError(''), 3000)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-loading"><div className="spinner spinner-dark" style={{ width: 36, height: 36, borderWidth: 3 }} /><span>Loading polls…</span></div>
      </>
    )
  }

  const active = polls.filter(p => p.status === 'active')
  const ended = polls.filter(p => p.status !== 'active')

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🗳️</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>Community Voice</h1>
          <p style={{ fontSize: 16, color: 'var(--text-light)', maxWidth: 480, margin: '0 auto' }}>
            Shape the future of SoulSync by voting on features you want most
          </p>
        </div>

        {error && <div className="error-message" style={{ maxWidth: 600, margin: '0 auto 20px' }}>{error}</div>}
        {voteMsg && <div className="success-message" style={{ maxWidth: 600, margin: '0 auto 20px' }}>{voteMsg}</div>}

        {polls.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No polls available yet</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--trust-green)', display: 'inline-block' }} />
                  Active Polls
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                  {active.map(poll => (
                    <PollCard key={poll.id} poll={poll} onVote={handleVote} />
                  ))}
                </div>
              </section>
            )}

            {ended.length > 0 && (
              <section>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-light)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-light)', display: 'inline-block' }} />
                  Past Polls
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                  {ended.map(poll => (
                    <PollCard key={poll.id} poll={poll} onVote={handleVote} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  )
}
