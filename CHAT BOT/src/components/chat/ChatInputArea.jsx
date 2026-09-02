import React, { useRef, useEffect } from 'react'
import { CHAT_TOPIC_CATEGORIES } from '../../data/chatCategories.js'

/**
 * Chat input dock with auto-expanding textarea, voice input button,
 * topic selector pills, suggestion drawer, and medical disclaimer.
 */
export default function ChatInputArea({
  inputText,
  setInputText,
  isBotTyping,
  isListening,
  onToggleVoice,
  onSendMessage,
  activeTopic,
  setActiveTopic,
  showPanel,
  setShowPanel,
  isChatMode,
  conversationId,
}) {
  const textareaRef = useRef(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [conversationId])

  const handleInput = (event) => {
    const value = event.target.value
    setInputText(value)
    const target = event.target
    target.style.height = 'auto'
    target.style.height = `${Math.min(target.scrollHeight, 160)}px`
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    const text = inputText.trim()
    if (!text || isBotTyping) return

    onSendMessage(text, activeTopic?.id || null)
    setInputText('')

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setShowPanel(false)
  }

  const handleSelectTopicPrompt = (question, topicId) => {
    setShowPanel(false)
    onSendMessage(question, topicId)
  }

  return (
    <div className="input-container">
      {/* Topic selection chips in chat mode */}
      {isChatMode && (
        <div className="topic-bar">
          <button
            type="button"
            className={`topic-btn ${!activeTopic ? 'active' : ''}`}
            onClick={() => setActiveTopic(null)}
          >
            <span>💬</span>
            <span>الكل</span>
          </button>

          {CHAT_TOPIC_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`topic-btn ${activeTopic?.id === cat.id ? 'active' : ''}`}
              onClick={() =>
                setActiveTopic(activeTopic?.id === cat.id ? null : cat)
              }
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}

          <button
            type="button"
            className={`topic-btn prompts-toggle-btn ${showPanel ? 'active' : ''}`}
            onClick={() => setShowPanel(!showPanel)}
            title="اقتراحات الأسئلة السريعة"
          >
            <span>💡</span>
            <span>اقتراحات</span>
          </button>
        </div>
      )}

      {/* Floating Prompt Suggestions Drawer */}
      {showPanel && isChatMode && (
        <div className="quick-prompts-panel">
          <div className="panel-header">
            <span>💡 اختر سؤالاً للبدء فوراً:</span>
            <button
              type="button"
              className="close-panel-btn"
              onClick={() => setShowPanel(false)}
            >
              ✕
            </button>
          </div>
          <div className="panel-categories">
            {CHAT_TOPIC_CATEGORIES.map((cat) => (
              <div key={cat.id} className="panel-cat-group">
                <div className="panel-cat-title">
                  {cat.icon} {cat.label}
                </div>
                {cat.suggestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="panel-prompt-btn"
                    onClick={() => handleSelectTopicPrompt(q, cat.id)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="input-box">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? '🎙️ الاستماع جاري... تحدث الآن...'
              : activeTopic
              ? `اكتب رسالتك حول ${activeTopic.label}...`
              : 'اكتب ما تشعر به هنا... (Enter للإرسال، Shift+Enter لسطر جديد)'
          }
          rows={1}
          disabled={isBotTyping}
        />

        <div className="input-actions">
          <button
            type="button"
            className={`action-icon-btn voice-btn ${isListening ? 'listening' : ''}`}
            onClick={onToggleVoice}
            disabled={isBotTyping}
            title={
              isListening ? 'إيقاف التسجيل الصوتي' : 'تحدث بالصوت (إدخال صوتي)'
            }
            aria-label="تسجيل صوتي"
          >
            {isListening ? (
              <span className="recording-pulse">🔴</span>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className="send-btn"
            onClick={handleSend}
            disabled={!inputText.trim() || isBotTyping}
            aria-label="Send message"
            title="إرسال"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="input-footer">
        <span>
          Stress AI Helper قد يرتكب أخطاء. هذا التطبيق للمساعدة والدعم النفسي فقط ولا يغني عن الاستشارة الطبية المتخصصة.
        </span>
      </div>
    </div>
  )
}
