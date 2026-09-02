import React from 'react'

const subtitleTexts = {
  login: 'تسجيل الدخول لمزامنة استشاراتك ومحادثاتك',
  signup: 'إنشاء حساب جديد لحفظ جلساتك بأمان',
}

export default function AuthModalHeader({ mode }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '18px' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(204, 120, 92, 0.15)',
          color: 'var(--accent, #cc785c)',
          marginBottom: '8px',
        }}
        aria-hidden="true"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>

      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.5rem',
          color: '#fbf9f5',
          margin: '0 0 4px',
        }}
      >
        Stress AI Helper
      </h2>

      <p
        style={{
          fontSize: '0.84rem',
          color: 'var(--text-subtle, #a09a90)',
          margin: 0,
        }}
      >
        {subtitleTexts[mode] || subtitleTexts.login}
      </p>
    </div>
  )
}
