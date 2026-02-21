import React from "react"
import { Layout } from "../components/Layout"
import { AuthGuard } from "../components/AuthGuard"
import { ProjectList } from "../components/ProjectList"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorMessage } from "../components/ErrorMessage"
import { useYouTrackProjects } from "../hooks/useYouTrack"
import { RefreshCw } from "lucide-react"

function ProjectsPage() {
  return (
    <AuthGuard>
      <ProjectsPageContent />
    </AuthGuard>
  )
}

function ProjectsPageContent() {
  const { tickets: projects, loading, error, refetch } = useYouTrackProjects()

  if (loading) {
    return (
      <Layout title="Projects">
        <LoadingSpinner message="Loading YouTrack projects..." />
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Projects">
        <ErrorMessage 
          message={`Failed to load projects: ${error}`}
          onRetry={refetch}
        />
      </Layout>
    )
  }

  return (
    <Layout title="Projects">
      <div className="flex items-center gap-2 mb-4">
        <p className="text-breeze-500 text-sm">
          Last Updated: {new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })} - {projects.length} projects found
        </p>
        <button
          onClick={refetch}
          className="text-breeze-500 hover:text-ocean-600 transition-colors"
          title="Refresh projects"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <ProjectList projects={projects} showFilters />
    </Layout>
  )
}

export default ProjectsPage

