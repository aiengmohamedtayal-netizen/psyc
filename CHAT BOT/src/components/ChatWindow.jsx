import React, { useRef, useEffect, useState, useCallback } from 'react'
import ChatHeader from './chat/ChatHeader.jsx'
import SuggestionsPanel from './chat/SuggestionsPanel.jsx'
import MessageBubble from './chat/MessageBubble.jsx'
import ChatInputArea from './chat/ChatInputArea.jsx'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js'

/**
 * Main Chat Window Component.
 * Composes header actions, empty state suggestions, dynamic message thread,
 * and input area with Speech Recognition and Synthesis hooks.
 */
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

  const messagesEndRef = useRef(null)

  const speech = useSpeechRecognition()
  const tts = useSpeechSynthesis()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages, isBotTyping, scrollToBottom])

  const handleCopy = useCallback((messageId, text) => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(messageId)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }, [])

  const handleVoiceToggle = useCallback(() => {
    speech.toggleListening((transcript) => {
      setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript))
    })
  }, [speech])

  const isChatMode = Boolean(
    conversation?.messages && conversation.messages.length > 0
  )

  return (
    <main className={`main-content ${isChatMode ? 'chat-mode' : ''}`}>
      <ChatHeader
        onToggleSidebar={onToggleSidebar}
        onOpenBreathing={onOpenBreathing}
        onExportChat={onExportChat}
        isChatMode={isChatMode}
      />

      {!isChatMode ? (
        <SuggestionsPanel onSelectSuggestion={onSendMessage} />
      ) : (
        <div className="chat-container">
          <div className="messages-list">
            {conversation.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                copiedId={copiedId}
                speakingId={tts.speakingId}
                onCopy={handleCopy}
                onSpeak={tts.toggleSpeak}
              />
            ))}

            {isBotTyping && (
              <div className="message-item bot typing-indicator-item">
                <div className="message-avatar">✳</div>
                <div className="message-bubble typing-bubble">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      <ChatInputArea
        inputText={inputText}
        setInputText={setInputText}
        isBotTyping={isBotTyping}
        isListening={speech.isListening}
        onToggleVoice={handleVoiceToggle}
        onSendMessage={onSendMessage}
        activeTopic={activeTopic}
        setActiveTopic={setActiveTopic}
        showPanel={showPanel}
        setShowPanel={setShowPanel}
        isChatMode={isChatMode}
        conversationId={conversation?.id}
      />
    </main>
  )
}
