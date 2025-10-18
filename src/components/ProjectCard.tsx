import React, { useState } from "react"
import { Link } from "gatsby"
import ReactMarkdown from "react-markdown"
import { Calendar, User, Tag, ChevronDown, ChevronUp, Users, Clock, DollarSign } from "lucide-react"
import type { Ticket } from "../types"

interface ProjectCardProps {
  project: Ticket
  compact?: boolean
}

export function ProjectCard({ project, compact = false }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    })
  }

  const formatSavedTime = (minutes: number | null | undefined) => {
    const hours = (minutes || 0) / 60
    return `${hours.toFixed(1)}h`
  }

  const formatCostImpact = (minutes: number | null | undefined) => {
    const hours = (minutes || 0) / 60
    const cost = hours * 35 // $35/hour
    return `$${cost.toLocaleString()}`
  }

  const getYouTrackUrl = (idReadable: string) => {
    const youtrackBase = process.env.GATSBY_YOUTRACK_BASE_URL || 'https://realbrokerage.youtrack.cloud'
    return `${youtrackBase}/issue/${idReadable}`
  }

  const getPriorityColor = (priorityName: string) => {
    // Normalize priority names to match home page chart colors
    const normalizePriority = (name: string): string => {
      if (name === '0 - Urgent') return 'Urgent'
      if (name === '1 - High') return 'High'
      if (name === '2 - Medium') return 'Medium'
      if (name === '3 - Low') return 'Low'
      if (name === 'TBD') return 'TBD'
      // Remove any number prefix pattern like "4 - Something" -> "Something"
      return name.replace(/^\d+\s*-\s*/, '')
    }
    
    const normalizedPriority = normalizePriority(priorityName)
    
    switch (normalizedPriority) {
      case 'Urgent': return "bg-red-600/20 text-red-800 border border-red-500/30"
      case 'High': return "bg-red-500/20 text-red-700 border border-red-400/30"
      case 'Medium': return "bg-yellow-500/20 text-yellow-800 border border-yellow-400/30"
      case 'Low': return "bg-green-500/20 text-green-800 border border-green-400/30"
      case 'TBD': return "bg-teal-500/20 text-teal-800 border border-teal-400/30"
      default: return "bg-breeze-500/20 text-breeze-800 border border-breeze-400/30"
    }
  }


  const getStateColor = (stateName: string, resolved: boolean) => {
    // Map actual status names to normalized names matching home page chart colors
    const statusMapping: { [key: string]: string } = {
      'Open': 'To Do',
      'To Do': 'To Do',
      'In Progress': 'In Progress',
      'Done': 'Done',
      'Completed': 'Done',
      'Needs Scoping': 'Needs Scoping'
    }
    
    const normalizedStatus = statusMapping[stateName] || stateName
    
    switch (normalizedStatus) {
      case 'To Do':
        return "bg-blue-500/20 text-blue-800 border border-blue-400/30"
      case 'In Progress':
        return "bg-yellow-500/20 text-yellow-800 border border-yellow-400/30"
      case 'Done':
        return "bg-green-500/20 text-green-800 border border-green-400/30"
      case 'Needs Scoping':
        return "bg-teal-500/20 text-teal-800 border border-teal-400/30"
      default:
        return "bg-breeze-500/20 text-breeze-800 border border-breeze-400/30"
    }
  }

  if (compact) {
    return (
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="block hover:bg-slate-200 transition-all duration-300 border-b border-slate-300 last:border-b-0 backdrop-blur-sm cursor-pointer"
      >
        <div className="py-4 px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <a 
                href={getYouTrackUrl(project.idReadable)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-mono text-breeze-600 bg-slate-200 px-2 py-1 rounded-lg flex-shrink-0 hover:bg-slate-300 hover:text-breeze-800 transition-colors cursor-pointer"
              >
                {project.idReadable}
              </a>
              <h3 className="font-medium text-breeze-800 truncate min-w-0 flex-1">{project.summary}</h3>
            </div>
            <div className="flex items-center space-x-3 flex-shrink-0">
              <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${getStateColor(project.state.name, project.state.resolved)}`}>
                {project.state.name}
              </span>
              <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${getPriorityColor(project.priority.name)}`}>
                {project.priority.name}
              </span>
              {project.initiative && (
                <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-800 rounded-lg">
                  {project.initiative}
                </span>
              )}
              {project.assignee && (
                <div className="flex items-center space-x-1 text-sm text-breeze-500">
                  <User className="w-3 h-3" />
                  <span>{project.assignee.name}</span>
                </div>
              )}
              <span className="text-sm text-breeze-500">{formatDate(project.updated)}</span>
            </div>
          </div>
        </div>
        
        {/* Time Savings and Cost Impact for Compact View */}
        <div className="px-6 py-2 border-t border-slate-200">
          <div className="flex items-center space-x-6 text-sm text-breeze-600">
            <div className="flex items-center space-x-2">
              <span className="text-breeze-500">Time Saved:</span>
              <span className="text-green-600 font-medium">{formatSavedTime(project.savedTimeMins)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-breeze-500">Cost Impact:</span>
              <span className="text-green-700 font-medium">{formatCostImpact(project.savedTimeMins)}</span>
            </div>
          </div>
        </div>
        
        {/* Expandable Description for Compact View */}
        {project.description && isExpanded && (
          <div className="border-t border-slate-300 pt-4 px-6 pb-4">
            <div className="text-breeze-700 text-sm prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2">{children}</p>,
                  h1: ({ children }) => <h4 className="text-base font-semibold text-breeze-800 mb-2 mt-4 first:mt-0">{children}</h4>,
                  h2: ({ children }) => <h5 className="text-sm font-semibold text-breeze-800 mb-2 mt-3 first:mt-0">{children}</h5>,
                  h3: ({ children }) => <h6 className="text-sm font-semibold text-breeze-800 mb-1 mt-2 first:mt-0">{children}</h6>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 pl-4">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 pl-4">{children}</ol>,
                  li: ({ children }) => <li className="text-sm text-breeze-700">{children}</li>,
                  a: ({ href, children }) => <a href={href} className="text-ocean-300 hover:text-ocean-200 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                  code: ({ children }) => <code className="bg-slate-200 px-2 py-1 rounded text-sm font-mono">{children}</code>,
                  pre: ({ children }) => <pre className="bg-slate-100 border border-slate-300 rounded-lg p-3 mb-3 overflow-x-auto">{children}</pre>,
                  blockquote: ({ children }) => <blockquote className="border-l-4 border-ocean-400/50 pl-4 mb-3 italic text-breeze-600">{children}</blockquote>
                }}
              >
                {project.description}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      className="card group hover:shadow-2xl cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header Row with all info except description */}
      <div className="flex items-center justify-between mb-3 gap-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <a 
            href={getYouTrackUrl(project.idReadable)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-mono text-breeze-600 bg-slate-200 px-3 py-1 rounded-lg flex-shrink-0 hover:bg-slate-300 hover:text-breeze-800 transition-colors cursor-pointer"
          >
            {project.idReadable}
          </a>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-breeze-800 hover:text-ocean-600 transition-colors group-hover:text-ocean-700 truncate">
              {project.summary}
            </h3>
          </div>
        </div>
        {project.description && (
          <div className="flex items-center space-x-1 px-2 py-1 text-xs text-breeze-600 hover:text-breeze-800 hover:bg-slate-200 rounded-lg transition-all duration-200 flex-shrink-0">
            {isExpanded ? (
              <>
                <span>Hide</span>
                <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>Details</span>
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </div>
        )}
      </div>

      {/* Metadata Row */}
      <div className="flex items-center justify-between mb-3 gap-4">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${getPriorityColor(project.priority.name)} flex-shrink-0`}>
            {project.priority.name}
          </span>
          {project.initiative && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-800 border border-purple-400/30 flex-shrink-0">
              {project.initiative}
            </span>
          )}
          <div className="flex items-center space-x-1 text-sm text-breeze-500 flex-shrink-0">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(project.created)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 flex-shrink-0">
          {project.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <Tag className="w-4 h-4 text-breeze-400" />
              <span className="text-xs text-breeze-500 truncate max-w-32">
                {project.tags.slice(0, 2).join(", ")}
                {project.tags.length > 2 && ` +${project.tags.length - 2}`}
              </span>
            </div>
          )}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${getStateColor(project.state.name, project.state.resolved)}`}>
            {project.state.name}
          </span>
        </div>
      </div>

      {/* People Row - Requestor and Assignee */}
      <div className="flex items-center space-x-6 mb-3 text-sm text-breeze-600">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <Users className="w-4 h-4 flex-shrink-0" />
          <span className="text-breeze-500 flex-shrink-0">Requestor:</span>
          <span className="text-breeze-800 truncate">{project.requestor?.name || project.reporter.name}</span>
        </div>
        {project.assignee && (
          <div className="flex items-center space-x-2 min-w-0">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="text-breeze-500 flex-shrink-0">Assignee:</span>
            <span className="text-breeze-800 truncate">{project.assignee.name}</span>
          </div>
        )}
        {!project.assignee && (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="text-breeze-500 flex-shrink-0">Assignee:</span>
            <span className="text-breeze-400 italic">Unassigned</span>
          </div>
        )}
      </div>

      {/* Time Savings and Cost Impact Row */}
      <div className="flex items-center space-x-6 mb-3 text-sm text-breeze-600">
        <div className="flex items-center space-x-2">
          <span className="text-breeze-500">Time Saved:</span>
          <span className="text-green-600 font-medium">{formatSavedTime(project.savedTimeMins)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-breeze-500">Cost Impact:</span>
          <span className="text-green-700 font-medium">{formatCostImpact(project.savedTimeMins)}</span>
        </div>
      </div>

      {/* Expandable Description */}
      {project.description && isExpanded && (
        <div className="border-t border-slate-300 pt-4 mt-3">
          <div className="text-breeze-700 text-sm prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2">{children}</p>,
                h1: ({ children }) => <h4 className="text-base font-semibold text-breeze-800 mb-2 mt-4 first:mt-0">{children}</h4>,
                h2: ({ children }) => <h5 className="text-sm font-semibold text-breeze-800 mb-2 mt-3 first:mt-0">{children}</h5>,
                h3: ({ children }) => <h6 className="text-sm font-semibold text-breeze-800 mb-1 mt-2 first:mt-0">{children}</h6>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 pl-4">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 pl-4">{children}</ol>,
                li: ({ children }) => <li className="text-sm text-breeze-700">{children}</li>,
                a: ({ href, children }) => <a href={href} className="text-ocean-300 hover:text-ocean-200 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                code: ({ children }) => <code className="bg-slate-200 px-2 py-1 rounded text-sm font-mono">{children}</code>,
                pre: ({ children }) => <pre className="bg-slate-100 border border-slate-300 rounded-lg p-3 mb-3 overflow-x-auto">{children}</pre>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-ocean-400/50 pl-4 mb-3 italic text-breeze-600">{children}</blockquote>
              }}
            >
              {project.description}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}