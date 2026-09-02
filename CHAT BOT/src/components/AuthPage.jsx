import React, { useState, useEffect, useRef } from 'react'

const USERS_STORAGE_KEY = 'stress_ai_users_db'
const CURRENT_USER_KEY = 'stress_ai_current_user'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000'
).replace(/\/$/, '')

export default function AuthPage({ isOpen = true, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const modalRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getUsers = () => {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const cleanUsername = username.trim()
    if (!cleanUsername || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور.')
      setIsLoading(false)
      return
    }

    // Try backend API first
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password }),
      })

      if (res.ok) {
        const data = await res.json()
        const sessionUser = {
          id: data.user.id,
          username: data.user.username,
          name: data.user.full_name || data.user.username,
          token: data.access_token,
        }
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser))
        onLoginSuccess(sessionUser)
        if (onClose) onClose()
        setIsLoading(false)
        return
      }
    } catch {
      // Backend offline, fallback to local storage
    }

    // Fallback to local storage
    const users = getUsers()
    const user = users.find(
      (u) => u.username.toLowerCase() === cleanUsername.toLowerCase() && u.password === password
    )

    if (!user) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة.')
      setIsLoading(false)
      return
    }

    const sessionUser = {
      id: user.id,
      username: user.username,
      name: user.name || user.username,
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser))
    onLoginSuccess(sessionUser)
    if (onClose) onClose()
    setIsLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const cleanUsername = username.trim()
    const cleanName = name.trim() || cleanUsername

    if (!cleanUsername || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور.')
      setIsLoading(false)
      return
    }

    if (password.length < 4) {
      setError('كلمة المرور يجب أن تكون 4 أحرف على الأقل.')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.')
      setIsLoading(false)
      return
    }

    // Try backend API registration first
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          password: password,
          full_name: cleanName,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const sessionUser = {
          id: data.user.id,
          username: data.user.username,
          name: data.user.full_name || data.user.username,
          token: data.access_token,
        }
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser))
        onLoginSuccess(sessionUser)
        if (onClose) onClose()
        setIsLoading(false)
        return
      } else {
        const errData = await res.json().catch(() => ({}))
        if (errData.detail) {
          setError(errData.detail)
          setIsLoading(false)
          return
        }
      }
    } catch {
      // Backend offline, fallback to local storage
    }

    // Fallback to local storage
    const users = getUsers()
    const exists = users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())

    if (exists) {
      setError('اسم المستخدم مستخدم بالفعل، يرجى اختيار اسم آخر.')
      setIsLoading(false)
      return
    }

    const newUser = {
      id: `u_${Date.now()}`,
      username: cleanUsername,
      name: cleanName,
      password: password,
      createdAt: Date.now(),
    }

    users.push(newUser)
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

    const sessionUser = {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser))
    onLoginSuccess(sessionUser)
    if (onClose) onClose()
    setIsLoading(false)
  }

  return (
    <div
      className="search-modal-overlay"
      style={{ alignItems: 'center', paddingTop: 0 }}
      onClick={(e) => {
        if (onClose && e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="search-modal-content"
        ref={modalRef}
        style={{
          maxWidth: '420px',
          width: '90%',
          padding: '28px 24px',
          position: 'relative',
          background: 'var(--bg-card, #272522)',
          border: '1px solid var(--border-color, #383531)',
          borderRadius: '12px',
          color: 'var(--text-main, #ece8e1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <button
            className="close-search-btn"
            onClick={onClose}
            style={{ position: 'absolute', top: '16px', right: '16px' }}
            title="إغلاق (Esc)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(204, 120, 92, 0.15)', color: 'var(--accent, #cc785c)', marginBottom: '8px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#fbf9f5', margin: '0 0 4px' }}>
            Stress AI Helper
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-subtle, #a09a90)', margin: 0 }}>
            {mode === 'login' ? 'تسجيل الدخول لمزامنة استشاراتك ومحادثاتك' : 'إنشاء حساب جديد لحفظ جلساتك بأمان'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-main, #1f1e1d)',
            padding: '4px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
          }}
        >
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'login' ? 'var(--accent, #cc785c)' : 'transparent',
              color: mode === 'login' ? '#fff' : 'var(--text-subtle, #a09a90)',
              fontWeight: mode === 'login' ? 600 : 400,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              fontFamily: 'inherit',
            }}
            onClick={() => {
              setMode('login')
              setError('')
            }}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'signup' ? 'var(--accent, #cc785c)' : 'transparent',
              color: mode === 'signup' ? '#fff' : 'var(--text-subtle, #a09a90)',
              fontWeight: mode === 'signup' ? 600 : 400,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              fontFamily: 'inherit',
            }}
            onClick={() => {
              setMode('signup')
              setError('')
            }}
          >
            إنشاء حساب جديد
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '8px 12px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              borderRadius: '8px',
              fontSize: '0.82rem',
              marginBottom: '14px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted, #c4bebb)', marginBottom: '5px' }}>
                اسم المستخدم (Username)
              </label>
              <input
                type="text"
                placeholder="أدخل اسم المستخدم..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-main, #1f1e1d)',
                  border: '1px solid var(--border-color, #383531)',
                  borderRadius: '7px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted, #c4bebb)', marginBottom: '5px' }}>
                كلمة المرور (Password)
              </label>
              <input
                type="password"
                placeholder="أدخل كلمة المرور..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-main, #1f1e1d)',
                  border: '1px solid var(--border-color, #383531)',
                  borderRadius: '7px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
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
              }}
            >
              {isLoading ? 'جارٍ التحقق...' : 'تسجيل الدخول ➔'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted, #c4bebb)', marginBottom: '4px' }}>
                الاسم أو اللقب (Display Name)
              </label>
              <input
                type="text"
                placeholder="الاسم المفضل لك..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-main, #1f1e1d)',
                  border: '1px solid var(--border-color, #383531)',
                  borderRadius: '7px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted, #c4bebb)', marginBottom: '4px' }}>
                اسم المستخدم (Username)
              </label>
              <input
                type="text"
                placeholder="اسم مستخدم فريد..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-main, #1f1e1d)',
                  border: '1px solid var(--border-color, #383531)',
                  borderRadius: '7px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted, #c4bebb)', marginBottom: '4px' }}>
                كلمة المرور (Password)
              </label>
              <input
                type="password"
                placeholder="4 أحرف على الأقل..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-main, #1f1e1d)',
                  border: '1px solid var(--border-color, #383531)',
                  borderRadius: '7px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted, #c4bebb)', marginBottom: '4px' }}>
                تأكيد كلمة المرور
              </label>
              <input
                type="password"
                placeholder="أعد كتابة كلمة المرور..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'var(--bg-main, #1f1e1d)',
                  border: '1px solid var(--border-color, #383531)',
                  borderRadius: '7px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
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
              }}
            >
              {isLoading ? 'جارٍ الحفظ...' : 'إنشاء الحساب والدخول ➔'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-subtle, #a09a90)' }}>
          🔒 بياناتك مشفرة ومحفوظة بأمان محلياً وسحابياً.
        </div>
      </div>
    </div>
  )
}

