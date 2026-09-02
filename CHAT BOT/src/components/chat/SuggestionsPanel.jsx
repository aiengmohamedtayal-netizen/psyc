import React, { useState } from 'react'
import { CHAT_TOPIC_CATEGORIES } from '../../data/chatCategories.js'

/**
 * Modern Streamlined Suggestions Panel.
 * Avoids visual clutter:
 * - Category tabs are placed at the TOP under the subtitle.
 * - Displays ONLY 3 to 4 cards max in a clean 2x2 grid.
 * - Interactive filtering on tab click.
 * - Clean Claude-style card surfaces.
 */
export default function SuggestionsPanel({ onSelectSuggestion }) {
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { id: 'all', label: 'الكل', icon: '💬' },
    ...CHAT_TOPIC_CATEGORIES,
  ]

  // Pick only 3-4 clean questions based on selected tab
  const getSuggestions = () => {
    if (activeTab === 'all') {
      return [
        { text: 'عندي ضغط وتوتر شديد ومحتاج مساعدة', catId: 'stress' },
        { text: 'How to calm down anxiety quickly?', catId: 'anxiety' },
        { text: 'مش عارف أنام وتعبان من التفكير', catId: 'sleep' },
        { text: 'مش قادر أركز في المذاكرة وحاسس بتشتت', catId: 'study' },
      ]
    }
    const cat = CHAT_TOPIC_CATEGORIES.find((c) => c.id === activeTab)
    if (!cat) return []
    return cat.suggestions.slice(0, 4).map((text) => ({
      text,
      catId: cat.id,
    }))
  }

  const currentSuggestions = getSuggestions()

  return (
    <div className="empty-hero-container">
      <div className="empty-hero-icon">🧠</div>
      <h1 className="empty-hero-title">مرحباً، كيف تشعر اليوم؟</h1>
      <p className="empty-hero-subtitle">
        مساعدك الشخصي للدعم النفسي والتثقيف السلوكي (CBT). اختر موضوعاً أو ابدأ بطرح سؤالك مباشرة.
      </p>

      {/* Category Tabs AT THE TOP */}
      <div className="hero-category-tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              className={`hero-category-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Spacious 2x2 Grid with only 3 to 4 Cards Max */}
      <div className="hero-suggestions-grid">
        {currentSuggestions.map((item, index) => {
          const isArabic = /[\u0600-\u06FF]/.test(item.text)
          return (
            <button
              key={index}
              type="button"
              className="hero-suggestion-card"
              onClick={() => onSelectSuggestion(item.text, item.catId)}
              style={{
                direction: isArabic ? 'rtl' : 'ltr',
                textAlign: isArabic ? 'right' : 'left',
              }}
            >
              <span className="card-text">{item.text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
