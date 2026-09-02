import React from 'react'
import { getNotionAvatarUrl } from '../../services/authStorage.js'

/**
 * Sidebar footer rendering authenticated user badge with Notion-style illustrated avatar,
 * or guest badge with login/signup modal trigger.
 */
export default function SidebarUserProfile({
  currentUser,
  onLogout,
  onOpenAuth,
  onOpenProfile,
}) {
  const userDisplayName = currentUser?.name || currentUser?.username || 'User'
  const avatarSeed = currentUser?.avatarSeed || currentUser?.username || 'User'
  const avatarUrl = getNotionAvatarUrl(avatarSeed)

  return (
    <div className="sidebar-footer">
      {currentUser ? (
        <div
          className="user-profile-badge"
          onClick={onOpenProfile}
          style={{
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          title="عرض وتعديل الملف الشخصي"
          role="button"
          tabIndex={0}
        >
          {/* Circular Notion-style Illustrated Avatar */}
          <div
            className="user-avatar-circle"
            style={{
              overflow: 'hidden',
              background: 'rgba(204, 120, 92, 0.12)',
              border: '1px solid var(--border-color, #383531)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              flexShrink: 0,
            }}
          >
            <img
              src={avatarUrl}
              alt={userDisplayName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.innerText = (userDisplayName[0] || 'U').toUpperCase()
              }}
            />
          </div>

          <div className="user-details-text" style={{ flex: 1, minWidth: 0 }}>
            <span
              className="user-fullname"
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
              }}
            >
              {userDisplayName}
            </span>
            <span className="user-sync-status">🟢 متصل ومحفوظ</span>
          </div>

          <button
            type="button"
            className="user-logout-btn"
            onClick={(e) => {
              e.stopPropagation()
              onLogout()
            }}
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          className="guest-auth-prompt"
          onClick={onOpenAuth}
          role="button"
          tabIndex={0}
          style={{ cursor: 'pointer' }}
        >
          <div className="guest-avatar-circle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="user-details-text">
            <span className="guest-title">زائر (Guest)</span>
            <span className="guest-hint">حفظ الجلسات سحابياً ➔</span>
          </div>
        </div>
      )}
    </div>
  )
}
