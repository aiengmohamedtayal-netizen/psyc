import React, { useState, useEffect } from 'react'
import { useEscapeKey } from '../hooks/useEscapeKey.js'
import {
  getNotionAvatarUrl,
  updateSessionUser,
} from '../services/authStorage.js'

/**
 * Profile Settings Modal.
 * Allows authenticated users to customize their display name,
 * generate fun Notion-style illustrated avatars via DiceBear API,
 * view account status, and manage local data.
 */
export default function ProfileSettingsModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) {
  const [displayName, setDisplayName] = useState('')
  const [avatarSeed, setAvatarSeed] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEscapeKey(isOpen, onClose)

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.name || currentUser.username || '')
      setAvatarSeed(currentUser.avatarSeed || currentUser.username || 'User')
      setSaveSuccess(false)
    }
  }, [currentUser, isOpen])

  if (!isOpen || !currentUser) return null

  const handleRandomizeAvatar = () => {
    const randomSeeds = [
      'Felix', 'Aneka', 'Oliver', 'Milo', 'Luna', 'Cleo', 'Buster', 'Jasper',
      'Toby', 'Pepper', 'Zoe', 'Sam', 'Robin', 'Charlie', 'Max', 'Alex',
      'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Dakota', 'Reese',
    ]
    const randomName = randomSeeds[Math.floor(Math.random() * randomSeeds.length)]
    const newSeed = `${randomName}_${Math.floor(Math.random() * 10000)}`
    setAvatarSeed(newSeed)
    setSaveSuccess(false)
  }

  const handleSaveChanges = (e) => {
    e.preventDefault()
    const cleanName = displayName.trim() || currentUser.username
    const updated = updateSessionUser({
      name: cleanName,
      avatarSeed: avatarSeed,
    })

    if (updated && onUpdateUser) {
      onUpdateUser(updated)
    }

    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
      onClose()
    }, 600)
  }

  const handleResetLocalData = () => {
    if (
      window.confirm(
        'هل أنت متأكد من رغبتك في مسح المحادثات المحلية المحفوظة؟ (لن يتم حذف حسابك)'
      )
    ) {
      const convKey = `stress_ai_conversations_${currentUser.username}`
      localStorage.removeItem(convKey)
      window.location.reload()
    }
  }

  const avatarUrl = getNotionAvatarUrl(avatarSeed)

  return (
    <div
      className="search-modal-overlay"
      style={{ alignItems: 'center', paddingTop: 0 }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="search-modal-content"
        style={{
          maxWidth: '480px',
          width: '92%',
          padding: '28px 24px',
          position: 'relative',
          background: 'var(--bg-card, #272522)',
          border: '1px solid var(--border-color, #383531)',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.45)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="close-search-btn"
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px' }}
          title="إغلاق (Esc)"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#fbf9f5', margin: 0 }}>
            إعدادات الحساب والصورة الشخصية
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            خصص صورتك الرمزية بأسلوب Notion المميز وحدّث اسمك الشخصي
          </p>
        </div>

        {/* Avatar Showcase Section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '24px',
            padding: '16px',
            background: 'var(--bg-main, #1f1e1d)',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
          }}
        >
          {/* Large Notion Avatar Preview */}
          <div
            style={{
              width: '106px',
              height: '106px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'radial-gradient(circle, rgba(204, 120, 92, 0.15) 0%, rgba(39, 37, 34, 0.6) 100%)',
              border: '2.5px solid var(--accent, #cc785c)',
              boxShadow: '0 0 24px rgba(204, 120, 92, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              transition: 'transform 0.2s ease',
            }}
          >
            <img
              src={avatarUrl}
              alt="Notion Style Avatar"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleRandomizeAvatar}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              borderRadius: '20px',
              background: 'rgba(204, 120, 92, 0.14)',
              border: '1px solid rgba(204, 120, 92, 0.35)',
              color: 'var(--accent, #cc785c)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
            title="توليد شخصية كرتونية جديدة"
          >
            <span>🎲 صورة عشوائية جديدة</span>
          </button>
        </div>

        {/* User Info Form */}
        <form onSubmit={handleSaveChanges}>
          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                textAlign: 'right',
              }}
            >
              اسم المستخدم (Username)
            </label>
            <input
              type="text"
              value={`@${currentUser.username}`}
              readOnly
              disabled
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color, #383531)',
                borderRadius: '8px',
                color: 'var(--text-subtle)',
                fontSize: '0.9rem',
                cursor: 'not-allowed',
                boxSizing: 'border-box',
                direction: 'ltr',
              }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                textAlign: 'right',
              }}
            >
              الاسم المعروض (Display Name)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="اكتب اسمك المفضل هنا..."
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg-main, #1f1e1d)',
                border: '1px solid var(--border-color, #383531)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                direction: 'rtl',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Account Status Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'var(--bg-main, #1f1e1d)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px',
              fontSize: '0.8rem',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>حالة المزامنة السحابية:</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>🟢 متصل ومحفوظ سحابياً</span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <button
              type="submit"
              className="auth-submit-btn"
              style={{ flex: 1 }}
            >
              {saveSuccess ? '✓ تم حفظ التغييرات بنجاح' : 'حفظ التغييرات'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid var(--border-color, #383531)',
                color: 'var(--text-muted)',
                fontSize: '0.88rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              إلغاء
            </button>
          </div>

          {/* Danger Zone: Reset Data */}
          <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
            <button
              type="button"
              onClick={handleResetLocalData}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.78rem',
                cursor: 'pointer',
                opacity: 0.8,
                padding: '4px',
              }}
              title="مسح جلسات المحادثة المحلية فقط"
            >
              🗑️ مسح المحادثات المحلية المحفوظة
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
