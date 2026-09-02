import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * Custom hook to interface with the browser Web Speech Recognition API.
 * Safely handles unsupported browser environments and microphone states.
 *
 * @param {object} [options]
 * @param {string} [options.language='ar-EG']
 */
export function useSpeechRecognition({ language = 'ar-EG' } = {}) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const toggleListening = useCallback(
    (onTranscriptReceived) => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        alert(
          'عذراً، متصفحك لا يدعم الإدخال الصوتي المباشر. يرجى تجربة متصفح Google Chrome أو Microsoft Edge.'
        )
        return
      }

      if (isListening) {
        recognitionRef.current?.stop()
        setIsListening(false)
        return
      }

      try {
        const recognition = new SpeechRecognition()
        recognition.lang = language
        recognition.interimResults = true
        recognition.continuous = false

        recognition.onstart = () => setIsListening(true)

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join('')
          if (onTranscriptReceived) {
            onTranscriptReceived(transcript)
          }
        }

        recognition.onerror = () => setIsListening(false)
        recognition.onend = () => setIsListening(false)

        recognitionRef.current = recognition
        recognition.start()
      } catch {
        setIsListening(false)
      }
    },
    [isListening, language]
  )

  return {
    isListening,
    toggleListening,
  }
}
