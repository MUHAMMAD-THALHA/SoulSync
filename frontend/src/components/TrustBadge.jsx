import React from 'react'

export default function TrustBadge({ score, size = 'md' }) {
  const numScore = Number(score) || 0
  const color = numScore >= 70 ? '#48bb78' : numScore >= 40 ? '#ed8936' : '#e53e3e'
  const label = numScore >= 70 ? 'High Trust' : numScore >= 40 ? 'Growing' : 'New'

  const sizes = {
    sm: { outer: 40, font: 12, label: false },
    md: { outer: 56, font: 14, label: true },
    lg: { outer: 72, font: 18, label: true }
  }
  const s = sizes[size] || sizes.md

  const radius = (s.outer / 2) - 4
  const circumference = 2 * Math.PI * radius
  const strokeDash = (numScore / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: s.outer, height: s.outer }}>
        <svg width={s.outer} height={s.outer} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={4}
          />
          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <span style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: s.font,
          fontWeight: 700,
          color
        }}>
          {numScore}
        </span>
      </div>
      {s.label && (
        <span style={{ fontSize: 10, fontWeight: 600, color, letterSpacing: 0.5 }}>{label}</span>
      )}
    </div>
  )
}
