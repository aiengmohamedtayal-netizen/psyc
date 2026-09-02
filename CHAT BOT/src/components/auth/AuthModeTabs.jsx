import React from 'react'

const containerStyle = {
  display: 'flex',
  background: 'var(--bg-main, #1f1e1d)',
  padding: '4px',
  borderRadius: '8px',
  marginBottom: '16px',
  border: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
}

const getTabStyle = (isActive) => ({
  flex: 1,
  padding: '8px',
  borderRadius: '6px',
  border: 'none',
  background: isActive ? 'var(--accent, #cc785c)' : 'transparent',
  color: isActive ? '#fff' : 'var(--text-subtle, #a09a90)',
  fontWeight: isActive ? 600 : 400,
  fontSize: '0.85rem',
  cursor: 'pointer',
  transition: 'all 0.18s ease',
  fontFamily: 'inherit',
})

export default function AuthModeTabs({ currentMode, onSelectMode }) {
  return (
    <div style={containerStyle} role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={currentMode === 'login'}
        style={getTabStyle(currentMode === 'login')}
        onClick={() => onSelectMode('login')}
      >
        تسجيل الدخول
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={currentMode === 'signup'}
        style={getTabStyle(currentMode === 'signup')}
        onClick={() => onSelectMode('signup')}
      >
        إنشاء حساب جديد
      </button>
    </div>
  )
}
