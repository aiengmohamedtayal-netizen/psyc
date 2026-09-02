import { useState, useCallback } from 'react'
import {
  authenticateUser,
  registerUser,
  AUTH_ERRORS,
} from '../services/authService.js'

const MIN_PASSWORD_LENGTH = 4

/**
 * Custom hook to manage authentication form state, validation, and submission logic.
 * @param {object} params
 * @param {(user: object) => void} params.onLoginSuccess
 * @param {(() => void)|undefined} params.onClose
 */
export function useAuthForm({ onLoginSuccess, onClose }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const switchMode = useCallback((newMode) => {
    setMode(newMode)
    setError('')
  }, [])

  const handleLoginSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError('')

      const cleanUsername = username.trim()

      // Guard Clause: Validate required credentials
      if (!cleanUsername || !password) {
        setError(AUTH_ERRORS.REQUIRED_CREDENTIALS)
        return
      }

      setIsLoading(true)

      try {
        const result = await authenticateUser({
          username: cleanUsername,
          password,
        })

        if (!result.success) {
          setError(result.error || AUTH_ERRORS.INVALID_CREDENTIALS)
          return
        }

        if (onLoginSuccess) {
          onLoginSuccess(result.user)
        }
        if (onClose) {
          onClose()
        }
      } finally {
        setIsLoading(false)
      }
    },
    [username, password, onLoginSuccess, onClose]
  )

  const handleSignupSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError('')

      const cleanUsername = username.trim()

      // Guard Clause: Required credentials
      if (!cleanUsername || !password) {
        setError(AUTH_ERRORS.REQUIRED_CREDENTIALS)
        return
      }

      // Guard Clause: Password length
      if (password.length < MIN_PASSWORD_LENGTH) {
        setError(AUTH_ERRORS.PASSWORD_TOO_SHORT)
        return
      }

      // Guard Clause: Password matching
      if (password !== confirmPassword) {
        setError(AUTH_ERRORS.PASSWORD_MISMATCH)
        return
      }

      setIsLoading(true)

      try {
        const result = await registerUser({
          username: cleanUsername,
          password,
          name,
        })

        if (!result.success) {
          setError(result.error || AUTH_ERRORS.USERNAME_TAKEN)
          return
        }

        if (onLoginSuccess) {
          onLoginSuccess(result.user)
        }
        if (onClose) {
          onClose()
        }
      } finally {
        setIsLoading(false)
      }
    },
    [username, password, confirmPassword, name, onLoginSuccess, onClose]
  )

  return {
    mode,
    username,
    password,
    name,
    confirmPassword,
    error,
    isLoading,
    setUsername,
    setPassword,
    setName,
    setConfirmPassword,
    switchMode,
    handleLoginSubmit,
    handleSignupSubmit,
  }
}
