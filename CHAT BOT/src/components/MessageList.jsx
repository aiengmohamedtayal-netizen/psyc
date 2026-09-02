import { useRef, useEffect } from 'react'
import Message from './Message'
import './MessageList.css'

export default function MessageList({ messages, isBotTyping }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isBotTyping])

  return (
    <div className="message-list">
      {messages.map((msg) => (
        <Message
          key={msg.id}
          role={msg.role}
          content={msg.content}
          timestamp={msg.timestamp}
        />
      ))}

      {isBotTyping && (
        <div className="message message--bot message--typing">
          <div className="message__avatar">
            <div className="message__avatar-bot">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
          <div className="message__content-wrapper">
            <span className="message__role-label">ChatGPT</span>
            <div className="typing-indicator">
              <span className="typing-indicator__dot" />
              <span className="typing-indicator__dot" />
              <span className="typing-indicator__dot" />
            </div>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  )
}
