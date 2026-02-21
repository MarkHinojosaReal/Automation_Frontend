import React, { useState } from "react"
import { Layout } from "../components/Layout"
import { AuthGuard } from "../components/AuthGuard"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorMessage } from "../components/ErrorMessage"
import { AutomationToggle } from "../components/AutomationToggle"
import { useAutomations } from "../hooks/useAutomations"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

function AutomationsPage() {
  return (
    <AuthGuard>
      <AutomationsPageContent />
    </AuthGuard>
  )
}

function AutomationsPageContent() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const { automations, loading, error, refetch, updateAutomation } = useAutomations(60000) // Poll every 1 minute
  const [updateError, setUpdateError] = useState<string | null>(null)

  // Redirect non-admin users
  React.useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/')
    }
  }, [isAdmin, loading])

  const handleToggle = async (id: string, newValue: boolean) => {
    setUpdateError(null)
    try {
      await updateAutomation(id, newValue)
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update automation')
    }
  }

  if (loading) {
    return (
      <Layout title="Control Panel">
        <LoadingSpinner message="Loading automations..." />
      </Layout>
    )
  }

  if (!isAdmin) {
    return (
      <Layout title="Access Denied">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-breeze-900 mb-4">Access Denied</h2>
          <p className="text-breeze-600 mb-8">You need admin privileges to access this page.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600"
          >
            Go Home
          </button>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Control Panel">
        <ErrorMessage 
          message={`Failed to load automations: ${error}`}
          onRetry={refetch}
        />
      </Layout>
    )
  }

  return (
    <Layout title="Control Panel">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-breeze-900">Control Panel</h1>
            <p className="text-breeze-600 mt-2">
              Manage automation states. Changes take effect immediately.
            </p>
          </div>
          <div className="text-sm text-breeze-500">
            Auto-refresh every 1 min
          </div>
        </div>
        
        {updateError && (
          <div className="mt-4 p-4 bg-priority-high/10 border border-priority-high/20 rounded-lg">
            <p className="text-priority-high text-sm">{updateError}</p>
          </div>
        )}
      </div>

      <div className="mb-6 p-4 bg-priority-medium/10 border-l-4 border-priority-medium rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-priority-medium" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-priority-medium font-medium">
              Warning: This page controls live automations. Toggle changes are immediate and will affect production systems.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-breeze-500 text-sm">
          Last Updated: {new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </p>
        <div className="text-sm text-breeze-600">
          {automations.length} automation{automations.length !== 1 ? 's' : ''} total
          {' · '}
          <span className="text-status-done font-medium">
            {automations.filter(a => a.is_active).length} active
          </span>
          {' · '}
          <span className="text-breeze-400 font-medium">
            {automations.filter(a => !a.is_active).length} inactive
          </span>
        </div>
      </div>

      {automations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No automations found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {automations.map((automation) => (
            <AutomationToggle
              key={automation.id}
              id={automation.id}
              name={automation.automation_name || 'Unnamed Automation'}
              platform={automation.platform}
              initiative={automation.initiative}
              isActive={automation.is_active ?? false}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}

export default AutomationsPage


