import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useEscapeKey } from '../hooks/useEscapeKey.js'

/**
 * Fast search dialog filtering past conversations and messages.
 */
export default function SearchModal({
  isOpen,
  onClose,
  conversations,
  onSelectConversation,
}) {
  const [query, setQuery] = useState('')
  const modalRef = useRef(null)
  const inputRef = useRef(null)

  useEscapeKey(isOpen, onClose)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose()
    }
  }

  const results = useMemo(() => {
    if (!conversations || conversations.length === 0) return []
    const cleanQuery = query.trim().toLowerCase()
    if (!cleanQuery) {
      return conversations.slice(0, 8)
    }

    return conversations.filter((conv) => {
      const matchTitle = conv.title?.toLowerCase().includes(cleanQuery)
      const matchMessage = conv.messages?.some((message) =>
        message.content?.toLowerCase().includes(cleanQuery)
      )
      return matchTitle || matchMessage
    })
  }, [conversations, query])

  if (!isOpen) return null

  return (
    <div
      className="search-modal-overlay"
      onClick={handleClickOutside}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="search-modal-content"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
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
          <button
            type="button"
            className="close-search-btn"
            onClick={onClose}
            title="Close (Esc)"
            aria-label="Close"
          >
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
                role="button"
                tabIndex={0}
                onClick={() => {
                  onSelectConversation(conv.id)
                  onClose()
                }}
              >
                <div className="search-result-title">
                  {conv.title || 'Untitled chat'}
                </div>
                <div className="search-result-preview">
                  {conv.messages && conv.messages.length > 0
                    ? conv.messages[conv.messages.length - 1].content
                    : 'No messages yet'}
                </div>
              </div>
            ))
          ) : (
            <div className="search-empty">
              {query.trim() ? 'No matching conversations' : 'Type to search...'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
