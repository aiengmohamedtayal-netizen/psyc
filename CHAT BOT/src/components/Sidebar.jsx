import React from 'react'
import { getNotionAvatarUrl } from '../services/authStorage.js'

export default function Sidebar({
  conversations = [],
  activeId,
  currentView,
  onNewChat,
  onSelect,
  onOpenSearch,
  onOpenChats,
  onDeleteConversation,
  isOpen,
  onToggle,
  onOpenBreathing,
  onOpenAssessments,
  onOpenAmbientSounds,
  onOpenWorryDump,
  onOpenMoodTracker,
  currentUser,
  onLogout,
  onOpenAuth,
  onOpenProfile,
}) {
  const userDisplayName = currentUser?.name || currentUser?.username || 'User'
  const userInitial = (userDisplayName || 'U')[0].toUpperCase()
  const avatarSeed = currentUser?.avatarSeed || currentUser?.username || 'User'
  const avatarUrl = getNotionAvatarUrl(avatarSeed)

  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''} ${isOpen ? 'mobile-open' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#cc785c"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="2" x2="12" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
          </svg>
          <span className="sidebar-title">Stress AI</span>
        </div>
        <button className="sidebar-icon-btn" onClick={onToggle} title="Toggle Sidebar">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      </div>

      {/* Navigation Tools */}
      <nav className="sidebar-nav">
        <button className="menu-item" onClick={onNewChat} title="Start new chat">
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

        <button className="menu-item" onClick={onOpenSearch} title="Search chats (Ctrl+K)">
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
          <span className="menu-badge">{conversations.length}</span>
        </button>

        <div className="nav-group-divider" />

        {/* Breathing Exercise */}
        <button
          className="menu-item"
          onClick={onOpenBreathing}
          title="Guided 4-7-8 Breathing"
        >
          <div className="menu-item-left">
            <span className="menu-icon" style={{ color: '#cc785c' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
            </span>
            <span className="menu-text">تمرين التنفس 4-7-8</span>
          </div>
          <span className="menu-badge">تمرين</span>
        </button>

        {/* Clinical Psychological Assessments */}
        <button
          className="menu-item"
          onClick={onOpenAssessments}
          title="اختبارات سريرية معتمدة: PHQ-9 للاكتئاب، GAD-7 للقلق، PSS للتوتر"
        >
          <div className="menu-item-left">
            <span className="menu-icon" style={{ color: '#38bdf8' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </span>
            <span className="menu-text">اختبارات نفسية سريرية</span>
          </div>
          <span className="menu-badge">معتمد</span>
        </button>

        {/* Ambient Sounds */}
        <button
          className="menu-item"
          onClick={onOpenAmbientSounds}
          title="صوتيات الاسترخاء والمطر في الخلفية"
        >
          <div className="menu-item-left">
            <span className="menu-icon" style={{ color: '#eab308' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </span>
            <span className="menu-text">أصوات استرخاء وبيضاء</span>
          </div>
          <span className="menu-badge">صوتيات</span>
        </button>

        {/* Worry Dump Journal */}
        <button
          className="menu-item"
          onClick={onOpenWorryDump}
          title="مفكرة تفريغ الأفكار والقلق قبل النوم"
        >
          <div className="menu-item-left">
            <span className="menu-icon" style={{ color: '#f43f5e' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </span>
            <span className="menu-text">صندوق تفريغ القلق 🔥</span>
          </div>
          <span className="menu-badge">تفريغ</span>
        </button>

        {/* Mood Tracker */}
        <button
          className="menu-item"
          onClick={onOpenMoodTracker}
          title="متابعة الحالة المزاجية اليومية والتعافي"
        >
          <div className="menu-item-left">
            <span className="menu-icon" style={{ color: '#10b981' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </span>
            <span className="menu-text">متتبع المزاج اليومي 📈</span>
          </div>
          <span className="menu-badge">يومي</span>
        </button>
      </nav>

      <div className="sidebar-divider" />

      {/* Recents Conversation History */}
      <div className="recents-section">
        <h3 className="recents-title">المحادثات الأخيرة</h3>
        <div className="history-list">
          {conversations.length > 0 ? (
            conversations.map((chat) => (
              <div
                key={chat.id}
                className={`history-item-wrapper ${chat.id === activeId && currentView === 'chat' ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: '8px',
                  padding: '2px 8px',
                  transition: 'background 0.15s ease',
                }}
              >
                <button
                  className="history-item"
                  onClick={() => onSelect(chat.id)}
                  title={chat.title}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: 'right',
                    direction: 'rtl',
                    background: 'none',
                    border: 'none',
                    color: chat.id === activeId && currentView === 'chat' ? '#fff' : 'var(--text-muted, #a39e93)',
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    padding: '8px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', opacity: 0.6, flexShrink: 0 }}>💬</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.title}
                  </span>
                </button>

                {onDeleteConversation && (
                  <button
                    className="history-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteConversation(chat.id)
                    }}
                    title="حذف المحادثة"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-subtle, #757066)',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.6,
                      transition: 'opacity 0.2s, color 0.2s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1'
                      e.currentTarget.style.color = '#ef4444'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.6'
                      e.currentTarget.style.color = 'var(--text-subtle, #757066)'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            ))
          ) : (
            <div style={{ padding: '12px 10px', fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
              لا توجد محادثات سابقة
            </div>
          )}
        </div>
      </div>

      {/* User Profile / Login Area in Sidebar */}
      {currentUser ? (
        <div
          className="user-profile"
          onClick={onOpenProfile}
          title="عرض وتعديل الملف الشخصي"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            cursor: 'pointer',
            borderTop: '1px solid var(--border-subtle)',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          {/* Notion Avatar with White Circle Background */}
          <div
            className="user-avatar"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#ffffff',
              padding: '2px',
              border: '1.5px solid var(--accent, #cc785c)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <img
              src={avatarUrl}
              alt={userDisplayName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '50%',
                display: 'block',
              }}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.style.background = 'rgba(204, 120, 92, 0.2)'
                e.target.parentElement.innerText = userInitial
              }}
            />
          </div>

          <div
            className="user-info"
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <span
              className="user-name"
              style={{
                fontSize: '0.88rem',
                fontWeight: 600,
                color: 'var(--text-main, #f7f4ed)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {userDisplayName}
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                lineHeight: 1,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  display: 'inline-block',
                }}
              />
              متصل ومحفوظ
            </span>
          </div>

          {onLogout && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onLogout()
              }}
              className="sidebar-icon-btn"
              title="تسجيل الخروج (Log out)"
              style={{
                color: 'var(--text-subtle)',
                padding: '6px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-subtle)'
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <div
          className="user-profile"
          onClick={onOpenAuth}
          title="تسجيل الدخول أو إنشاء حساب"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            cursor: 'pointer',
            borderTop: '1px solid var(--border-subtle)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <div
            className="user-avatar"
            style={{
              background: 'rgba(204, 120, 92, 0.2)',
              color: 'var(--accent, #cc785c)',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg
              width="16"
              height="16"
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
          <div className="user-info">
            <span
              className="user-name"
              style={{
                color: 'var(--accent, #cc785c)',
                fontWeight: 600,
                fontSize: '0.88rem',
              }}
            >
              تسجيل الدخول
            </span>
          </div>
          <span style={{ color: 'var(--accent, #cc785c)', fontSize: '0.85rem' }}>➔</span>
        </div>
      )}
    </aside>
  )
}
