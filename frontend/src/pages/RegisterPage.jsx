import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const VALUES_OPTIONS = ['Family', 'Career', 'Travel', 'Faith', 'Health', 'Education', 'Creativity', 'Freedom', 'Community', 'Adventure']
const INTERESTS_OPTIONS = ['Music', 'Hiking', 'Reading', 'Cooking', 'Sports', 'Technology', 'Art', 'Movies', 'Gaming', 'Yoga', 'Photography', 'Writing']

const STEPS = ['Basic Info', 'Personality & Lifestyle', 'Values & Interests']

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 36, height: 36,
              borderRadius: '50%',
              background: i < current ? 'var(--trust-green)' : i === current
                ? 'linear-gradient(135deg, var(--primary-start), var(--primary-end))'
                : '#e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700,
              color: i <= current ? 'white' : 'var(--text-light)',
              transition: 'all 0.3s'
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: i === current ? 'var(--accent)' : 'var(--text-light)', whiteSpace: 'nowrap' }}>
              {s}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              flex: 1, height: 2, margin: '0 8px', marginBottom: 20,
              background: i < current ? 'var(--trust-green)' : 'var(--border)',
              transition: 'background 0.3s'
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function CheckboxGroup({ options, selected, onChange }) {
  const toggle = (val) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val])
  }
  return (
    <div className="checkbox-grid">
      {options.map(opt => (
        <label key={opt} className={`checkbox-item ${selected.includes(opt) ? 'checked' : ''}`} onClick={() => toggle(opt)}>
          <input type="checkbox" readOnly checked={selected.includes(opt)} />
          <span>{selected.includes(opt) ? '✓ ' : ''}{opt}</span>
        </label>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', name: '', age: '', gender: '',
    personality_type: '', lifestyle: '', intentions: '', location: '',
    values: [], interests: []
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const handleChange = e => set(e.target.name, e.target.value)

  const validateStep = () => {
    if (step === 0) {
      if (!form.email || !form.password || !form.name || !form.age)
        return 'Please fill in all required fields.'
      if (form.password.length < 6)
        return 'Password must be at least 6 characters.'
      if (form.password !== form.confirmPassword)
        return 'Passwords do not match.'
    }
    return null
  }

  const nextStep = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        email: form.email,
        password: form.password,
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        personality_type: form.personality_type,
        lifestyle: form.lifestyle,
        intentions: form.intentions,
        location: form.location,
        values: JSON.stringify(form.values),
        interests: JSON.stringify(form.interests)
      }
      await api.post('/auth/register', payload)
      await login(form.email, form.password)
      navigate('/profile')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24
    }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: '44px 40px',
        width: '100%',
        maxWidth: 520,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>💜</div>
          <h1 style={{
            fontSize: 26,
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--primary-start), var(--primary-end))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 4
          }}>Join SoulSync</h1>
          <p style={{ color: 'var(--text-light)', fontSize: 13 }}>Create your trust profile</p>
        </div>

        <StepIndicator current={step} />

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={step === 2 ? handleSubmit : e => { e.preventDefault(); nextStep() }}>
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <input className="form-input" type="number" name="age" value={form.age} onChange={handleChange} placeholder="25" min="18" max="99" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">Select…</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Non-binary</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Password * <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(min 6 chars)</span></label>
                <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Choose a strong password" required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input className="form-input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" required />
              </div>
            </div>
          )}

          {/* Step 1: Personality & Lifestyle */}
          {step === 1 && (
            <div>
              <div className="form-group">
                <label className="form-label">Personality Type</label>
                <select className="form-select" name="personality_type" value={form.personality_type} onChange={handleChange}>
                  <option value="">Select…</option>
                  <option>Introvert</option>
                  <option>Extrovert</option>
                  <option>Ambivert</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Lifestyle</label>
                <select className="form-select" name="lifestyle" value={form.lifestyle} onChange={handleChange}>
                  <option value="">Select…</option>
                  <option>Active</option>
                  <option>Homebody</option>
                  <option>Social</option>
                  <option>Adventurous</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Looking for</label>
                <select className="form-select" name="intentions" value={form.intentions} onChange={handleChange}>
                  <option value="">Select…</option>
                  <option>Long-term relationship</option>
                  <option>Friendship</option>
                  <option>Marriage</option>
                  <option>Not sure yet</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="City, Country" />
              </div>
            </div>
          )}

          {/* Step 2: Values & Interests */}
          {step === 2 && (
            <div>
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: 10 }}>Your Values <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>— pick what matters most</span></label>
                <CheckboxGroup options={VALUES_OPTIONS} selected={form.values} onChange={v => set('values', v)} />
              </div>
              <div className="form-group" style={{ marginTop: 20 }}>
                <label className="form-label" style={{ marginBottom: 10 }}>Your Interests <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>— pick what you enjoy</span></label>
                <CheckboxGroup options={INTERESTS_OPTIONS} selected={form.interests} onChange={v => set('interests', v)} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {step > 0 && (
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setError(''); setStep(s => s - 1) }}>
                ← Back
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, padding: '12px', fontSize: 15, borderRadius: 10 }}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : step < 2 ? 'Continue →' : '🎉 Create Account'}
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-light)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
