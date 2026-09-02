import React from 'react'
import { CHAT_TOPIC_CATEGORIES } from '../../data/chatCategories.js'

/**
 * Empty state view displaying friendly welcome prompt and thematic category cards.
 */
export default function SuggestionsPanel({ onSelectSuggestion }) {
  return (
    <div className="welcome-container">
      <div className="welcome-icon">🧠</div>
      <h1 className="welcome-title">مرحباً، كيف تشعر اليوم؟</h1>
      <p className="welcome-subtitle">
        مساعدك الشخصي للتعامل مع التوتر والضغوط النفسية. اختر موضوعاً أو اكتب ما يدور في ذهنك بحرية.
      </p>

      <div className="categories-grid">
        {CHAT_TOPIC_CATEGORIES.map((cat) => (
          <div key={cat.id} className="category-column">
            <div className="category-header">
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.label}</span>
            </div>
            <div className="prompts-list">
              {cat.suggestions.map((question, index) => (
                <button
                  key={index}
                  type="button"
                  className="prompt-card"
                  onClick={() => onSelectSuggestion(question, cat.id)}
                >
                  <span>{question}</span>
                  <span className="arrow-icon">←</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
