import { useState, useCallback, useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import ChatsPage from './components/ChatsPage'
import SearchModal from './components/SearchModal'
import BreathingModal from './components/BreathingModal'
import AssessmentModal from './components/AssessmentModal'
import AmbientSoundModal from './components/AmbientSoundModal'
import WorryDumpModal from './components/WorryDumpModal'
import MoodTrackerModal from './components/MoodTrackerModal'
import AuthPage from './components/AuthPage'

const STORAGE_KEY = 'stress_ai_conversations_v2'
const CURRENT_USER_KEY = 'stress_ai_current_user'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000'
).replace(/\/$/, '')

export default function App() {
  // Current authenticated user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [activeConversationId, setActiveConversationId] = useState(null)
  const [isBotTyping, setIsBotTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth > 768 : true
  )
  const [currentView, setCurrentView] = useState('chat') // 'chat' | 'chats'
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isBreathingOpen, setIsBreathingOpen] = useState(false)
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false)
  const [isAmbientOpen, setIsAmbientOpen] = useState(false)
  const [isWorryOpen, setIsWorryOpen] = useState(false)
  const [isMoodOpen, setIsMoodOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  const abortControllerRef = useRef(null)

  // Auto-close sidebar on mobile on resize if screen becomes small
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Persist conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    } catch (e) {
      console.warn('Failed to save to localStorage:', e)
    }
  }, [conversations])

  // Global keyboard shortcut: Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const closeMobileSidebar = useCallback(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false)
    }
  }, [])

  const activeConversation = conversations.find((c) => c.id === activeConversationId)

  const handleNewChat = useCallback(() => {
    setActiveConversationId(null)
    setCurrentView('chat')
    closeMobileSidebar()
  }, [closeMobileSidebar])

  const handleSelectConversation = useCallback((id) => {
    setActiveConversationId(id)
    setCurrentView('chat')
    closeMobileSidebar()
  }, [closeMobileSidebar])

  const handleDeleteConversation = useCallback((id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    setActiveConversationId((currentActive) => (currentActive === id ? null : currentActive))
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem(CURRENT_USER_KEY)
    setCurrentUser(null)
  }, [])

  // Export current conversation to Markdown
  const handleExportChat = useCallback(() => {
    if (!activeConversation || !activeConversation.messages?.length) return

    let md = `# ${activeConversation.title || 'Stress AI Consultation'}\n`
    md += `*Date: ${new Date(activeConversation.updatedAt || Date.now()).toLocaleString()}*\n\n---\n\n`

    activeConversation.messages.forEach((msg) => {
      const roleName = msg.role === 'user' ? '👤 **You**' : '✳ **Stress AI**'
      md += `${roleName}:\n${msg.content}\n\n`
    })

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stress-ai-chat-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [activeConversation])

  // Real-Time SSE Token Streaming Message Handler
  const handleSendMessage = async (text, topicId = null) => {
    const trimmedText = text.trim()
    if (!trimmedText || isBotTyping) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    let targetConvId = activeConversationId
    const userMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: trimmedText,
      timestamp: Date.now(),
    }

    const botMessageId = `b_${Date.now()}`
    const initialBotMessage = {
      id: botMessageId,
      role: 'bot',
      content: '',
      isStreaming: true,
      enhanced_by_ai: true,
      timestamp: Date.now(),
    }

    const existingMessages = activeConversation?.messages || []
    const historyPayload = existingMessages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    if (!targetConvId) {
      targetConvId = Date.now().toString()
      const newConv = {
        id: targetConvId,
        title: trimmedText.length > 35 ? trimmedText.substring(0, 35) + '...' : trimmedText,
        messages: [userMessage, initialBotMessage],
        updatedAt: Date.now(),
      }
      setConversations((prev) => [newConv, ...prev])
      setActiveConversationId(targetConvId)
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                messages: [...c.messages, userMessage, initialBotMessage],
                updatedAt: Date.now(),
              }
            : c
        )
      )
    }

    setIsBotTyping(true)

    try {
      const response = await fetch(`${API_BASE_URL}/predict/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmedText,
          topic: topicId || '',
          history: historyPayload,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error(`Streaming failed with status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let accumulatedText = ''
      let buffer = ''
      let wasEnhanced = true
      let finalClinicalRef = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine.startsWith('data: ')) continue

          const dataStr = trimmedLine.replace(/^data:\s*/, '').trim()
          if (dataStr === '[DONE]') break

          try {
            const parsed = JSON.parse(dataStr)
            if (parsed.delta) {
              accumulatedText += parsed.delta
              const currentText = accumulatedText
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === targetConvId
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === botMessageId
                            ? { ...m, content: currentText, isStreaming: true }
                            : m
                        ),
                        updatedAt: Date.now(),
                      }
                    : c
                )
              )
            } else if (parsed.meta) {
              if (typeof parsed.meta.enhanced_by_ai === 'boolean') {
                wasEnhanced = parsed.meta.enhanced_by_ai
              }
              if (parsed.meta.clinical_reference) {
                finalClinicalRef = parsed.meta.clinical_reference
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === targetConvId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === botMessageId
                              ? { ...m, clinical_reference: finalClinicalRef }
                              : m
                          ),
                        }
                      : c
                  )
                )
              }
            }
          } catch {
            // ignore non-json chunk
          }
        }
      }

      // Mark streaming complete
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === botMessageId
                    ? {
                        ...m,
                        content: accumulatedText || 'I am here to support you.',
                        isStreaming: false,
                        enhanced_by_ai: wasEnhanced,
                        clinical_reference: finalClinicalRef || m.clinical_reference,
                      }
                    : m
                ),
                updatedAt: Date.now(),
              }
            : c
        )
      )
    } catch (error) {
      if (error.name === 'AbortError') return

      console.warn('Streaming error, trying fallback endpoint:', error)

      try {
        const fallbackRes = await fetch(`${API_BASE_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: trimmedText,
            topic: topicId || '',
            history: historyPayload,
          }),
        })

        if (!fallbackRes.ok) throw new Error('Fallback failed')

        const data = await fallbackRes.json()
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === botMessageId
                      ? {
                          ...m,
                          content: data.prediction,
                          isStreaming: false,
                          enhanced_by_ai: data.enhanced_by_ai ?? false,
                          clinical_reference: data.clinical_reference,
                        }
                      : m
                  ),
                  updatedAt: Date.now(),
                }
              : c
          )
        )
      } catch {
        const isArabic = /[\u0600-\u06FF]/.test(trimmedText)
        const errorMessage = isArabic
          ? 'عذراً، لم أتمكن من الاتصال بالخادم. يرجى التأكد من تشغيل الباك إند على المنفذ 8000.'
          : "Sorry, I couldn't connect to the backend server. Please make sure FastAPI is running on port 8000."

        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === botMessageId
                      ? { ...m, content: errorMessage, isStreaming: false }
                      : m
                  ),
                  updatedAt: Date.now(),
                }
              : c
          )
        )
      }
    } finally {
      setIsBotTyping(false)
    }
  }

  return (
    <div className="app-container">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          title="Close navigation"
        />
      )}

      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        currentView={currentView}
        onNewChat={handleNewChat}
        onSelect={handleSelectConversation}
        onOpenSearch={() => {
          setIsSearchOpen(true)
          closeMobileSidebar()
        }}
        onOpenChats={() => {
          setCurrentView('chats')
          closeMobileSidebar()
        }}
        onDeleteConversation={handleDeleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenBreathing={() => {
          setIsBreathingOpen(true)
          closeMobileSidebar()
        }}
        onOpenAssessments={() => {
          setIsAssessmentOpen(true)
          closeMobileSidebar()
        }}
        onOpenAmbientSounds={() => {
          setIsAmbientOpen(true)
          closeMobileSidebar()
        }}
        onOpenWorryDump={() => {
          setIsWorryOpen(true)
          closeMobileSidebar()
        }}
        onOpenMoodTracker={() => {
          setIsMoodOpen(true)
          closeMobileSidebar()
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => {
          setIsAuthOpen(true)
          closeMobileSidebar()
        }}
      />

      {currentView === 'chats' ? (
        <ChatsPage
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
        />
      ) : (
        <ChatWindow
          conversation={activeConversation}
          onSendMessage={handleSendMessage}
          isBotTyping={isBotTyping}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onNewChat={handleNewChat}
          onOpenBreathing={() => setIsBreathingOpen(true)}
          onExportChat={handleExportChat}
        />
      )}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
      />

      <BreathingModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />

      <AssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        onStartChatWithResult={(promptText, topic) => {
          handleNewChat()
          handleSendMessage(promptText, topic)
        }}
      />

      <AmbientSoundModal
        isOpen={isAmbientOpen}
        onClose={() => setIsAmbientOpen(false)}
      />

      <WorryDumpModal
        isOpen={isWorryOpen}
        onClose={() => setIsWorryOpen(false)}
      />

      <MoodTrackerModal
        isOpen={isMoodOpen}
        onClose={() => setIsMoodOpen(false)}
      />

      <AuthPage
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user)
          setIsAuthOpen(false)
        }}
      />
    </div>
  )
}
