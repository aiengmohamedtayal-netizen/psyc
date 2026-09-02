import React from 'react'

/**
 * Sidebar top header with application logo and drawer collapse toggle button.
 */
export default function SidebarHeader({ onToggle }) {
  return (
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

      <button
        type="button"
        className="sidebar-icon-btn"
        onClick={onToggle}
        title="Toggle Sidebar"
        aria-label="Toggle Sidebar"
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
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
      </button>
    </div>
  )
}
