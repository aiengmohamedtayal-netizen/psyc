import React from 'react'

/**
 * Header component of the main chat window.
 * Constrained by a max-width centered container with comfortable padding.
 * Houses mobile sidebar toggle, breathing exercise quick action,
 * markdown export, and emergency quick exit.
 */
export default function ChatHeader({
  onToggleSidebar,
  onOpenBreathing,
  onExportChat,
  isChatMode,
}) {
  const handleQuickExit = () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch {
      // ignore
    }
    window.location.replace('https://www.google.com')
  }

  return (
    <header className="modern-app-header">
      <div className="modern-header-inner">
        <div className="header-left">
          <button
            type="button"
            className="icon-btn menu-btn"
            onClick={onToggleSidebar}
            aria-label="Open Menu"
            title="القائمة"
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
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span
            className="app-title"
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              fontSize: '1.1rem',
              color: '#fbf9f5',
            }}
          >
            Stress AI
          </span>
        </div>

        <div className="header-right">
          <button
            type="button"
            className="action-btn breathing-btn hide-mobile"
            onClick={onOpenBreathing}
            title="تمرين التنفس السريع"
          >
            <span className="action-icon">🫁</span>
            <span>تمرين التنفس</span>
          </button>

          {isChatMode && onExportChat && (
            <button
              type="button"
              className="action-btn export-btn hide-mobile"
              onClick={onExportChat}
              title="تصدير المحادثة بتنسيق Markdown"
            >
              <span className="action-icon">📥</span>
              <span>تصدير</span>
            </button>
          )}

          <button
            type="button"
            className="action-btn quick-exit-btn"
            onClick={handleQuickExit}
            title="الخروج السريع وحذف البيانات المؤقتة فوراً (Emergency Exit)"
          >
            <span className="action-icon">🚪</span>
            <span>خروج سريع</span>
          </button>
        </div>
      </div>
    </header>
  )
}
