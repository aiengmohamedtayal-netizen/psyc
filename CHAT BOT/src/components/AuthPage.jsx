import React, { useRef } from 'react'
import { useEscapeKey } from '../hooks/useEscapeKey.js'
import { useAuthForm } from '../hooks/useAuthForm.js'
import AuthModalHeader from './auth/AuthModalHeader.jsx'
import AuthModeTabs from './auth/AuthModeTabs.jsx'
import AuthErrorMessage from './auth/AuthErrorMessage.jsx'
import AuthLoginForm from './auth/AuthLoginForm.jsx'
import AuthSignupForm from './auth/AuthSignupForm.jsx'

const overlayStyle = {
  alignItems: 'center',
  paddingTop: 0,
}

const modalContentStyle = {
  maxWidth: '420px',
  width: '90%',
  padding: '28px 24px',
  position: 'relative',
  background: 'var(--bg-card, #272522)',
  border: '1px solid var(--border-color, #383531)',
  borderRadius: '12px',
  color: 'var(--text-main, #ece8e1)',
}

const closeButtonStyle = {
  position: 'absolute',
  top: '16px',
  right: '16px',
}

const footerNoticeStyle = {
  marginTop: '14px',
  textAlign: 'center',
  fontSize: '0.78rem',
  color: 'var(--text-subtle, #a09a90)',
}

/**
 * Authentication dialog component.
 * Allows users to log in or register, syncing with the backend or local storage fallback.
 *
 * @param {object} props
 * @param {boolean} [props.isOpen=true]
 * @param {() => void} [props.onClose]
 * @param {(user: object) => void} props.onLoginSuccess
 */
export default function AuthPage({ isOpen = true, onClose, onLoginSuccess }) {
  const modalRef = useRef(null)

  // Attach Escape keyboard shortcut
  useEscapeKey(isOpen, onClose)

  const auth = useAuthForm({ onLoginSuccess, onClose })

  if (!isOpen) return null

  const handleBackdropClick = (event) => {
    if (onClose && event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="search-modal-overlay"
      style={overlayStyle}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="search-modal-content"
        ref={modalRef}
        style={modalContentStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <button
            type="button"
            className="close-search-btn"
            onClick={onClose}
            style={closeButtonStyle}
            title="إغلاق (Esc)"
            aria-label="إغلاق"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        <AuthModalHeader mode={auth.mode} />

        <AuthModeTabs
          currentMode={auth.mode}
          onSelectMode={auth.switchMode}
        />

        <AuthErrorMessage message={auth.error} />

        {auth.mode === 'login' ? (
          <AuthLoginForm
            username={auth.username}
            password={auth.password}
            isLoading={auth.isLoading}
            onUsernameChange={auth.setUsername}
            onPasswordChange={auth.setPassword}
            onSubmit={auth.handleLoginSubmit}
          />
        ) : (
          <AuthSignupForm
            name={auth.name}
            username={auth.username}
            password={auth.password}
            confirmPassword={auth.confirmPassword}
            isLoading={auth.isLoading}
            onNameChange={auth.setName}
            onUsernameChange={auth.setUsername}
            onPasswordChange={auth.setPassword}
            onConfirmPasswordChange={auth.setConfirmPassword}
            onSubmit={auth.handleSignupSubmit}
          />
        )}

        <div style={footerNoticeStyle}>
          🔒 بياناتك مشفرة ومحفوظة بأمان محلياً وسحابياً.
        </div>
      </div>
    </div>
  )
}
