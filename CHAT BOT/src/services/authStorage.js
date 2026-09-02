/**
 * Storage service for managing local users and session tokens in localStorage.
 * Provides safe JSON parsing and fallback error handling.
 */

export const USERS_STORAGE_KEY = 'stress_ai_users_db'
export const CURRENT_USER_KEY = 'stress_ai_current_user'

/**
 * Retrieves all locally stored mock/fallback users.
 * @returns {Array<object>}
 */
export function getLocalUsers() {
  try {
    const rawData = localStorage.getItem(USERS_STORAGE_KEY)
    return rawData ? JSON.parse(rawData) : []
  } catch {
    return []
  }
}

/**
 * Finds a local user by matching username and password.
 * @param {string} username
 * @param {string} password
 * @returns {object|null}
 */
export function findLocalUser(username, password) {
  const users = getLocalUsers()
  const normalizedUsername = username.trim().toLowerCase()
  return (
    users.find(
      (user) =>
        user.username.toLowerCase() === normalizedUsername &&
        user.password === password
    ) || null
  )
}

/**
 * Checks if a username already exists locally.
 * @param {string} username
 * @returns {boolean}
 */
export function isUsernameTaken(username) {
  const users = getLocalUsers()
  const normalizedUsername = username.trim().toLowerCase()
  return users.some(
    (user) => user.username.toLowerCase() === normalizedUsername
  )
}

/**
 * Saves a new user to the local storage database.
 * @param {object} userData
 * @param {string} userData.username
 * @param {string} userData.name
 * @param {string} userData.password
 * @returns {object} The created user entity
 */
export function saveLocalUser({ username, name, password }) {
  const users = getLocalUsers()
  const cleanUsername = username.trim()
  const cleanName = name.trim() || cleanUsername

  const newUser = {
    id: `u_${Date.now()}`,
    username: cleanUsername,
    name: cleanName,
    password,
    createdAt: Date.now(),
  }

  users.push(newUser)
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

  return {
    id: newUser.id,
    username: newUser.username,
    name: newUser.name,
  }
}

/**
 * Persists the active session user to local storage.
 * @param {object} sessionUser
 */
export function saveSessionUser(sessionUser) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser))
}

/**
 * Retrieves the active session user from local storage.
 * @returns {object|null}
 */
export function getSessionUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
