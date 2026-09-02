import React from 'react'
import { CHAT_TOPIC_CATEGORIES } from '../../data/chatCategories.js'

/**
 * Modern Empty-State Suggestions Panel.
 * Features a centered welcome hero, clear category headers, and interactive
 * clickable pill buttons with subtle hover elevation.
 */
export default function SuggestionsPanel({ onSelectSuggestion }) {
  return (
    <div className="empty-hero-container">
      <div className="empty-hero-icon">🧠</div>
      <h1 className="empty-hero-title">مرحباً، كيف تشعر اليوم؟</h1>
      <p className="empty-hero-subtitle">
        مساعدك الشخصي للتعامل مع التوتر والضغوط النفسية. اختر موضوعاً من الأسئلة الشائعة أدناه أو اكتب ما يدور في ذهنك بحرية.
      </p>

      <div className="modern-suggestions-grid">
        {CHAT_TOPIC_CATEGORIES.map((cat) => (
          <div key={cat.id} className="suggestion-category-group">
            <div className="suggestion-category-header">
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </div>

            <div className="suggestion-pills-row">
              {cat.suggestions.map((question, index) => (
                <button
                  key={index}
                  type="button"
                  className="suggestion-pill-btn"
                  onClick={() => onSelectSuggestion(question, cat.id)}
                >
                  <span>{question}</span>
                  <span className="suggestion-pill-arrow">←</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
