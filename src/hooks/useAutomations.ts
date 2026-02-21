import { useState, useEffect, useCallback } from 'react'
import type { Automation } from '../types/automation'

interface UseAutomationsResult {
  automations: Automation[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateAutomation: (id: string, isActive: boolean) => Promise<void>
}

export function useAutomations(pollingInterval: number = 5000): UseAutomationsResult {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAutomations = useCallback(async () => {
    try {
      const apiUrl = '/api/automations'
        
      const response = await fetch(apiUrl, {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.')
        }
        throw new Error(`Failed to fetch automations: ${response.statusText}`)
      }

      const data = await response.json()
      setAutomations(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAutomation = useCallback(async (id: string, isActive: boolean) => {
    try {
      const apiUrl = `/api/automations/${id}`
        
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_active: isActive })
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.')
        }
        throw new Error(`Failed to update automation: ${response.statusText}`)
      }

      const updatedAutomation = await response.json()
      
      // Update local state
      setAutomations(prevAutomations =>
        prevAutomations.map(automation =>
          automation.id === id ? updatedAutomation : automation
        )
      )
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err // Re-throw so the component can handle it
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchAutomations()
  }, [fetchAutomations])

  // Polling for updates
  useEffect(() => {
    if (pollingInterval <= 0) return

    const interval = setInterval(() => {
      // Only poll if not currently loading
      if (!loading) {
        fetchAutomations()
      }
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [pollingInterval, loading, fetchAutomations])

  return {
    automations,
    loading,
    error,
    refetch: fetchAutomations,
    updateAutomation,
  }
}

