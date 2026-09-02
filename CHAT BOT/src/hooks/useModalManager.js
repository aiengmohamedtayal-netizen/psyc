import { useState, useCallback } from 'react'

/**
 * Custom hook to consolidate and manage all application dialog/modal states.
 * Replaces multiple scattered boolean flags with a single active modal identifier.
 */
export function useModalManager() {
  const [activeModal, setActiveModal] = useState(null)

  const openModal = useCallback((modalName, onBeforeOpen) => {
    if (onBeforeOpen) {
      onBeforeOpen()
    }
    setActiveModal(modalName)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
  }, [])

  const isModalOpen = useCallback(
    (modalName) => activeModal === modalName,
    [activeModal]
  )

  return {
    activeModal,
    openModal,
    closeModal,
    isModalOpen,
  }
}
