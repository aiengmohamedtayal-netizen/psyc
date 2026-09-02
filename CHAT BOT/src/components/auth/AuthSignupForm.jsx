import React from 'react'
import FormInput from './FormInput.jsx'

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '11px',
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

export default function AuthSignupForm({
  name,
  username,
  password,
  confirmPassword,
  isLoading,
  onNameChange,
  onUsernameChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} style={formStyle}>
      <FormInput
        id="signup-name"
        label="الاسم أو اللقب (Display Name)"
        placeholder="الاسم المفضل لك..."
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />

      <FormInput
        id="signup-username"
        label="اسم المستخدم (Username)"
        placeholder="اسم مستخدم فريد..."
        value={username}
        onChange={(e) => onUsernameChange(e.target.value)}
        required
      />

      <FormInput
        id="signup-password"
        type="password"
        label="كلمة المرور (Password)"
        placeholder="4 أحرف على الأقل..."
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        required
      />

      <FormInput
        id="signup-confirm-password"
        type="password"
        label="تأكيد كلمة المرور"
        placeholder="أعد كتابة كلمة المرور..."
        value={confirmPassword}
        onChange={(e) => onConfirmPasswordChange(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={isLoading}
        style={getSubmitButtonStyle(isLoading)}
      >
        {isLoading ? 'جارٍ الحفظ...' : 'إنشاء الحساب والدخول ➔'}
      </button>
    </form>
  )
}
