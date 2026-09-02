import React, { useState, useMemo } from 'react'

export default function ChatsPage({
  conversations,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChats = useMemo(() => {
    if (!conversations || conversations.length === 0) return []
    const q = searchQuery.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter((c) =>
      c.title?.toLowerCase().includes(q) ||
      c.messages?.some((m) => m.content?.toLowerCase().includes(q))
    )
  }, [conversations, searchQuery])

  const formatLastActivity = (conv) => {
    if (!conv.updatedAt && !conv.id) return ''
    const ts = conv.updatedAt || Number(conv.id)
    if (!ts || isNaN(ts)) return ''
    const diffHours = Math.floor((Date.now() - ts) / (1000 * 60 * 60))
    if (diffHours < 1) return 'Active just now'
    if (diffHours < 24) return `Active ${diffHours}h ago`
    const days = Math.floor(diffHours / 24)
    return `Active ${days}d ago`
  }

  return (
    <main className="chats-page-view" style={{ display: 'flex' }}>
      <div className="chats-page-container">
        <header className="chats-header">
          <h1>Chats</h1>
          <button className="chats-new-btn" onClick={onNewChat} title="Start New Chat">
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New chat
          </button>
        </header>

        <div className="chats-search-container">
          <svg
            className="search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search your chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="chats-subheader">
          <span>Your chats with Stress AI ({conversations.length})</span>
        </div>

        <div className="chats-list-container">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className="chats-list-item"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                }}
                onClick={() => onSelectConversation(chat.id)}
              >
                <div style={{ overflow: 'hidden', flex: 1, marginRight: '16px' }}>
                  <h3>{chat.title || 'Untitled Chat'}</h3>
                  <p>
                    {chat.messages?.length || 0} messages • {formatLastActivity(chat)}
                  </p>
                </div>

                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#8e8ea0',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  title="Delete chat"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteConversation(chat.id)
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ef4444'
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#8e8ea0'
                    e.currentTarget.style.background = 'transparent'
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
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <div className="no-chats-msg">
              {searchQuery ? `No chats matching "${searchQuery}"` : 'No chats yet. Start a conversation!'}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
