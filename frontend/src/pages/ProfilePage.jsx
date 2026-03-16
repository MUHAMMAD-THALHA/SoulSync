import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import Navbar from '../components/Navbar'
import TrustBadge from '../components/TrustBadge'

const VALUES_OPTIONS = ['Family', 'Career', 'Travel', 'Faith', 'Health', 'Education', 'Creativity', 'Freedom', 'Community', 'Adventure']
const INTERESTS_OPTIONS = ['Music', 'Hiking', 'Reading', 'Cooking', 'Sports', 'Technology', 'Art', 'Movies', 'Gaming', 'Yoga', 'Photography', 'Writing']

function CheckboxGroup({ options, selected, onChange, disabled }) {
  const toggle = (val) => {
    if (disabled) return
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val])
  }
  return (
    <div className="checkbox-grid">
      {options.map(opt => (
        <label key={opt} className={`checkbox-item ${selected.includes(opt) ? 'checked' : ''} ${disabled ? '' : ''}`}
          onClick={() => toggle(opt)}
          style={{ cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.7 : 1 }}>
          <input type="checkbox" readOnly checked={selected.includes(opt)} />
          <span>{selected.includes(opt) ? '✓ ' : ''}{opt}</span>
        </label>
      ))}
    </div>
  )
}

function ProfileCompletion({ user }) {
  const fields = ['name', 'age', 'bio', 'location', 'education', 'occupation', 'gender', 'personality_type', 'lifestyle', 'intentions']
  const parseList = (v) => {
    if (!v) return []
    if (Array.isArray(v)) return v
    try { return JSON.parse(v) } catch { return [] }
  }
  const filled = fields.filter(f => user[f]).length
  const hasValues = parseList(user.values).length > 0 ? 1 : 0
  const hasInterests = parseList(user.interests).length > 0 ? 1 : 0
  const total = fields.length + 2
  const pct = Math.round(((filled + hasValues + hasInterests) / total) * 100)

  const color = pct >= 80 ? 'var(--trust-green)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)'

  return (
    <div style={{ background: '#f7fafc', borderRadius: 10, padding: '14px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Profile Completion</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      {pct < 100 && <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 6 }}>Complete your profile to improve match quality</p>}
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(null)

  const parseList = (v) => {
    if (!v) return []
    if (Array.isArray(v)) return v
    try { return JSON.parse(v) } catch { return [] }
  }

  const parseSocial = (v) => {
    if (!v) return { instagram: '', twitter: '', linkedin: '' }
    if (typeof v === 'object' && !Array.isArray(v)) return v
    try { return JSON.parse(v) } catch { return { instagram: '', twitter: '', linkedin: '' } }
  }

  useEffect(() => {
    if (user && !form) {
      setForm({
        name: user.name || '',
        age: user.age || '',
        bio: user.bio || '',
        location: user.location || '',
        education: user.education || '',
        occupation: user.occupation || '',
        gender: user.gender || '',
        personality_type: user.personality_type || '',
        lifestyle: user.lifestyle || '',
        intentions: user.intentions || '',
        phone: user.phone || '',
        values: parseList(user.values),
        interests: parseList(user.interests),
        social_links: parseSocial(user.social_links)
      })
    }
  }, [user])

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const handleSocialChange = e => setForm(p => ({ ...p, social_links: { ...p.social_links, [e.target.name]: e.target.value } }))

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : undefined,
        values: JSON.stringify(form.values),
        interests: JSON.stringify(form.interests),
        social_links: JSON.stringify(form.social_links)
      }
      const res = await api.put('/profiles/me', payload)
      updateUser(res.data)
      setSuccess('Profile saved successfully! ✨')
      setEditing(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  if (!user || !form) {
    return (
      <>
        <Navbar />
        <div className="page-loading"><div className="spinner spinner-dark" /><span>Loading profile…</span></div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="section-title">My Profile</h1>
            <p className="section-subtitle">Manage your SoulSync identity</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {editing ? (
              <>
                <button className="btn btn-secondary" onClick={() => { setEditing(false); setError('') }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <span className="spinner" /> : '💾 Save'}
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
          {/* Left sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Avatar + trust */}
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{
                width: 90, height: 90,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 700, color: 'white',
                margin: '0 auto 14px'
              }}>
                {(user.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{user.name}</h2>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>{user.email}</p>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <TrustBadge score={user.trust_score} size="lg" />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-light)' }}>Trust Score</p>
            </div>

            {/* Profile completion */}
            <div className="card" style={{ padding: 20 }}>
              <ProfileCompletion user={user} />
            </div>

            {/* Phone (own view only) */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>📱 Contact Info</h3>
              <p style={{ fontSize: 11, color: 'var(--warning)', marginBottom: 10, background: '#fffbeb', padding: '6px 10px', borderRadius: 6 }}>
                🔒 Hidden from others until mutual reveal
              </p>
              {editing ? (
                <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 000 0000" style={{ fontSize: 13 }} />
              ) : (
                <span style={{ fontSize: 14, color: 'var(--text)' }}>{user.phone || '—'}</span>
              )}
            </div>
          </div>

          {/* Right content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Basic info */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, color: 'var(--text)' }}>Basic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Full Name', name: 'name', placeholder: 'Your name' },
                  { label: 'Age', name: 'age', placeholder: '25', type: 'number' },
                  { label: 'Location', name: 'location', placeholder: 'City, Country' },
                  { label: 'Occupation', name: 'occupation', placeholder: 'What do you do?' },
                  { label: 'Education', name: 'education', placeholder: 'Your education' },
                ].map(f => (
                  <div key={f.name} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{f.label}</label>
                    {editing ? (
                      <input className="form-input" name={f.name} type={f.type || 'text'} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} style={{ fontSize: 13 }} />
                    ) : (
                      <span style={{ fontSize: 14, color: user[f.name] ? 'var(--text)' : 'var(--text-light)' }}>{user[f.name] || '—'}</span>
                    )}
                  </div>
                ))}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Gender</label>
                  {editing ? (
                    <select className="form-select" name="gender" value={form.gender} onChange={handleChange} style={{ fontSize: 13 }}>
                      <option value="">Select…</option>
                      <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                    </select>
                  ) : (
                    <span style={{ fontSize: 14, color: user.gender ? 'var(--text)' : 'var(--text-light)' }}>{user.gender || '—'}</span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 14 }} className="form-group">
                <label className="form-label">Bio</label>
                {editing ? (
                  <textarea className="form-input" name="bio" value={form.bio} onChange={handleChange} placeholder="Tell your story…" rows={3} style={{ resize: 'vertical', fontSize: 13 }} />
                ) : (
                  <p style={{ fontSize: 14, color: user.bio ? 'var(--text)' : 'var(--text-light)', lineHeight: 1.6 }}>{user.bio || 'No bio yet'}</p>
                )}
              </div>
            </div>

            {/* Personality */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, color: 'var(--text)' }}>Personality & Lifestyle</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Personality', name: 'personality_type', opts: ['Introvert', 'Extrovert', 'Ambivert'] },
                  { label: 'Lifestyle', name: 'lifestyle', opts: ['Active', 'Homebody', 'Social', 'Adventurous'] },
                  { label: 'Looking for', name: 'intentions', opts: ['Long-term relationship', 'Friendship', 'Marriage', 'Not sure yet'] },
                ].map(f => (
                  <div key={f.name} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{f.label}</label>
                    {editing ? (
                      <select className="form-select" name={f.name} value={form[f.name]} onChange={handleChange} style={{ fontSize: 13 }}>
                        <option value="">Select…</option>
                        {f.opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(128,90,213,0.1)', color: 'var(--accent)', fontSize: 12 }}>
                        {user[f.name] || '—'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Values */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>Values</h3>
              {editing ? (
                <CheckboxGroup options={VALUES_OPTIONS} selected={form.values} onChange={v => setForm(p => ({ ...p, values: v }))} />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {parseList(user.values).length > 0
                    ? parseList(user.values).map(v => (
                      <span key={v} className="badge" style={{ background: 'rgba(72,187,120,0.12)', color: 'var(--trust-green)', fontSize: 12 }}>{v}</span>
                    ))
                    : <span style={{ color: 'var(--text-light)', fontSize: 14 }}>None selected</span>
                  }
                </div>
              )}
            </div>

            {/* Interests */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>Interests</h3>
              {editing ? (
                <CheckboxGroup options={INTERESTS_OPTIONS} selected={form.interests} onChange={v => setForm(p => ({ ...p, interests: v }))} />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {parseList(user.interests).length > 0
                    ? parseList(user.interests).map(i => (
                      <span key={i} className="badge" style={{ background: 'rgba(102,126,234,0.1)', color: 'var(--primary-start)', fontSize: 12 }}>{i}</span>
                    ))
                    : <span style={{ color: 'var(--text-light)', fontSize: 14 }}>None selected</span>
                  }
                </div>
              )}
            </div>

            {/* Social links */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>Social Links</h3>
              <p style={{ fontSize: 11, color: 'var(--warning)', marginBottom: 14, background: '#fffbeb', padding: '6px 10px', borderRadius: 6 }}>
                🔒 Only revealed after mutual contact consent
              </p>
              {[
                { key: 'instagram', label: '📸 Instagram', placeholder: 'https://instagram.com/yourhandle' },
                { key: 'twitter', label: '🐦 Twitter / X', placeholder: 'https://twitter.com/yourhandle' },
                { key: 'linkedin', label: '💼 LinkedIn', placeholder: 'https://linkedin.com/in/yourname' },
              ].map(s => (
                <div key={s.key} className="form-group">
                  <label className="form-label">{s.label}</label>
                  {editing ? (
                    <input className="form-input" type="url" name={s.key} value={form.social_links[s.key]} onChange={handleSocialChange} placeholder={s.placeholder} style={{ fontSize: 13 }} />
                  ) : (
                    <span style={{ fontSize: 14, color: 'var(--text)' }}>{parseSocial(user.social_links)[s.key] || '—'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .page-wrapper > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
