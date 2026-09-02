import { useEffect } from 'react'

/**
 * Custom hook to register global window keyboard shortcuts.
 * @param {object} handlers
 * @param {() => void} [handlers.onSearchToggle]
 */
export function useGlobalKeyboardShortcuts({ onSearchToggle }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (onSearchToggle) {
          onSearchToggle()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSearchToggle])
}
