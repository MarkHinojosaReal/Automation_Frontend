import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  email: string
  name: string
  picture?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only check auth status if NOT on login page
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
    
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
    if (!user || typeof window === 'undefined') return

    const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds
    let inactivityTimer: NodeJS.Timeout

    const resetTimer = () => {
      // Clear existing timer
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
      }

      // Set new timer
      inactivityTimer = setTimeout(() => {
        console.log('Auto-logout due to inactivity')
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
      // In development, use the proxy server
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api/auth/me'
        : '/api/auth/me'
        
      const response = await fetch(apiUrl, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
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
    setUser(user)
  }

  const logout = async () => {
    try {
      // In development, use the proxy server
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api/auth/logout'
        : '/api/auth/logout'
        
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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
