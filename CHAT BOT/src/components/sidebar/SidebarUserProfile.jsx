import React from 'react'

/**
 * Sidebar footer rendering authenticated user badge with logout,
 * or guest badge with login/signup modal trigger.
 */
export default function SidebarUserProfile({
  currentUser,
  onLogout,
  onOpenAuth,
}) {
  const userDisplayName = currentUser?.name || currentUser?.username || 'User'
  const userInitial = (userDisplayName || 'U')[0].toUpperCase()

  return (
    <div className="sidebar-footer">
      {currentUser ? (
        <div className="user-profile-badge">
          <div className="user-avatar-circle" title={userDisplayName}>
            {userInitial}
          </div>
          <div className="user-details-text">
            <span className="user-fullname">{userDisplayName}</span>
            <span className="user-sync-status">🟢 متصل ومحفوظ</span>
          </div>
          <button
            type="button"
            className="user-logout-btn"
            onClick={onLogout}
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
        <div className="guest-auth-prompt" onClick={onOpenAuth} role="button" tabIndex={0}>
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
