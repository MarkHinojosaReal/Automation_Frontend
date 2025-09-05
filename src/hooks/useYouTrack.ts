import { useState, useEffect } from 'react'
import { youTrackService, type YouTrackApiResponse } from '../services/youtrack'
import type { Ticket } from '../types'

interface UseYouTrackResult {
  tickets: Ticket[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useYouTrack(): UseYouTrackResult {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching current sprint issues...')
      const response = await youTrackService.getCurrentSprintIssues()
      
      if (response.error) {
        setError(response.error)
        return
      }

      if (response.data) {
        const transformedTickets = response.data.map(issue => 
          youTrackService.transformIssueToTicket(issue)
        )
        console.log(`Successfully loaded ${transformedTickets.length} tickets from YouTrack`)
        setTickets(transformedTickets)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tickets'
      console.error('Error fetching YouTrack data:', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  return {
    tickets,
    loading,
    error,
    refetch: fetchTickets
  }
}

export function useYouTrackIssue(issueId: string) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await youTrackService.getIssueById(issueId)
        
        if (response.error) {
          setError(response.error)
          return
        }

        if (response.data && response.data[0]) {
          const transformedTicket = youTrackService.transformIssueToTicket(response.data[0])
          setTicket(transformedTicket)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ticket'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (issueId) {
      fetchIssue()
    }
  }, [issueId])

  return { ticket, loading, error }
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
