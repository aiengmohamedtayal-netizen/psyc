import { useEffect } from 'react'

/**
 * Custom hook to attach an Escape key listener when a modal or dialog is open.
 * @param {boolean} isOpen
 * @param {(() => void)|undefined} onEscape
 */
export function useEscapeKey(isOpen, onEscape) {
  useEffect(() => {
    if (!isOpen || !onEscape) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onEscape()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onEscape])
}
