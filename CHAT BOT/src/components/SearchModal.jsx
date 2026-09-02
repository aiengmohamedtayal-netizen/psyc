import React, { useState, useEffect, useRef, useMemo } from 'react'

export default function SearchModal({ isOpen, onClose, conversations, onSelectConversation }) {
  const [query, setQuery] = useState('')
  const modalRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose()
    }
  }

  const results = useMemo(() => {
    if (!conversations || conversations.length === 0) return []
    const q = query.trim().toLowerCase()
    if (!q) {
      return conversations.slice(0, 8)
    }
    return conversations.filter((conv) => {
      const matchTitle = conv.title?.toLowerCase().includes(q)
      const matchMessage = conv.messages?.some((m) =>
        m.content?.toLowerCase().includes(q)
      )
      return matchTitle || matchMessage
    })
  }, [conversations, query])

  if (!isOpen) return null

  return (
    <div className="search-modal-overlay" onClick={handleClickOutside}>
      <div className="search-modal-content" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <svg
            className="search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search chats and messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="close-search-btn" onClick={onClose} title="Close (Esc)">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="search-modal-results">
          {results.length > 0 ? (
            results.map((conv) => (
              <div
                key={conv.id}
                className="search-result-item"
                onClick={() => {
                  onSelectConversation(conv.id)
                  onClose()
                }}
              >
                <div className="item-left">
                  <svg
                    className="item-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="item-title">{conv.title || 'Untitled Chat'}</span>
                </div>
                <span className="item-time">
                  {conv.messages?.length || 0} messages
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#8e8ea0', fontSize: '0.875rem' }}>
              {query ? `No chats matching "${query}"` : 'No conversations yet.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
