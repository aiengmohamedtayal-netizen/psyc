/**
 * Storage service for managing local users and session tokens in localStorage.
 * Provides safe JSON parsing, Notion-style avatar URL generation, and fallback error handling.
 */

export const USERS_STORAGE_KEY = 'stress_ai_users_db'
export const CURRENT_USER_KEY = 'stress_ai_current_user'

/**
 * Returns the official DiceBear Notionists SVG avatar URL.
 * @param {string} seed
 * @returns {string}
 */
export function getNotionAvatarUrl(seed) {
  const cleanSeed = encodeURIComponent((seed || 'User').trim())
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${cleanSeed}&backgroundColor=ffffff`
}

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
  const match = users.find(
    (user) =>
      user.username.toLowerCase() === normalizedUsername &&
      user.password === password
  )
  if (!match) return null

  return {
    id: match.id,
    username: match.username,
    name: match.name,
    avatarSeed: match.avatarSeed || match.username,
    createdAt: match.createdAt,
  }
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
  const avatarSeed = cleanUsername

  const newUser = {
    id: `u_${Date.now()}`,
    username: cleanUsername,
    name: cleanName,
    password,
    avatarSeed,
    createdAt: Date.now(),
  }

  users.push(newUser)
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

  return {
    id: newUser.id,
    username: newUser.username,
    name: newUser.name,
    avatarSeed: newUser.avatarSeed,
    createdAt: newUser.createdAt,
  }
}

/**
 * Persists the active session user to local storage.
 * @param {object} sessionUser
 */
export function saveSessionUser(sessionUser) {
  if (!sessionUser) {
    localStorage.removeItem(CURRENT_USER_KEY)
    return
  }
  const userToSave = {
    ...sessionUser,
    avatarSeed: sessionUser.avatarSeed || sessionUser.username || 'User',
  }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToSave))
}

/**
 * Updates properties on the current active session user.
 * @param {object} updates
 * @returns {object|null}
 */
export function updateSessionUser(updates) {
  const current = getSessionUser()
  if (!current) return null
  const updated = { ...current, ...updates }
  saveSessionUser(updated)

  // Also update record in local users table
  const users = getLocalUsers()
  const idx = users.findIndex(
    (u) =>
      u.username?.toLowerCase() === current.username?.toLowerCase() ||
      u.id === current.id
  )
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  }

  return updated
}

/**
 * Retrieves the active session user from local storage.
 * @returns {object|null}
 */
export function getSessionUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY)
    if (!raw) return null
    const user = JSON.parse(raw)
    if (!user.avatarSeed) {
      user.avatarSeed = user.username || 'User'
    }
    return user
  } catch {
    return null
  }
}
