import React, { useMemo } from "react"
import { Layout } from "../components/Layout"
import { StatsCard } from "../components/StatsCard"
import { ChartCard } from "../components/ChartCard"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorMessage } from "../components/ErrorMessage"
import { useYouTrack, useYouTrackProjects } from "../hooks/useYouTrack"
import "../utils/testYouTrack" // Makes testYouTrack available in browser console
import { 
  Ticket, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  TrendingUp,
  Folder,
  Play,
  Target
} from "lucide-react"
import { 
  mockPriorityData, 
  mockStatusData
} from "../utils/mockData"
import type { DashboardStats, ChartData } from "../types"

function IndexPage() {
  const { tickets, loading, error, refetch } = useYouTrack()
  const { tickets: projects, loading: projectsLoading } = useYouTrackProjects()
  
  const dashboardStats: DashboardStats = useMemo(() => ({
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => !t.state.resolved).length,
    resolvedTickets: tickets.filter(t => t.state.resolved).length,
    myTickets: tickets.filter(t => t.assignee?.id === "1").length,
    overdueTickets: 0 // We'll calculate this properly when we have more data
  }), [tickets])
  
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
    
    return Object.entries(priorityCount).map(([name, value]) => ({
      name,
      value,
      color: name === 'Urgent' ? '#dc2626' :
             name === 'High' ? '#ef4444' : 
             name === 'Medium' ? '#f59e0b' : 
             name === 'Low' ? '#10b981' :
             name === 'TBD' ? '#8b5cf6' :
             '#06b6d4' // Default cyan color for any other priorities
    }))
  }, [projects])

  const projectStatusData = useMemo(() => {
    if (!projects.length) return []
    const statusCount: { [key: string]: number } = {}
    projects.forEach(project => {
      const status = project.state.name
      statusCount[status] = (statusCount[status] || 0) + 1
    })
    return Object.entries(statusCount).map(([name, value]) => ({
      name,
      value,
      color: name.includes('Progress') ? '#f59e0b' : 
             name.includes('Done') || name.includes('Completed') ? '#10b981' : 
             name.includes('Open') || name.includes('To Do') ? '#3b82f6' :
             name.includes('Scoping') ? '#8b5cf6' : // Purple for Needs Scoping
             '#06b6d4' // Cyan instead of gray for other statuses
    }))
  }, [projects])

  // Generate project stats
  const projectStats = useMemo(() => ({
    totalProjects: projects.length,
    openProjects: projects.filter(p => !p.state.resolved).length,
    resolvedProjects: projects.filter(p => p.state.resolved).length,
    inProgressProjects: projects.filter(p => p.state.name.includes('Progress')).length
  }), [projects])


  if (loading) {
    return (
      <Layout title="Home">
        <LoadingSpinner message="Loading YouTrack data..." />
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Home">
        <ErrorMessage 
          message={`Failed to load YouTrack data: ${error}`}
          onRetry={refetch}
        />
      </Layout>
    )
  }

  return (
    <Layout title="Home">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Tasks"
          value={dashboardStats.totalTickets}
          icon={Ticket}
          color="bg-blue-500"
        />
        <StatsCard
          title="Open Tasks"
          value={dashboardStats.openTickets}
          icon={AlertCircle}
          color="bg-orange-500"
        />
        <StatsCard
          title="Resolved Tasks"
          value={dashboardStats.resolvedTickets}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatsCard
          title="Sprint Tasks"
          value={dashboardStats.totalTickets}
          icon={Clock}
          color="bg-purple-500"
        />
      </div>

      {/* Task Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Tasks by Priority" data={mockPriorityData} />
        <ChartCard title="Tasks by Status" data={mockStatusData} />
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Projects"
          value={projectStats.totalProjects}
          icon={Folder}
          color="bg-indigo-500"
        />
        <StatsCard
          title="Open Projects"
          value={projectStats.openProjects}
          icon={Target}
          color="bg-orange-500"
        />
        <StatsCard
          title="In Progress"
          value={projectStats.inProgressProjects}
          icon={Play}
          color="bg-yellow-500"
        />
        <StatsCard
          title="Completed Projects"
          value={projectStats.resolvedProjects}
          icon={CheckCircle}
          color="bg-green-500"
        />
      </div>

      {/* Project Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Projects by Priority" 
          data={projectsLoading ? [] : projectPriorityData} 
        />
        <ChartCard 
          title="Projects by Status" 
          data={projectsLoading ? [] : projectStatusData} 
        />
      </div>
    </Layout>
  )
}

export default IndexPage

export function Head() {
  return (
    <>
      <title>Home - YouTrack</title>
      <meta name="description" content="YouTrack ticketing system home" />
    </>
  )
}
