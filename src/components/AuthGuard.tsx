import React from 'react'
import { useAuth } from '../contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Use window.location.href for immediate redirect
    window.location.href = '/login'
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800 text-lg">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
