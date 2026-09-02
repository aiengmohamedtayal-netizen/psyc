import React, { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import ChatWindow from './components/ChatWindow.jsx'
import ChatsPage from './components/ChatsPage.jsx'
import AppModals from './components/AppModals.jsx'

import { useConversations } from './hooks/useConversations.js'
import { useChatStream } from './hooks/useChatStream.js'
import { useModalManager } from './hooks/useModalManager.js'
import { useResponsiveSidebar } from './hooks/useResponsiveSidebar.js'
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts.js'
import { exportConversationToMarkdown } from './utils/exportChat.js'
import { getSessionUser, CURRENT_USER_KEY } from './services/authStorage.js'

/**
 * Root Application Component.
 * Pure orchestrator assembling conversation state, streaming responses,
 * responsive navigation, and interactive mental health dialogs.
 */
export default function App() {
  const [currentUser, setCurrentUser] = useState(getSessionUser)
  const [currentView, setCurrentView] = useState('chat') // 'chat' | 'chats'

  const sidebar = useResponsiveSidebar()
  const modalManager = useModalManager()

  const conversationStore = useConversations(currentUser)
  const {
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    selectConversation,
    createNewChat,
    deleteConversation,
    syncActiveConversation,
  } = conversationStore

  const chat = useChatStream({
    setConversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    syncActiveConversation,
  })

  // Register Ctrl+K / Cmd+K search shortcut
  useGlobalKeyboardShortcuts({
    onSearchToggle: () => {
      modalManager.openModal(
        modalManager.isModalOpen('search') ? null : 'search'
      )
    },
  })

  const handleNewChat = useCallback(() => {
    createNewChat(() => {
      setCurrentView('chat')
      sidebar.closeMobileSidebar()
    })
  }, [createNewChat, sidebar])

  const handleSelectConversation = useCallback(
    (id) => {
      selectConversation(id, () => {
        setCurrentView('chat')
        sidebar.closeMobileSidebar()
      })
    },
    [selectConversation, sidebar]
  )

  const handleLogout = useCallback(() => {
    localStorage.removeItem(CURRENT_USER_KEY)
    setCurrentUser(null)
    createNewChat()
  }, [createNewChat])

  const handleExportChat = useCallback(() => {
    exportConversationToMarkdown(activeConversation)
  }, [activeConversation])

  const handleStartChatWithResult = useCallback(
    (promptText, topic) => {
      handleNewChat()
      chat.sendMessage(promptText, topic)
    },
    [handleNewChat, chat]
  )

  return (
    <div className="app-container">
      {/* Mobile Drawer Backdrop */}
      {sidebar.isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => sidebar.setIsOpen(false)}
          title="Close navigation"
        />
      )}

      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        currentView={currentView}
        isOpen={sidebar.isOpen}
        currentUser={currentUser}
        onNewChat={handleNewChat}
        onSelect={handleSelectConversation}
        onDeleteConversation={deleteConversation}
        onToggle={sidebar.toggleSidebar}
        onLogout={handleLogout}
        onOpenSearch={() => modalManager.openModal('search', sidebar.closeMobileSidebar)}
        onOpenChats={() => {
          setCurrentView('chats')
          sidebar.closeMobileSidebar()
        }}
        onOpenBreathing={() => modalManager.openModal('breathing', sidebar.closeMobileSidebar)}
        onOpenAssessments={() => modalManager.openModal('assessment', sidebar.closeMobileSidebar)}
        onOpenAmbientSounds={() => modalManager.openModal('ambient', sidebar.closeMobileSidebar)}
        onOpenWorryDump={() => modalManager.openModal('worry', sidebar.closeMobileSidebar)}
        onOpenMoodTracker={() => modalManager.openModal('mood', sidebar.closeMobileSidebar)}
        onOpenAuth={() => modalManager.openModal('auth', sidebar.closeMobileSidebar)}
        onOpenProfile={() => modalManager.openModal('profile', sidebar.closeMobileSidebar)}
      />

      {currentView === 'chats' ? (
        <ChatsPage
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={deleteConversation}
        />
      ) : (
        <ChatWindow
          conversation={activeConversation}
          isBotTyping={chat.isBotTyping}
          onSendMessage={chat.sendMessage}
          onToggleSidebar={sidebar.toggleSidebar}
          onNewChat={handleNewChat}
          onOpenBreathing={() => modalManager.openModal('breathing')}
          onExportChat={handleExportChat}
        />
      )}

      <AppModals
        modalManager={modalManager}
        conversations={conversations}
        currentUser={currentUser}
        onSelectConversation={handleSelectConversation}
        onStartChatWithResult={handleStartChatWithResult}
        onLoginSuccess={setCurrentUser}
        onUpdateUser={setCurrentUser}
      />
    </div>
  )
}
