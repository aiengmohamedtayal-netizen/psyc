import { useState, useCallback, useEffect } from 'react'

/**
 * Checks if a given text string contains Arabic Unicode characters.
 * @param {string} text
 * @returns {boolean}
 */
export function isArabicText(text) {
  return /[\u0600-\u06FF]/.test(text || '')
}

/**
 * Custom hook to interface with the browser Web SpeechSynthesis API.
 */
export function useSpeechSynthesis() {
  const [speakingId, setSpeakingId] = useState(null)

  const cancelSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeakingId(null)
  }, [])

  useEffect(() => {
    return () => {
      cancelSpeech()
    }
  }, [cancelSpeech])

  const toggleSpeak = useCallback(
    (messageId, text) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

      if (speakingId === messageId) {
        cancelSpeech()
        return
      }

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = isArabicText(text) ? 'ar-SA' : 'en-US'
      utterance.rate = 0.95
      utterance.onend = () => setSpeakingId(null)
      utterance.onerror = () => setSpeakingId(null)

      setSpeakingId(messageId)
      window.speechSynthesis.speak(utterance)
    },
    [speakingId, cancelSpeech]
  )

  return {
    speakingId,
    toggleSpeak,
    cancelSpeech,
  }
}
