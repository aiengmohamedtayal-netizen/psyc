/**
 * API client for authentication endpoints.
 * Provides typed result abstractions and error handling for remote auth.
 */

export const API_BASE_URL = (
  (typeof import.meta !== 'undefined' &&
    import.meta?.env &&
    (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)) ||
  ''
).replace(/\/$/, '')

/**
 * Normalizes backend user payload into a consistent session user object.
 * @param {object} apiData
 * @returns {object}
 */
export function formatSessionUser(apiData) {
  return {
    id: apiData.user.id,
    username: apiData.user.username,
    name: apiData.user.full_name || apiData.user.username,
    token: apiData.access_token,
  }
}

/**
 * Calls remote login endpoint.
 * @param {object} credentials
 * @param {string} credentials.username
 * @param {string} credentials.password
 * @returns {Promise<{ isOnline: boolean, success: boolean, user?: object, error?: string }>}
 */
export async function loginViaApi({ username, password }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
      const data = await response.json()
      return { isOnline: true, success: true, user: formatSessionUser(data) }
    }

    const errData = await response.json().catch(() => ({}))
    return {
      isOnline: true,
      success: false,
      error: errData.detail || 'اسم المستخدم أو كلمة المرور غير صحيحة.',
    }
  } catch {
    // Network error or backend offline
    return { isOnline: false, success: false }
  }
}

/**
 * Calls remote register endpoint.
 * @param {object} userData
 * @param {string} userData.username
 * @param {string} userData.password
 * @param {string} userData.fullName
 * @returns {Promise<{ isOnline: boolean, success: boolean, user?: object, error?: string }>}
 */
export async function registerViaApi({ username, password, fullName }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        full_name: fullName,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return { isOnline: true, success: true, user: formatSessionUser(data) }
    }

    const errData = await response.json().catch(() => ({}))
    return {
      isOnline: true,
      success: false,
      error: errData.detail || 'تعذر إنشاء الحساب.',
    }
  } catch {
    // Network error or backend offline
    return { isOnline: false, success: false }
  }
}
