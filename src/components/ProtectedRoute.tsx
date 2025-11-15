import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { navigate } from 'gatsby'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPath?: string
}

export function ProtectedRoute({ children, requiredPath }: ProtectedRouteProps) {
  const { user, loading, hasAccess } = useAuth()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg">Checking permissions...</p>
        </div>
      </div>
    )
  }

  // Check if user has access to the required path
  if (requiredPath && user && !hasAccess(requiredPath)) {
    // Redirect to projects page if user doesn't have access
    if (typeof window !== 'undefined') {
      navigate('/projects')
    }
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => navigate('/projects')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Projects
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

