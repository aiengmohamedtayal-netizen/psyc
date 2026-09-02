import React from 'react'

/**
 * Sidebar navigation list containing all main links and interactive tools.
 */
export default function SidebarNavGroup({
  currentView,
  conversationsCount,
  onNewChat,
  onOpenSearch,
  onOpenChats,
  onOpenBreathing,
  onOpenAssessments,
  onOpenAmbientSounds,
  onOpenWorryDump,
  onOpenMoodTracker,
}) {
  return (
    <nav className="sidebar-nav">
      <button
        type="button"
        className="menu-item"
        onClick={onNewChat}
        title="Start new chat"
      >
        <div className="menu-item-left">
          <span className="menu-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          <span className="menu-text">محادثة جديدة (New chat)</span>
        </div>
      </button>

      <button
        type="button"
        className="menu-item"
        onClick={onOpenSearch}
        title="Search chats (Ctrl+K)"
      >
        <div className="menu-item-left">
          <span className="menu-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <span className="menu-text">بحث (Search)</span>
        </div>
        <span className="menu-badge">Ctrl K</span>
      </button>

      <button
        type="button"
        className={`menu-item ${currentView === 'chats' ? 'active' : ''}`}
        onClick={onOpenChats}
        title="All chats"
      >
        <div className="menu-item-left">
          <span className="menu-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <span className="menu-text">المحادثات (Chats)</span>
        </div>
        <span className="menu-badge">{conversationsCount}</span>
      </button>

      <div className="nav-group-divider" />

      <button
        type="button"
        className="menu-item"
        onClick={onOpenBreathing}
        title="تمرين التنفس المهدئ"
      >
        <div className="menu-item-left">
          <span className="menu-icon" style={{ color: '#cc785c' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v18" />
              <path d="M3 12h18" />
            </svg>
          </span>
          <span className="menu-text">تمرين التنفس 4-7-8</span>
        </div>
        <span className="menu-badge live-badge">تمرين</span>
      </button>

      <button
        type="button"
        className="menu-item"
        onClick={onOpenAssessments}
        title="مقاييس القلق والاكتئاب المعتمدة"
      >
        <div className="menu-item-left">
          <span className="menu-icon" style={{ color: '#88a384' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </span>
          <span className="menu-text">اختبارات نفسية سريرية</span>
        </div>
        <span className="menu-badge verified-badge">معتمد</span>
      </button>

      <button
        type="button"
        className="menu-item"
        onClick={onOpenAmbientSounds}
        title="أصوات مهدئة وموسيقى تركيز"
      >
        <div className="menu-item-left">
          <span className="menu-icon" style={{ color: '#689d8b' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </span>
          <span className="menu-text">أصوات استرخاء وبيضاء</span>
        </div>
        <span className="menu-badge sound-badge">صوتيات</span>
      </button>

      <button
        type="button"
        className="menu-item"
        onClick={onOpenWorryDump}
        title="تفريغ القلق والمخاوف مع التدمير الرمزي"
      >
        <div className="menu-item-left">
          <span className="menu-icon" style={{ color: '#d97706' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </span>
          <span className="menu-text">صندوق تفريغ القلق 🔥</span>
        </div>
        <span className="menu-badge fire-badge">تفريغ</span>
      </button>

      <button
        type="button"
        className="menu-item"
        onClick={onOpenMoodTracker}
        title="سجل ومتابعة حالتك المزاجية اليومية"
      >
        <div className="menu-item-left">
          <span className="menu-icon" style={{ color: '#ec4899' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </span>
          <span className="menu-text">متتبع المزاج اليومي</span>
        </div>
        <span className="menu-badge mood-badge">يومي</span>
      </button>
    </nav>
  )
}
