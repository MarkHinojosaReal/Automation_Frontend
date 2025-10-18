import React from "react"
import { Layout } from "../components/Layout"
import { AuthGuard } from "../components/AuthGuard"
import { TicketList } from "../components/TicketList"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorMessage } from "../components/ErrorMessage"
import { useYouTrack } from "../hooks/useYouTrack"

function TicketsPage() {
  return (
    <AuthGuard>
      <TicketsPageContent />
    </AuthGuard>
  )
}

function TicketsPageContent() {
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
      <p className="text-breeze-500 text-sm mb-4">
        Last Updated: {new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })} - {tickets.length} tasks found
      </p>

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
