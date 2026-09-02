import React, { useRef, useEffect } from 'react'
import { CHAT_TOPIC_CATEGORIES } from '../../data/chatCategories.js'

/**
 * Modern Chat Input Dock.
 * Features a full-width centered card, rounded-2xl smooth pill container,
 * auto-expanding textarea, warm terracotta send button, and voice dictation.
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

  const hasContent = Boolean(inputText.trim())

  return (
    <footer className="modern-input-dock">
      <div className="modern-input-wrapper">
        {/* Filter Pills Above Input (Only in Chat Mode) */}
        {isChatMode && (
          <div className="modern-filter-pills">
            <button
              type="button"
              className={`filter-pill ${!activeTopic ? 'active' : ''}`}
              onClick={() => setActiveTopic(null)}
            >
              <span>💬</span>
              <span>الكل</span>
            </button>

            {CHAT_TOPIC_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`filter-pill ${activeTopic?.id === cat.id ? 'active' : ''}`}
                onClick={() =>
                  setActiveTopic(activeTopic?.id === cat.id ? null : cat)
                }
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Rounded-2xl Modern Input Bar */}
        <div className="modern-input-card">
          <textarea
            ref={textareaRef}
            className="modern-textarea"
            value={inputText}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? '🎙️ جاري الاستماع... تحدث الآن...'
                : activeTopic
                ? `اكتب سؤالك حول ${activeTopic.label}...`
                : 'اكتب ما تشعر به هنا... (Enter للإرسال، Shift+Enter لسطر جديد)'
            }
            rows={1}
            disabled={isBotTyping}
            style={{
              direction: /[\u0600-\u06FF]/.test(inputText) ? 'rtl' : 'ltr',
            }}
          />

          <div className="modern-actions-group">
            {/* Mic Button */}
            <button
              type="button"
              className={`modern-mic-btn ${isListening ? 'listening' : ''}`}
              onClick={onToggleVoice}
              disabled={isBotTyping}
              title={
                isListening
                  ? 'جاري الاستماع... اضغط للإيقاف'
                  : 'إدخال صوتي مباشر (Voice Input)'
              }
              aria-label="تسجيل صوتي"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>

            {/* Terracotta Send Button */}
            <button
              type="button"
              className={`modern-send-btn ${hasContent && !isBotTyping ? 'active' : ''}`}
              onClick={handleSend}
              disabled={!hasContent || isBotTyping}
              aria-label="إرسال"
              title="إرسال الرسالة"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="modern-disclaimer-text">
          ⚠️ <strong>تنبيه إرشادي:</strong> Stress AI مساعد نفسي وتثقيفي سلوكي (CBT)، وليس بديلاً عن التشخيص الطبي أو الطوارئ. في الحالات الحرجة اتصل بـ <strong>16328</strong>.
        </div>
      </div>
    </footer>
  )
}
