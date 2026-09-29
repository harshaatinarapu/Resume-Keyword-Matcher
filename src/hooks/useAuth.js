import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'gapless.session'

/**
 * Minimal client-side auth. There is no real backend here - this persists a
 * "session" object to localStorage so the dashboard route can be gated and
 * refreshes don't log the user out. Swap `signIn`/`signUp` for real API
 * calls when you wire up a backend; the shape returned to callers
 * ({ user, error }) is designed to make that swap a one-file change.
 */
export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const raw = typeof window === 'undefined' ? null : localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      // Corrupted session data - treat as logged out rather than crashing.
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
      }
      return null
    }
  })
  const [initializing, setInitializing] = useState(false)

  useEffect(() => {
    setInitializing(false)
  }, [])

  const persist = (session) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    setUser(session)
  }

  const validate = (email, password) => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return 'Enter a valid email address.'
    }
    if (!password || password.length < 6) {
      return 'Password must be at least 6 characters.'
    }
    return null
  }

  const signIn = useCallback((email, password) => {
    const validationError = validate(email, password)
    if (validationError) return { user: null, error: validationError }
    const session = { email, mode: 'account' }
    persist(session)
    return { user: session, error: null }
  }, [])

  const signUp = useCallback((email, password, confirmPassword) => {
    const validationError = validate(email, password)
    if (validationError) return { user: null, error: validationError }
    if (password !== confirmPassword) {
      return { user: null, error: 'Passwords do not match.' }
    }
    const session = { email, mode: 'account' }
    persist(session)
    return { user: session, error: null }
  }, [])

  const continueAsGuest = useCallback(() => {
    const session = { email: 'Guest', mode: 'guest' }
    persist(session)
    return { user: session, error: null }
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  return { user, initializing, signIn, signUp, continueAsGuest, signOut }
}
