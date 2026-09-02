/**
 * Authentication orchestration service.
 * Coordinates between remote API and local storage fallback.
 */

import { loginViaApi, registerViaApi } from './authApi.js'
import {
  findLocalUser,
  isUsernameTaken,
  saveLocalUser,
  saveSessionUser,
} from './authStorage.js'

export const AUTH_ERRORS = {
  REQUIRED_CREDENTIALS: 'يرجى إدخال اسم المستخدم وكلمة المرور.',
  INVALID_CREDENTIALS: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
  PASSWORD_TOO_SHORT: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل.',
  PASSWORD_MISMATCH: 'كلمتا المرور غير متطابقتين.',
  USERNAME_TAKEN: 'اسم المستخدم مستخدم بالفعل، يرجى اختيار اسم آخر.',
}

/**
 * Authenticates a user using remote API first, falling back to local storage.
 * @param {object} params
 * @param {string} params.username
 * @param {string} params.password
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export async function authenticateUser({ username, password }) {
  const cleanUsername = username.trim()

  // 1. Try remote API first
  const apiResult = await loginViaApi({ username: cleanUsername, password })
  if (apiResult.success && apiResult.user) {
    saveSessionUser(apiResult.user)
    return { success: true, user: apiResult.user }
  }

  // 2. Fallback to local storage (e.g. offline mode or local user)
  const localUser = findLocalUser(cleanUsername, password)
  if (!localUser) {
    return {
      success: false,
      error: apiResult.error || AUTH_ERRORS.INVALID_CREDENTIALS,
    }
  }

  const sessionUser = {
    id: localUser.id,
    username: localUser.username,
    name: localUser.name || localUser.username,
  }

  saveSessionUser(sessionUser)
  return { success: true, user: sessionUser }
}

/**
 * Registers a new user via remote API first, falling back to local storage if API is offline.
 * @param {object} params
 * @param {string} params.username
 * @param {string} params.password
 * @param {string} params.name
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export async function registerUser({ username, password, name }) {
  const cleanUsername = username.trim()
  const cleanName = name.trim() || cleanUsername

  // 1. Try remote API registration first
  const apiResult = await registerViaApi({
    username: cleanUsername,
    password,
    fullName: cleanName,
  })

  if (apiResult.success && apiResult.user) {
    saveSessionUser(apiResult.user)
    return { success: true, user: apiResult.user }
  }

  // If backend returned a specific rejection (e.g., 400 Bad Request with details), do not create locally
  if (apiResult.isOnline && apiResult.error) {
    return { success: false, error: apiResult.error }
  }

  // 2. Fallback to local storage if backend is offline/unreachable
  if (isUsernameTaken(cleanUsername)) {
    return { success: false, error: AUTH_ERRORS.USERNAME_TAKEN }
  }

  const localUser = saveLocalUser({
    username: cleanUsername,
    name: cleanName,
    password,
  })

  const sessionUser = {
    id: localUser.id,
    username: localUser.username,
    name: localUser.name,
  }

  saveSessionUser(sessionUser)
  return { success: true, user: sessionUser }
}
