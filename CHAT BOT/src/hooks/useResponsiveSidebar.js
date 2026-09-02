import { useState, useEffect, useCallback } from 'react'

const MOBILE_BREAKPOINT_PX = 768

/**
 * Custom hook to manage sidebar open/close state and responsive window resizing.
 */
export function useResponsiveSidebar() {
  const [isOpen, setIsOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth > MOBILE_BREAKPOINT_PX : true
  )

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= MOBILE_BREAKPOINT_PX) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const closeMobileSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT_PX) {
      setIsOpen(false)
    }
  }, [])

  return {
    isOpen,
    setIsOpen,
    toggleSidebar,
    closeMobileSidebar,
  }
}
