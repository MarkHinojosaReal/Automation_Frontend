import { useState, useEffect } from 'react'
import { youTrackService } from '../services/youtrack'
import type { Ticket } from '../types'

interface UseYouTrackResult {
  tickets: Ticket[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useYouTrackProjects(): UseYouTrackResult {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching project issues...')
      const response = await youTrackService.getProjectIssues()
      
      if (response.error) {
        setError(response.error)
        return
      }

      if (response.data) {
        const transformedProjects = response.data.map(issue => 
          youTrackService.transformIssueToTicket(issue)
        )
        console.log(`Successfully loaded ${transformedProjects.length} projects from YouTrack`)
        setTickets(transformedProjects)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects'
      console.error('Error fetching YouTrack project data:', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    tickets,
    loading,
    error,
    refetch: fetchProjects
  }
}
