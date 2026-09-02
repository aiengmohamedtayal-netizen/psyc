import React, { useRef, useEffect, useState } from 'react'
import { marked } from 'marked'

marked.setOptions({
  breaks: true,
  gfm: true,
})

export default function ChatWindow({
  conversation,
  onSendMessage,
  isBotTyping,
  onToggleSidebar,
  onNewChat,
  onOpenBreathing,
  onExportChat,
}) {
  const [activeTopic, setActiveTopic] = useState(null)
  const [showPanel, setShowPanel] = useState(false)
  const [inputText, setInputText] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [speakingId, setSpeakingId] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  const handleQuickExit = () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch {}
    window.location.replace('https://www.google.com')
  }

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('عذراً، متصفحك لا يدعم الإدخال الصوتي المباشر. يرجى تجربة متصفح Google Chrome أو Microsoft Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'ar-EG'
      recognition.interimResults = true
      recognition.continuous = false

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('')
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript))
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  const textareaRef = useRef(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages, isBotTyping])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [conversation?.id])

  // Stop speech when conversation changes or unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [conversation?.id])

  const handleInput = (e) => {
    setInputText(e.target.value)
    const target = e.target
    target.style.height = 'auto'
    target.style.height = `${Math.min(target.scrollHeight, 160)}px`
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (question, topicId) => {
    setShowPanel(false)
    onSendMessage(question, topicId)
  }

  const isArabicText = (str) => {
    return /[\u0600-\u06FF]/.test(str || '')
  }

  const handleCopy = (msgId, text) => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(msgId)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const handleSpeak = (msgId, text) => {
    if (!('speechSynthesis' in window)) return

    if (speakingId === msgId) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = isArabicText(text) ? 'ar-SA' : 'en-US'
    utterance.rate = 0.95
    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)
    setSpeakingId(msgId)
    window.speechSynthesis.speak(utterance)
  }

  const categories = [
    {
      id: 'stress',
      label: 'Stress',
      icon: '⚡',
      suggestions: [
        'I feel stressed and overwhelmed',
        'How to reduce stress quickly?',
        'عندي ضغط وتوتر شديد',
        'مش قادر أتحمل الضغط ده',
        'Work stress is too much'
      ],
    },
    {
      id: 'anxiety',
      label: 'Anxiety',
      icon: '🧠',
      suggestions: [
        'حاسس بقلق طول الوقت',
        'مش عارف أوقف تفكير',
        'How to calm down anxiety?',
        'قلبي بيدق بسرعة وخايف',
        'I feel anxious and nervous'
      ],
    },
    {
      id: 'sleep',
      label: 'Sleep',
      icon: '🌙',
      suggestions: [
        'مش عارف أنام وتعبان',
        'I have insomnia and cant sleep',
        'How to improve my sleep routine?',
        'بصحى متوتر في نص الليل',
        'I wake up feeling exhausted'
      ],
    },
    {
      id: 'study',
      label: 'Study',
      icon: '📘',
      suggestions: [
        'مش قادر أركز في المذاكرة',
        'I keep procrastinating on studying',
        'قلقان جداً من الامتحان',
        'How to study with anxiety?',
        'عندي تشتت ومش عارف أبدأ'
      ],
    },
    {
      id: 'motivation',
      label: 'Motivation',
      icon: '🔥',
      suggestions: [
        'حاسس بإحباط ومفيش شغف',
        'I have no motivation today',
        'How to get back on track?',
        'نفسيتي محبطة ومش قادر أتحرك',
        'How to take the first small step?'
      ],
    },
  ]

  const isChatMode = Boolean(conversation?.messages && conversation.messages.length > 0)

  return (
    <main className={`main-content ${isChatMode ? 'chat-mode' : ''}`}>
      {/* Mobile & Desktop Header Bar */}
      <div className="mobile-topbar">
        <button
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          title="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="mobile-title">Stress AI</span>
          <button
            onClick={onOpenBreathing}
            className="header-pill-btn"
            title="Guided 4-7-8 Breathing"
          >
            🧘 Breathing
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isChatMode && (
            <button
              className="mobile-new-btn"
              onClick={onExportChat}
              aria-label="Export conversation"
              title="Export chat as Markdown"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          )}

          {/* Quick-Exit Panic Button */}
          <button
            className="header-pill-btn"
            onClick={handleQuickExit}
            title="خروج سريع فوري ومحو الآثار لحماية الخصوصية"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              background: 'rgba(239, 68, 68, 0.08)',
              fontSize: '0.78rem',
              padding: '4px 9px',
            }}
          >
            🚪 خروج سريع
          </button>

          <button
            className="mobile-new-btn"
            onClick={onNewChat}
            aria-label="New chat"
            title="New Chat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Claude Editorial Message Stream */}
      <div className="messages-container">
        {conversation?.messages?.map((msg, idx) => {
          const isAr = isArabicText(msg.content)
          const isUser = msg.role === 'user'

          return isUser ? (
            <div key={msg.id || idx} className="message-row user-row">
              <div
                className="user-bubble"
                style={{
                  direction: isAr ? 'rtl' : 'ltr',
                  textAlign: isAr ? 'right' : 'left',
                }}
              >
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={msg.id || idx} className="message-row bot-row">
              <div className="bot-avatar" title="Stress AI">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="bot-content markdown-body"
                  style={{
                    direction: isAr ? 'rtl' : 'ltr',
                    textAlign: isAr ? 'right' : 'left',
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(msg.content || ''),
                    }}
                  />
                  {msg.isStreaming && <span className="streaming-cursor" />}
                </div>

                {/* Message Utility Actions (Copy, TTS) */}
                {!msg.isStreaming && msg.content && (
                  <div className="message-actions-bar">
                    <button
                      className="msg-action-btn"
                      onClick={() => handleCopy(msg.id || idx, msg.content)}
                      title="Copy message"
                    >
                      {copiedId === (msg.id || idx) ? (
                        <span style={{ color: '#22c55e', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          ✓ Copied
                        </span>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>

                    <button
                      className="msg-action-btn"
                      onClick={() => handleSpeak(msg.id || idx, msg.content)}
                      title={speakingId === (msg.id || idx) ? 'Stop audio' : 'Read aloud (TTS)'}
                      style={{ color: speakingId === (msg.id || idx) ? '#cc785c' : 'inherit' }}
                    >
                      {speakingId === (msg.id || idx) ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                      )}
                    </button>

                    {msg.enhanced_by_ai && (
                      <span className="msg-model-badge">
                        <span style={{ color: '#cc785c' }}>✳</span> DeepSeek V4 Flash
                      </span>
                    )}
                  </div>
                )}

                {/* Clinical Reference Citation Badge */}
                {!msg.isStreaming && msg.clinical_reference && (
                  <div style={{ marginTop: '6px' }}>
                    <a
                      href={msg.clinical_reference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="clinical-ref-badge"
                      title={`${msg.clinical_reference.title}: ${msg.clinical_reference.evidence_summary}`}
                    >
                      <span>📚</span>
                      <span>
                        {msg.clinical_reference.source} — {msg.clinical_reference.citation}
                      </span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8, flexShrink: 0 }}>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                )}

                {/* Direct One-Click Emergency Call Card */}
                {!msg.isStreaming && (msg.is_crisis || /16328|08008880700|16023/.test(msg.content || '')) && (
                  <div className="emergency-call-card" style={{ marginTop: '12px', padding: '14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <div style={{ color: '#f87171', fontWeight: 600, fontSize: '0.88rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🚨</span>
                      <span>خطوط المساعدة النفسية الفورية (اتصال مجاني ومباشر):</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <a
                        href="tel:16328"
                        className="emergency-direct-btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          background: '#ef4444',
                          color: '#fff',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        📞 اتصل الآن بـ 16328 (الصحة النفسية)
                      </a>
                      <a
                        href="tel:08008880700"
                        className="emergency-direct-btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#fbf9f5',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          fontWeight: 500,
                          textDecoration: 'none',
                        }}
                      >
                        📞 08008880700 (الدعم المجاني)
                      </a>
                      <a
                        href="tel:16023"
                        className="emergency-direct-btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#fbf9f5',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          fontWeight: 500,
                          textDecoration: 'none',
                        }}
                      >
                        📞 16023 (مكافحة الإدمان)
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {isBotTyping && (!conversation?.messages?.length || conversation.messages[conversation.messages.length - 1].role !== 'bot') && (
          <div className="message-row bot-row">
            <div className="bot-avatar">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
              </svg>
            </div>
            <div className="bot-content" style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '10px' }}>
              <span className="typing-dot" />
              <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
              <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Claude Hero & Floating Input Dock */}
      <div className="hero-wrapper">
        {!isChatMode && (
          <header className="header">
            <div className="header-title">
              <svg
                width="44"
                height="44"
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
              <h1>Stress AI Helper</h1>
            </div>
            <div className="subtitle">Cognitive behavioral support & relaxation guidance</div>
          </header>
        )}

        <section className="input-section">
          {/* Upward-popping Suggestions Panel */}
          {showPanel && activeTopic && (
            <div className="suggestions-panel">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 12px 8px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '6px',
                  fontSize: '0.82rem',
                  color: '#a39e93',
                }}
              >
                <span>Suggestions for {activeTopic.label}:</span>
                <button
                  onClick={() => setShowPanel(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#a39e93',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0 4px',
                  }}
                  title="Close"
                >
                  ×
                </button>
              </div>
              {activeTopic.suggestions.map((s, i) => (
                <div
                  key={i}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(s, activeTopic.id)}
                  style={{
                    direction: isArabicText(s) ? 'rtl' : 'ltr',
                    textAlign: isArabicText(s) ? 'right' : 'left',
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}

          {/* Claude Input Container */}
          <div className="input-container">
            <textarea
              ref={textareaRef}
              className="main-input"
              placeholder={
                isBotTyping
                  ? 'Stress AI is formulating a thoughtful response...'
                  : 'How can I help you today? / حاسس بإيه النهاردة؟'
              }
              value={inputText}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isBotTyping}
              style={{ direction: isArabicText(inputText) ? 'rtl' : 'ltr' }}
            />

            <div className="input-controls">
              <div>
                {activeTopic ? (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      background: 'rgba(204, 120, 92, 0.16)',
                      color: '#cc785c',
                      padding: '3px 9px',
                      borderRadius: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 500,
                      border: '1px solid rgba(204, 120, 92, 0.3)',
                    }}
                  >
                    <span>{activeTopic.icon}</span>
                    <span>{activeTopic.label}</span>
                    <button
                      onClick={() => {
                        setActiveTopic(null)
                        setShowPanel(false)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#cc785c',
                        cursor: 'pointer',
                        padding: '0 2px',
                        fontSize: '0.9rem',
                        lineHeight: 1,
                      }}
                      title="Clear category"
                    >
                      ×
                    </button>
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#757066', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#cc785c' }}>✳</span> DeepSeek V4 Flash
                  </span>
                )}
              </div>

              <div className="right-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Voice Input Microphone Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  title={isListening ? 'جاري الاستماع... اضغط للإيقاف' : 'إدخال صوتي مباشر (Voice Input)'}
                  style={{
                    background: isListening ? '#ef4444' : 'transparent',
                    border: '1px solid ' + (isListening ? '#ef4444' : 'var(--border-input)'),
                    color: isListening ? '#fff' : 'var(--text-muted)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.6)' : 'none',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>

                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={!inputText.trim() || isBotTyping}
                  aria-label="Send message"
                  title="Send message (Enter)"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Clinical Disclaimer Banner */}
          <div
            style={{
              marginTop: '10px',
              textAlign: 'center',
              fontSize: '0.74rem',
              color: 'var(--text-subtle)',
              lineHeight: 1.4,
              padding: '0 8px',
            }}
          >
            ⚠️ <strong>تنبيه إرشادي:</strong> Stress AI مساعد نفسي وتثقيفي سلوكي (CBT)، وليس بديلاً عن التشخيص الطبي أو الطوارئ. في الحالات الحرجة اتصل بـ <strong>16328</strong>.
          </div>
        </section>

        {!isChatMode && (
          <div className="buttons-container">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-btn ${activeTopic?.id === cat.id ? 'active' : ''}`}
                onClick={() => {
                  if (activeTopic?.id === cat.id && showPanel) {
                    setShowPanel(false)
                  } else {
                    setActiveTopic(cat)
                    setShowPanel(true)
                  }
                }}
              >
                <span className="icon">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
