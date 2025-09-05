import React from "react"
import { Layout } from "../components/Layout"
import { TicketList } from "../components/TicketList"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorMessage } from "../components/ErrorMessage"
import { useYouTrack } from "../hooks/useYouTrack"
import { RefreshCw } from "lucide-react"

function TicketsPage() {
  const { tickets, loading, error, refetch } = useYouTrack()

  if (loading) {
    return (
      <Layout title="Tasks">
        <LoadingSpinner message="Loading YouTrack tasks..." />
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Tasks">
        <ErrorMessage 
          message={`Failed to load tasks: ${error}`}
          onRetry={refetch}
        />
      </Layout>
    )
  }

  return (
    <Layout title="Tasks">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Current Sprint Tasks</h1>
          <p className="text-white/70 mt-1">
            Last Updated: {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} - {tickets.length} tasks found
          </p>
        </div>
        <button 
          onClick={refetch}
          className="btn-secondary flex items-center space-x-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <TicketList tickets={tickets} showFilters />
    </Layout>
  )
}

export default TicketsPage

export function Head() {
  return (
    <>
      <title>Tasks - YouTrack</title>
      <meta name="description" content="View and manage all tasks" />
    </>
  )
}
