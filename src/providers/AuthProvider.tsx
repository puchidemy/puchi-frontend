'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { getToken, setToken, clearToken, tryRefreshToken, syncTokenToCookie, setBaseUrl } from '@/lib/token-manager'

interface User {
  id: string
  email: string
  display_name: string
  email_verified: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  verifyEmail: (code: string) => Promise<{ ok: boolean; error?: string }>
  resendVerification: () => Promise<{ ok: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children, baseUrl }: { children: ReactNode; baseUrl: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Sync baseUrl to token-manager for auto-refresh calls
  useEffect(() => {
    setBaseUrl(baseUrl)
  }, [baseUrl])

  const refreshSession = useCallback(async () => {
    let accessToken = getToken()

    // No token in memory — try restoring from SSR cookie
    if (!accessToken) {
      try {
        const restoreRes = await fetch('/api/auth/restore-session')
        if (restoreRes.ok) {
          const { access_token } = await restoreRes.json()
          if (access_token) {
            setToken(access_token)
            accessToken = access_token
          }
        }
      } catch {
        // restore is best-effort
      }
    }

    if (!accessToken) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${baseUrl}/auth/sessions`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (res.ok) {
        // Session is valid, keep existing user state if present
        setLoading(false)
        return
      }

      if (res.status === 401) {
        // Token might be expired — try refreshing
        const newToken = await tryRefreshToken()

        if (newToken) {
          // Refresh succeeded, retry session check
          const retryRes = await fetch(`${baseUrl}/auth/sessions`, {
            credentials: 'include',
            headers: { Authorization: `Bearer ${newToken}` },
          })
          if (retryRes.ok) {
            setLoading(false)
            return
          }
        }
      }

      // All attempts failed
      clearToken()
      setUser(null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [baseUrl])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const login = async (email: string, password: string) => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }))
      throw new Error(err.error || 'Login failed')
    }
    const data = await res.json()

    // Store access_token in-memory (not localStorage)
    setToken(data.access_token)

    // Sync to SSR cookie (best-effort)
    syncTokenToCookie()

    if (data.user) {
      setUser(data.user)
    }
  }

  const register = async (email: string, password: string, displayName?: string) => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, display_name: displayName }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }))
      throw new Error(err.error || 'Registration failed')
    }
  }

  const verifyEmail = async (code: string) => {
    try {
      const res = await fetch(`${baseUrl}/auth/email/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { ok: false, error: data.error || 'Verification failed' }
      }
      // Update user's email_verified status
      if (user) {
        setUser({ ...user, email_verified: true })
      }
      return { ok: true }
    } catch {
      return { ok: false, error: 'Network error' }
    }
  }

  const resendVerification = async () => {
    try {
      const res = await fetch(`${baseUrl}/auth/email/verify/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        return { ok: false, error: data.error || 'Failed to resend verification code' }
      }
      return { ok: true }
    } catch {
      return { ok: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    const accessToken = getToken()
    try {
      await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
      })
    } catch {
      // Proceed with local cleanup even if server request fails
    }

    // Clear in-memory token
    clearToken()

    // Clear SSR cookies
    try {
      await fetch('/api/auth/clear-session', { method: 'POST' })
    } catch {
      // Best-effort
    }

    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshSession, verifyEmail, resendVerification }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
