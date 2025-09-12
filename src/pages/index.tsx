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
import type { DashboardStats } from "../types"

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

  // Generate task priority data with ordered legend
  const taskPriorityData = useMemo(() => {
    if (!tickets.length) return []
    const priorityCount: { [key: string]: number } = {}
    
    tickets.forEach(ticket => {
      const priority = ticket.priority.name
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
  }, [tickets])

  // Generate task status data with ordered legend
  const taskStatusData = useMemo(() => {
    if (!tickets.length) return []
    const statusCount: { [key: string]: number } = {}
    
    tickets.forEach(ticket => {
      const status = ticket.state.name
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
  }, [tickets])
  
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
          color="bg-teal-500"
        />
      </div>

      {/* Task Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard 
          title="Tasks by Priority" 
          data={loading ? [] : taskPriorityData} 
        />
        <ChartCard 
          title="Tasks by Status" 
          data={loading ? [] : taskStatusData} 
        />
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
