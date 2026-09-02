import React from 'react'
import { marked } from 'marked'
import ClinicalCard from './ClinicalCard.jsx'

marked.setOptions({
  breaks: true,
  gfm: true,
})

/**
 * Renders an individual chat message bubble (User or Bot) with markdown parsing,
 * clinical citations, copy-to-clipboard, and text-to-speech triggers.
 */
export default function MessageBubble({
  message,
  copiedId,
  speakingId,
  onCopy,
  onSpeak,
}) {
  const isUser = message.role === 'user'
  const isCopied = copiedId === message.id
  const isSpeaking = speakingId === message.id

  return (
    <div className={`message-item ${message.role}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '✳'}
      </div>

      <div className="message-bubble">
        {isUser ? (
          <p className="user-text">{message.content}</p>
        ) : (
          <>
            <div className="bot-header">
              <span className="bot-name">Stress AI</span>
              {message.enhanced_by_ai ? (
                <span className="ai-badge" title="تمت صياغة الإجابة بتعزيز من الذكاء الاصطناعي المتقدم">
                  ✨ محسّن بالذكاء الاصطناعي السريري
                </span>
              ) : (
                <span className="ai-badge nlp-badge" title="تمت الاستجابة من قاعدة المعرفة الدقيقة">
                  🎯 نموذج NLP الدقيق
                </span>
              )}
            </div>

            <div
              className="message-markdown"
              dangerouslySetInnerHTML={{
                __html: marked.parse(message.content || ''),
              }}
            />

            {message.isStreaming && <span className="typing-cursor" />}

            <ClinicalCard reference={message.clinical_reference} />

            <div className="message-actions">
              <button
                type="button"
                className={`msg-action-btn ${isCopied ? 'copied' : ''}`}
                onClick={() => onCopy(message.id, message.content)}
                title={isCopied ? 'تم النسخ!' : 'نسخ النص'}
                aria-label="نسخ النص"
              >
                {isCopied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>تم النسخ</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>نسخ</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className={`msg-action-btn ${isSpeaking ? 'speaking' : ''}`}
                onClick={() => onSpeak(message.id, message.content)}
                title={isSpeaking ? 'إيقاف القراءة الصوتية' : 'استماع للرسالة'}
                aria-label="قراءة صوتية"
              >
                {isSpeaking ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    <span>إيقاف</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    <span>استماع</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
