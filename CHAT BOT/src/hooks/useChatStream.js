import { useState, useRef, useCallback, useEffect } from 'react'
import { streamPrediction } from '../services/chatStreamService.js'

/**
 * Custom hook to manage sending chat messages, SSE token streaming,
 * optimistic message creation, and abort controller lifecycles.
 *
 * @param {object} params
 * @param {Array<object>} params.conversations
 * @param {React.Dispatch<React.SetStateAction<Array<object>>>} params.setConversations
 * @param {string|null} params.activeConversationId
 * @param {(id: string) => void} params.setActiveConversationId
 * @param {object|null} params.activeConversation
 * @param {(conv: object) => void} params.syncActiveConversation
 */
export function useChatStream({
  setConversations,
  activeConversationId,
  setActiveConversationId,
  activeConversation,
  syncActiveConversation,
}) {
  const [isBotTyping, setIsBotTyping] = useState(false)
  const abortControllerRef = useRef(null)

  // Automatically sync to remote cloud when streaming finishes
  useEffect(() => {
    if (!isBotTyping && activeConversation) {
      syncActiveConversation(activeConversation)
    }
  }, [isBotTyping, activeConversation, syncActiveConversation])

  const sendMessage = useCallback(
    async (text, topicId = null) => {
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
          title:
            trimmedText.length > 35
              ? trimmedText.substring(0, 35) + '...'
              : trimmedText,
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
        const streamResult = await streamPrediction({
          text: trimmedText,
          topic: topicId || '',
          history: historyPayload,
          signal: abortControllerRef.current.signal,
          onDelta: (currentText) => {
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === targetConvId
                  ? {
                      ...conv,
                      messages: conv.messages.map((msg) =>
                        msg.id === botMessageId
                          ? { ...msg, content: currentText, isStreaming: true }
                          : msg
                      ),
                      updatedAt: Date.now(),
                    }
                  : conv
              )
            )
          },
          onMeta: (meta) => {
            if (meta.clinical_reference) {
              setConversations((prev) =>
                prev.map((conv) =>
                  conv.id === targetConvId
                    ? {
                        ...conv,
                        messages: conv.messages.map((msg) =>
                          msg.id === botMessageId
                            ? {
                                ...msg,
                                clinical_reference: meta.clinical_reference,
                              }
                            : msg
                        ),
                      }
                    : conv
                )
              )
            }
          },
        })

        // Finalize message once streaming completes
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === targetConvId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === botMessageId
                      ? {
                          ...msg,
                          content: streamResult.content,
                          isStreaming: false,
                          enhanced_by_ai: streamResult.enhanced_by_ai,
                          clinical_reference:
                            streamResult.clinical_reference ||
                            msg.clinical_reference,
                        }
                      : msg
                  ),
                  updatedAt: Date.now(),
                }
              : conv
          )
        )
      } catch (error) {
        if (error.name === 'AbortError') return
        console.warn('Unhandled streaming error:', error)
      } finally {
        setIsBotTyping(false)
      }
    },
    [
      isBotTyping,
      activeConversationId,
      activeConversation,
      setConversations,
      setActiveConversationId,
    ]
  )

  return {
    isBotTyping,
    sendMessage,
  }
}
