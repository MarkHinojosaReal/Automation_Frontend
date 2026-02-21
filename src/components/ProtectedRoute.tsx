import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPath?: string
}

export function ProtectedRoute({ children, requiredPath }: ProtectedRouteProps) {
  const { user, loading, hasAccess } = useAuth()
  const navigate = useNavigate()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-breeze-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mx-auto mb-4"></div>
          <p className="text-breeze-800 text-lg">Checking permissions...</p>
        </div>
      </div>
    )
  }

  // Check if user has access to the required path
  if (requiredPath && user && !hasAccess(requiredPath)) {
    // Redirect to projects page if user doesn't have access
    navigate('/projects')
    return (
      <div className="min-h-screen bg-breeze-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-breeze-800 mb-2">Access Denied</h1>
          <p className="text-breeze-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => navigate('/projects')}
            className="bg-ocean-500 hover:bg-ocean-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Projects
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

