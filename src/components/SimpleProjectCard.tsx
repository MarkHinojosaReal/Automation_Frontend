import React from "react"
import { User, Calendar } from "lucide-react"
import type { Ticket } from "../types"

interface SimpleProjectCardProps {
  project: Ticket
}

export function SimpleProjectCard({ project }: SimpleProjectCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const getYouTrackUrl = (idReadable: string) => {
    const youtrackBase = import.meta.env.VITE_YOUTRACK_BASE_URL || 'https://realbrokerage.youtrack.cloud'
    return `${youtrackBase}/issue/${idReadable}`
  }

  const getPriorityColor = (priorityName: string) => {
    const normalizePriority = (name: string): string => {
      if (name === '0 - Urgent') return 'Urgent'
      if (name === '1 - High') return 'High'
      if (name === '2 - Medium') return 'Medium'
      if (name === '3 - Low') return 'Low'
      if (name === 'TBD') return 'TBD'
      return name.replace(/^\d+\s*-\s*/, '')
    }
    
    const normalizedPriority = normalizePriority(priorityName)
    
    // Colors matching the bar chart exactly
    switch (normalizedPriority) {
      case 'Low': return "text-white border-0" // #10b981
      case 'Medium': return "text-white border-0" // #f59e0b
      case 'High': return "text-white border-0" // #ef4444
      case 'Urgent': return "text-white border-0" // #dc2626
      case 'TBD': return "text-white border-0" // #14b8a6
      default: return "text-white border-0"
    }
  }

  const getPriorityBgColor = (priorityName: string) => {
    const normalizePriority = (name: string): string => {
      if (name === '0 - Urgent') return 'Urgent'
      if (name === '1 - High') return 'High'
      if (name === '2 - Medium') return 'Medium'
      if (name === '3 - Low') return 'Low'
      if (name === 'TBD') return 'TBD'
      return name.replace(/^\d+\s*-\s*/, '')
    }
    
    const normalizedPriority = normalizePriority(priorityName)
    
    // Exact colors from the bar chart
    switch (normalizedPriority) {
      case 'Low': return '#10b981'
      case 'Medium': return '#f59e0b'
      case 'High': return '#ef4444'
      case 'Urgent': return '#dc2626'
      case 'TBD': return '#14b8a6'
      default: return '#06b6d4'
    }
  }

  return (
    <div className="bg-breeze-50/50 hover:bg-breeze-100/50 transition-all duration-200 rounded-lg border border-breeze-200/50 p-4">
      <div className="flex items-center gap-4">
        {/* Issue Value */}
        <a 
          href={getYouTrackUrl(project.idReadable)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-mono text-breeze-600 bg-white px-3 py-1.5 rounded hover:bg-breeze-100 hover:text-breeze-800 transition-colors border border-breeze-200 flex-shrink-0"
        >
          {project.idReadable}
        </a>
        
        {/* Issue Name */}
        <h4 className="font-medium text-breeze-800 text-base flex-1 min-w-0 truncate">
          {project.summary}
        </h4>
        
        {/* Assignee */}
        <div className="flex items-center space-x-2 text-sm text-breeze-600 flex-shrink-0">
          <User className="w-4 h-4" />
          <span>{project.assignee ? project.assignee.name : 'Unassigned'}</span>
        </div>
        
        {/* Created Date */}
        <div className="flex items-center space-x-2 text-sm text-breeze-500 flex-shrink-0">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(project.created)}</span>
        </div>
        
        {/* Priority */}
        <span 
          className={`px-3 py-1.5 text-xs font-medium rounded ${getPriorityColor(project.priority.name)} flex-shrink-0`}
          style={{ backgroundColor: getPriorityBgColor(project.priority.name) }}
        >
          {project.priority.name.replace(/^\d+\s*-\s*/, '')}
        </span>
      </div>
    </div>
  )
}

