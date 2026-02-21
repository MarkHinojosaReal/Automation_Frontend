import React, { createContext, useContext, useState, useEffect } from 'react'
import { getUserRole, hasPageAccess, type UserRole } from '../config/permissions'

interface User {
  email: string
  name: string
  picture?: string
  role?: UserRole
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (user: User) => void
  logout: () => void
  hasAccess: (pagePath: string) => boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only check auth status if NOT on login page
    const currentPath = window.location.pathname
    
    if (currentPath === '/login') {
      // On login page - don't check auth, just set loading to false
      setLoading(false)
      setUser(null)
      return
    }
    
    checkAuthStatus()
  }, [])

  // Inactivity logout - 30 minutes of no activity
  useEffect(() => {
    if (!user) return

    const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds
    let inactivityTimer: NodeJS.Timeout

    const resetTimer = () => {
      // Clear existing timer
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
      }

      // Set new timer
      inactivityTimer = setTimeout(() => {
        logout()
      }, INACTIVITY_TIMEOUT)
    }

    // Events that indicate user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

    // Reset timer on any user activity
    events.forEach(event => {
      window.addEventListener(event, resetTimer)
    })

    // Start the initial timer
    resetTimer()

    // Cleanup on unmount
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [user])

  const checkAuthStatus = async () => {
    try {
      const apiUrl = '/api/auth/me'
        
      const response = await fetch(apiUrl, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const userWithRole = {
          ...data.user,
          role: getUserRole(data.user.email)
        }
        setUser(userWithRole)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = (user: User) => {
    const userWithRole = {
      ...user,
      role: getUserRole(user.email)
    }
    setUser(userWithRole)
  }

  const logout = async () => {
    try {
      const apiUrl = '/api/auth/logout'
        
      await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      window.location.href = '/login'
    }
  }

  const hasAccess = (pagePath: string): boolean => {
    if (!user) return false
    return hasPageAccess(user.email, pagePath)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasAccess, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
