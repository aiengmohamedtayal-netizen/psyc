import React from 'react'
import SidebarHeader from './sidebar/SidebarHeader.jsx'
import SidebarNavGroup from './sidebar/SidebarNavGroup.jsx'
import SidebarConversationList from './sidebar/SidebarConversationList.jsx'
import SidebarUserProfile from './sidebar/SidebarUserProfile.jsx'

/**
 * Main application sidebar component.
 * Composes header branding, tool links, history records, and user authentication state.
 */
export default function Sidebar({
  conversations = [],
  activeId,
  currentView,
  isOpen,
  currentUser,
  onNewChat,
  onSelect,
  onOpenSearch,
  onOpenChats,
  onDeleteConversation,
  onToggle,
  onLogout,
  onOpenBreathing,
  onOpenAssessments,
  onOpenAmbientSounds,
  onOpenWorryDump,
  onOpenMoodTracker,
  onOpenAuth,
}) {
  return (
    <aside
      className={`sidebar ${!isOpen ? 'collapsed' : ''} ${
        isOpen ? 'mobile-open' : ''
      }`}
    >
      <SidebarHeader onToggle={onToggle} />

      <SidebarNavGroup
        currentView={currentView}
        conversationsCount={conversations.length}
        onNewChat={onNewChat}
        onOpenSearch={onOpenSearch}
        onOpenChats={onOpenChats}
        onOpenBreathing={onOpenBreathing}
        onOpenAssessments={onOpenAssessments}
        onOpenAmbientSounds={onOpenAmbientSounds}
        onOpenWorryDump={onOpenWorryDump}
        onOpenMoodTracker={onOpenMoodTracker}
      />

      <SidebarConversationList
        conversations={conversations}
        activeId={activeId}
        onSelect={onSelect}
        onDeleteConversation={onDeleteConversation}
      />

      <SidebarUserProfile
        currentUser={currentUser}
        onLogout={onLogout}
        onOpenAuth={onOpenAuth}
      />
    </aside>
  )
}
