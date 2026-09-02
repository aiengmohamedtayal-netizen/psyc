import React from 'react'

/**
 * Renders the scrollable conversation history inside the sidebar.
 */
export default function SidebarConversationList({
  conversations,
  activeId,
  onSelect,
  onDeleteConversation,
}) {
  return (
    <div className="sidebar-history">
      <div className="history-header">
        <span className="history-title">السجل الأخير</span>
        <span className="history-count">{conversations.length}</span>
      </div>

      {conversations.length === 0 ? (
        <div className="empty-history">
          <p>لا توجد محادثات سابقة</p>
        </div>
      ) : (
        <div className="history-list">
          {conversations.map((conv) => {
            const isActive = conv.id === activeId
            return (
              <div
                key={conv.id}
                className={`history-item-wrapper ${isActive ? 'active' : ''}`}
              >
                <button
                  type="button"
                  className="history-item"
                  onClick={() => onSelect(conv.id)}
                  title={conv.title || 'محادثة'}
                >
                  <span className="history-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </span>
                  <span className="history-text">
                    {conv.title || 'محادثة بدون عنوان'}
                  </span>
                </button>

                <button
                  type="button"
                  className="history-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteConversation(conv.id)
                  }}
                  title="حذف المحادثة"
                  aria-label="حذف المحادثة"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
