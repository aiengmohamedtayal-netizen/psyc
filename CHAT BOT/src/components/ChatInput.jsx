import { useState, useRef, useEffect } from 'react'
import './ChatInput.css'

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [text])

  const handleSubmit = () => {
    if (!text.trim() || disabled) return
    onSend(text)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const canSend = text.trim().length > 0 && !disabled

  return (
    <div className="chat-input">
      <div className="chat-input__container">
        <textarea
          ref={textareaRef}
          className="chat-input__textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message ChatGPT…"
          rows={1}
          disabled={disabled}
        />
        <button
          className={`chat-input__send ${canSend ? 'chat-input__send--active' : ''}`}
          onClick={handleSubmit}
          disabled={!canSend}
          title="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <p className="chat-input__disclaimer">
        ChatGPT clone demo. Messages are simulated and stored locally.
      </p>
    </div>
  )
}
