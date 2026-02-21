import React, { useMemo } from "react"
import { Layout } from "../components/Layout"
import { AuthGuard } from "../components/AuthGuard"
import { ProtectedRoute } from "../components/ProtectedRoute"
import { StatsCard } from "../components/StatsCard"
import { BarChartCard } from "../components/BarChartCard"
import { SimpleProjectCard } from "../components/SimpleProjectCard"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorMessage } from "../components/ErrorMessage"
import { useYouTrackProjects } from "../hooks/useYouTrack"
import "../utils/testYouTrack" // Makes testYouTrack available in browser console

function IndexPage() {
  return (
    <AuthGuard>
      <ProtectedRoute requiredPath="/">
        <IndexPageContent />
      </ProtectedRoute>
    </AuthGuard>
  )
}

function IndexPageContent() {
  const { tickets: projects, loading: projectsLoading, error, refetch } = useYouTrackProjects()

  // Generate project charts data with matching color schemes and normalized labels
  const projectPriorityData = useMemo(() => {
    if (!projects.length) return []
    const priorityCount: { [key: string]: number } = {}
    
    projects.forEach(project => {
      const priority = project.priority.name
      // Normalize the priority labels by removing numbers
      let normalizedPriority = priority
      if (priority === '0 - Urgent') normalizedPriority = 'Urgent'
      else if (priority === '1 - High') normalizedPriority = 'High'
      else if (priority === '2 - Medium') normalizedPriority = 'Medium'
      else if (priority === '3 - Low') normalizedPriority = 'Low'
      else if (priority === 'TBD') normalizedPriority = 'TBD'
      else {
        // Remove any number prefix pattern like "4 - Something" -> "Something"
        normalizedPriority = priority.replace(/^\d+\s*-\s*/, '')
      }
      
      priorityCount[normalizedPriority] = (priorityCount[normalizedPriority] || 0) + 1
    })
    
    // Define priority order: Low, Medium, High, Urgent, TBD
    const priorityOrder = ['Low', 'Medium', 'High', 'Urgent', 'TBD']
    const priorityColors = {
      'Low': '#10b981',
      'Medium': '#f59e0b', 
      'High': '#ef4444',
      'Urgent': '#dc2626',
      'TBD': '#14b8a6'
    }
    
    return priorityOrder
      .filter(priority => priorityCount[priority] > 0)
      .map(priority => ({
        name: priority,
        value: priorityCount[priority],
        color: priorityColors[priority as keyof typeof priorityColors] || '#06b6d4'
      }))
  }, [projects])

  const projectStatusData = useMemo(() => {
    if (!projects.length) return []
    const statusCount: { [key: string]: number } = {}
    
    projects.forEach(project => {
      const status = project.state.name
      statusCount[status] = (statusCount[status] || 0) + 1
    })
    
    // Define status order: To Do, In Progress, Done, Needs Scoping
    // Map actual status names to our desired order
    const statusMapping: { [key: string]: string } = {
      'Open': 'To Do',
      'To Do': 'To Do',
      'In Progress': 'In Progress',
      'Done': 'Done',
      'Completed': 'Done',
      'Needs Scoping': 'Needs Scoping'
    }
    
    const statusOrder = ['To Do', 'In Progress', 'Done', 'Needs Scoping']
    const statusColors = {
      'To Do': '#3b82f6',
      'In Progress': '#f59e0b', 
      'Done': '#10b981',
      'Needs Scoping': '#14b8a6'
    }
    
    // Group statuses by normalized names
    const normalizedStatusCount: { [key: string]: number } = {}
    Object.entries(statusCount).forEach(([status, count]) => {
      const normalizedStatus = statusMapping[status] || status
      normalizedStatusCount[normalizedStatus] = (normalizedStatusCount[normalizedStatus] || 0) + count
    })
    
    return statusOrder
      .filter(status => normalizedStatusCount[status] > 0)
      .map(status => ({
        name: status,
        value: normalizedStatusCount[status],
        color: statusColors[status as keyof typeof statusColors] || '#06b6d4'
      }))
  }, [projects])

  // Generate project stats
  const projectStats = useMemo(() => ({
    totalProjects: projects.length,
    openProjects: projects.filter(p => !p.state.resolved).length,
    resolvedProjects: projects.filter(p => p.state.resolved).length,
    inProgressProjects: projects.filter(p => p.state.name.includes('Progress')).length
  }), [projects])

  // Get in-progress projects
  const inProgressProjects = useMemo(() => {
    return projects.filter(p => p.state.name.includes('Progress')).slice(0, 10)
  }, [projects])

  if (projectsLoading) {
    return (
      <Layout title="Home">
        <LoadingSpinner message="Loading project data..." />
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Home">
        <ErrorMessage 
          message={`Failed to load project data: ${error}`}
          onRetry={refetch}
        />
      </Layout>
    )
  }

  return (
    <Layout title="Home">
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Projects"
          value={projectStats.totalProjects}
        />
        <StatsCard
          title="Open Projects"
          value={projectStats.openProjects}
        />
        <StatsCard
          title="In Progress"
          value={projectStats.inProgressProjects}
        />
        <StatsCard
          title="Completed Projects"
          value={projectStats.resolvedProjects}
        />
      </div>

      {/* Project Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChartCard 
          title="Projects by Priority" 
          data={projectsLoading ? [] : projectPriorityData} 
        />
        <BarChartCard 
          title="Projects by Status" 
          data={projectsLoading ? [] : projectStatusData} 
        />
      </div>

      {/* In Progress Projects */}
      <div className="mb-8">
        {inProgressProjects.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-breeze-800 mb-4">
              Projects In Progress
            </h2>
            <div className="space-y-4">
              {inProgressProjects.map(project => (
                <SimpleProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center py-12">
            <h2 className="text-2xl font-bold text-breeze-800 mb-4">
              Projects In Progress
            </h2>
            <p className="text-breeze-600">No projects currently in progress.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default IndexPage

