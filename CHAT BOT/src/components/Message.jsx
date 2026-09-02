import './Message.css'

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Message({ role, content, timestamp }) {
  const isUser = role === 'user'

  return (
    <div className={`message message--${role}`}>
      <div className="message__avatar">
        {isUser ? (
          <div className="message__avatar-user">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        ) : (
          <div className="message__avatar-bot">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        )}
      </div>

      <div className="message__content-wrapper">
        <span className="message__role-label">
          {isUser ? 'You' : 'ChatGPT'}
        </span>
        <div className="message__bubble">
          <div className="message__text">{content}</div>
        </div>
        {timestamp && (
          <span className="message__time">{formatTime(timestamp)}</span>
        )}
      </div>
    </div>
  )
}
