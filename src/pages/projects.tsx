import React from "react"
import { Layout } from "../components/Layout"
import { ProjectList } from "../components/ProjectList"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorMessage } from "../components/ErrorMessage"
import { useYouTrackProjects } from "../hooks/useYouTrack"

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
      <p className="text-breeze-500 text-sm mb-4">
        Last Updated: {new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })} - {projects.length} projects found
      </p>

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
