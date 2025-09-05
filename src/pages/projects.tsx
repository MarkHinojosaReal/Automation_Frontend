import React from "react"
import { Layout } from "../components/Layout"
import { ProjectList } from "../components/ProjectList"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorMessage } from "../components/ErrorMessage"
import { useYouTrackProjects } from "../hooks/useYouTrack"
import { RefreshCw } from "lucide-react"

function ProjectsPage() {
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-white/70 mt-1">
            Last Updated: {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} - {projects.length} projects found
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

      <ProjectList projects={projects} showFilters />
    </Layout>
  )
}

export default ProjectsPage

export function Head() {
  return (
    <>
      <title>Projects - YouTrack</title>
      <meta name="description" content="Project overview and management" />
    </>
  )
}
