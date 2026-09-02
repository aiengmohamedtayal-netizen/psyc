/**
 * Service to manage local storage persistence and remote cloud synchronization
 * for user conversations.
 */

import { API_BASE_URL } from './authApi.js'

export const GUEST_STORAGE_KEY = 'stress_ai_conversations_guest'
export const LEGACY_STORAGE_KEY = 'stress_ai_conversations_v2'

/**
 * Derives the appropriate local storage key based on the active user identity.
 * @param {object|null} user
 * @returns {string}
 */
export function getConversationStorageKey(user) {
  if (user?.id) {
    return `stress_ai_conversations_${user.id}`
  }
  return GUEST_STORAGE_KEY
}

/**
 * Loads cached conversations from localStorage with fallback handling.
 * @param {string} storageKey
 * @returns {Array<object>}
 */
export function loadLocalConversations(storageKey) {
  try {
    const rawData = localStorage.getItem(storageKey) || localStorage.getItem(LEGACY_STORAGE_KEY)
    return rawData ? JSON.parse(rawData) : []
  } catch {
    return []
  }
}

/**
 * Saves conversations array to localStorage.
 * @param {string} storageKey
 * @param {Array<object>} conversations
 */
export function saveLocalConversations(storageKey, conversations) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(conversations))
  } catch (error) {
    console.warn('Failed to persist conversations to localStorage:', error)
  }
}

/**
 * Fetches user's persistent conversations from remote Cloud API.
 * @param {string} token
 * @returns {Promise<Array<object>|null>}
 */
export async function fetchCloudConversations(token) {
  if (!token) return null

  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) return null

    const data = await response.json()
    return Array.isArray(data) ? data : null
  } catch (error) {
    console.warn('Failed to fetch cloud conversations:', error)
    return null
  }
}

/**
 * Synchronizes an individual conversation to remote Cloud API.
 * @param {string} token
 * @param {object} conversation
 */
export async function syncConversationToCloud(token, conversation) {
  if (!token || !conversation) return

  const payload = {
    id: String(conversation.id),
    title: conversation.title || 'جلسة جديدة',
    updatedAt: conversation.updatedAt || Date.now(),
    messages: (conversation.messages || []).map((message) => ({
      id: String(message.id),
      role: message.role,
      content: message.content || '',
      timestamp: message.timestamp || Date.now(),
      clinical_reference: message.clinical_reference || null,
    })),
  }

  try {
    await fetch(`${API_BASE_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.warn('Failed to sync conversation to cloud:', error)
  }
}

/**
 * Deletes a conversation from remote Cloud API.
 * @param {string} token
 * @param {string} conversationId
 */
export async function deleteConversationFromCloud(token, conversationId) {
  if (!token || !conversationId) return

  try {
    await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (error) {
    console.warn('Failed to delete cloud conversation:', error)
  }
}
