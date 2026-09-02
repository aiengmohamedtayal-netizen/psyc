import React from 'react'
import SearchModal from './SearchModal.jsx'
import BreathingModal from './BreathingModal.jsx'
import AssessmentModal from './AssessmentModal.jsx'
import AmbientSoundModal from './AmbientSoundModal.jsx'
import WorryDumpModal from './WorryDumpModal.jsx'
import MoodTrackerModal from './MoodTrackerModal.jsx'
import AuthPage from './AuthPage.jsx'

/**
 * Container component that declaratively renders all dialogs/modals based
 * on the active state provided by the modal manager.
 */
export default function AppModals({
  modalManager,
  conversations,
  onSelectConversation,
  onStartChatWithResult,
  onLoginSuccess,
}) {
  const { isModalOpen, closeModal, openModal } = modalManager

  return (
    <>
      <SearchModal
        isOpen={isModalOpen('search')}
        onClose={closeModal}
        conversations={conversations}
        onSelectConversation={onSelectConversation}
      />

      <BreathingModal
        isOpen={isModalOpen('breathing')}
        onClose={closeModal}
      />

      <AssessmentModal
        isOpen={isModalOpen('assessment')}
        onClose={closeModal}
        onStartChatWithResult={onStartChatWithResult}
      />

      <AmbientSoundModal
        isOpen={isModalOpen('ambient')}
        onClose={closeModal}
      />

      <WorryDumpModal
        isOpen={isModalOpen('worry')}
        onClose={closeModal}
      />

      <MoodTrackerModal
        isOpen={isModalOpen('mood')}
        onClose={closeModal}
      />

      <AuthPage
        isOpen={isModalOpen('auth')}
        onClose={closeModal}
        onLoginSuccess={(user) => {
          onLoginSuccess(user)
          closeModal()
        }}
      />
    </>
  )
}
