import React from 'react'

const errorBadgeStyle = {
  padding: '8px 12px',
  background: 'rgba(239, 68, 68, 0.12)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  color: '#fca5a5',
  borderRadius: '8px',
  fontSize: '0.82rem',
  marginBottom: '14px',
  textAlign: 'center',
}

export default function AuthErrorMessage({ message }) {
  if (!message) return null

  return (
    <div style={errorBadgeStyle} role="alert">
      {message}
    </div>
  )
}
