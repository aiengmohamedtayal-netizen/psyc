import { useState, useCallback, useEffect } from 'react'
import {
  getConversationStorageKey,
  loadLocalConversations,
  saveLocalConversations,
  fetchCloudConversations,
  syncConversationToCloud,
  deleteConversationFromCloud,
} from '../services/conversationService.js'

/**
 * Custom hook to manage user conversations, local storage caching,
 * cloud synchronization, and active conversation selection.
 *
 * @param {object|null} currentUser
 */
export function useConversations(currentUser) {
  const storageKey = getConversationStorageKey(currentUser)

  const [conversations, setConversations] = useState(() =>
    loadLocalConversations(storageKey)
  )
  const [activeConversationId, setActiveConversationId] = useState(null)

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  )

  // Sync from cloud when authenticated user changes
  useEffect(() => {
    const currentKey = getConversationStorageKey(currentUser)

    if (currentUser?.token) {
      fetchCloudConversations(currentUser.token).then((cloudData) => {
        if (cloudData && cloudData.length > 0) {
          setConversations(cloudData)
          saveLocalConversations(currentKey, cloudData)
        } else {
          setConversations(loadLocalConversations(currentKey))
        }
      })
    } else {
      setConversations(loadLocalConversations(currentKey))
    }
  }, [currentUser])

  // Persist conversations locally whenever list or user identity changes
  useEffect(() => {
    const currentKey = getConversationStorageKey(currentUser)
    saveLocalConversations(currentKey, conversations)
  }, [conversations, currentUser])

  const selectConversation = useCallback((id, onSelected) => {
    setActiveConversationId(id)
    if (onSelected) onSelected()
  }, [])

  const createNewChat = useCallback((onCreated) => {
    setActiveConversationId(null)
    if (onCreated) onCreated()
  }, [])

  const deleteConversation = useCallback(
    (id) => {
      setConversations((prev) => prev.filter((conv) => conv.id !== id))
      setActiveConversationId((currentActive) =>
        currentActive === id ? null : currentActive
      )

      if (currentUser?.token) {
        deleteConversationFromCloud(currentUser.token, id)
      }
    },
    [currentUser]
  )

  const syncActiveConversation = useCallback(
    (conversation) => {
      if (currentUser?.token && conversation) {
        syncConversationToCloud(currentUser.token, conversation)
      }
    },
    [currentUser]
  )

  return {
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    selectConversation,
    createNewChat,
    deleteConversation,
    syncActiveConversation,
  }
}
