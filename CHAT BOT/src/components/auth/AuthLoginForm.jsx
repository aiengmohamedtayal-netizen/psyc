import React from 'react'
import FormInput from './FormInput.jsx'

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
}

const getSubmitButtonStyle = (isLoading) => ({
  marginTop: '4px',
  padding: '11px',
  background: 'var(--accent, #cc785c)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: isLoading ? 'wait' : 'pointer',
  transition: 'opacity 0.2s',
  fontFamily: 'inherit',
})

export default function AuthLoginForm({
  username,
  password,
  isLoading,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} style={formStyle}>
      <FormInput
        id="login-username"
        label="اسم المستخدم (Username)"
        placeholder="أدخل اسم المستخدم..."
        value={username}
        onChange={(e) => onUsernameChange(e.target.value)}
        autoFocus
        required
      />

      <FormInput
        id="login-password"
        type="password"
        label="كلمة المرور (Password)"
        placeholder="أدخل كلمة المرور..."
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={isLoading}
        style={getSubmitButtonStyle(isLoading)}
      >
        {isLoading ? 'جارٍ التحقق...' : 'تسجيل الدخول ➔'}
      </button>
    </form>
  )
}
