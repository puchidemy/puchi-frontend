'use client'

import { createContext, useContext, useEffect, useCallback, useRef, ReactNode } from 'react'
import { getToken, setToken, clearToken, tryRefreshToken, syncTokenToCookie, setBaseUrl, restoreTokenFromStore, decodeTokenUser } from '@/lib/token-manager'
import { useAuthStore } from '@/store/auth'
import type { User } from '@/store/auth'

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
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)
  const clear = useAuthStore((s) => s.clear)

  // Sync baseUrl to token-manager
  useEffect(() => {
    setBaseUrl(baseUrl)
  }, [baseUrl])

  const refreshSession = useCallback(async () => {
    // 1) Try restoring from Zustand store (sessionStorage — synchronous)
    let accessToken = restoreTokenFromStore()

    // 2) If no token in store, try SSR cookie restore
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
        // best-effort
      }
    }

    if (!accessToken) {
      // 3) No token at all — try refresh with HttpOnly cookie
      const newToken = await tryRefreshToken()
      if (!newToken) {
        setLoading(false)
        return
      }
      accessToken = newToken
    }

    // 4) Validate token with /auth/sessions
    try {
      const res = await fetch(`${baseUrl}/auth/sessions`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (res.ok) {
        // /auth/sessions returns { sessions: [...] } — no user info.
        // Decode user info from JWT payload (safe client-side).
        const token = accessToken as string
        const decoded = decodeTokenUser(token)
        if (decoded) {
          setUser(decoded)
        }
        setLoading(false)
        return
      }

      // 401 — token expired, try refresh
      if (res.status === 401) {
        const newToken = await tryRefreshToken()
        if (newToken) {
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
      clear()
    } catch {
      clear()
    } finally {
      setLoading(false)
    }
  }, [baseUrl, setUser, setLoading, clear])

  // Prevent duplicate session checks (React Strict Mode mounts twice)
  const sessionChecked = useRef(false)

  useEffect(() => {
    if (sessionChecked.current) return
    sessionChecked.current = true
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

    // Store access_token in-memory + Zustand store (sessionStorage)
    setToken(data.access_token)
    syncTokenToCookie()

    if (data.user) {
      setUser(data.user)
    }

    // Merge guest progress from localStorage into the authenticated account
    const { mergeIfNeeded } = await import('@/store/guest')
    mergeIfNeeded()
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { ok: false, error: data.error || 'Verification failed' }
      }
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

    // Clear everything
    clearToken()
    clear()
    try {
      await fetch('/api/auth/clear-session', { method: 'POST' })
    } catch {
      // Best-effort
    }
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
