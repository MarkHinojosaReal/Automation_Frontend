import React, { useState } from "react"
import { Link } from "gatsby"
import ReactMarkdown from "react-markdown"
import { Calendar, User, Tag, ChevronDown, ChevronUp, Users } from "lucide-react"
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

  const getPriorityColor = (color: string) => {
    switch (color) {
      case "#ef4444": return "bg-red-500/20 text-red-200 border border-red-400/30"
      case "#f59e0b": return "bg-yellow-500/20 text-yellow-200 border border-yellow-400/30"
      case "#6b7280": return "bg-breeze-500/20 text-breeze-200 border border-breeze-400/30"
      default: return "bg-breeze-500/20 text-breeze-200 border border-breeze-400/30"
    }
  }

  const getTypeColor = (color: string) => {
    switch (color) {
      case "#ef4444": return "bg-red-500/20 text-red-200 border border-red-400/30"
      case "#f59e0b": return "bg-accent-500/20 text-accent-200 border border-accent-400/30"
      case "#10b981": return "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30"
      case "#6366f1": return "bg-indigo-500/20 text-indigo-200 border border-indigo-400/30"
      case "#8b5cf6": return "bg-purple-500/20 text-purple-200 border border-purple-400/30"
      default: return "bg-ocean-500/20 text-ocean-200 border border-ocean-400/30"
    }
  }

  const getStateColor = (stateName: string, resolved: boolean) => {
    if (resolved) {
      return "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30"
    }
    
    switch (stateName.toLowerCase()) {
      case 'in progress':
      case 'in development':
      case 'active':
        return "bg-accent-500/20 text-accent-200 border border-accent-400/30"
      case 'open':
      case 'new':
      case 'to do':
        return "bg-ocean-500/20 text-ocean-200 border border-ocean-400/30"
      case 'blocked':
      case 'on hold':
        return "bg-red-500/20 text-red-200 border border-red-400/30"
      case 'review':
      case 'testing':
        return "bg-purple-500/20 text-purple-200 border border-purple-400/30"
      default:
        return "bg-breeze-500/20 text-breeze-200 border border-breeze-400/30"
    }
  }

  if (compact) {
    return (
      <Link
        to={`/projects/${project.id}`}
        className="block hover:bg-white/10 transition-all duration-300 border-b border-white/10 last:border-b-0 backdrop-blur-sm"
      >
        <div className="py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <span className="text-sm font-mono text-white/60 bg-white/10 px-2 py-1 rounded-lg">{project.idReadable}</span>
              <h3 className="font-medium text-white/90 truncate">{project.summary}</h3>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${getStateColor(project.state.name, project.state.resolved)}`}>
                {project.state.name}
              </span>
              <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${getPriorityColor(project.priority.color)}`}>
                {project.priority.name}
              </span>
              {project.initiative && (
                <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-200 rounded-lg">
                  {project.initiative}
                </span>
              )}
              {project.assignee && (
                <div className="flex items-center space-x-1 text-sm text-white/50">
                  <User className="w-3 h-3" />
                  <span>{project.assignee.name}</span>
                </div>
              )}
              <span className="text-sm text-white/50">{formatDate(project.updated)}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="card group hover:shadow-2xl">
      {/* Header Row with all info except description */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <span className="text-sm font-mono text-white/60 bg-white/10 px-3 py-1 rounded-lg">{project.idReadable}</span>
          <Link to={`/projects/${project.id}`} className="flex-1">
            <h3 className="text-lg font-semibold text-white hover:text-ocean-300 transition-colors group-hover:text-ocean-200 truncate">
              {project.summary}
            </h3>
          </Link>
          {project.description && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-white/60 hover:text-white/90 hover:bg-white/10 rounded-lg transition-all duration-200"
            >
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
            </button>
          )}
        </div>
      </div>

      {/* Metadata Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${getTypeColor(project.type.color)}`}>
            {project.type.name}
          </span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${getPriorityColor(project.priority.color)}`}>
            {project.priority.name}
          </span>
          {project.initiative && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
              {project.initiative}
            </span>
          )}
          <div className="flex items-center space-x-1 text-sm text-white/50">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(project.created)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {project.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <Tag className="w-4 h-4 text-white/40" />
              <span className="text-xs text-white/50">
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
      <div className="flex items-center space-x-6 mb-3 text-sm text-white/60">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span className="text-white/50">Requestor:</span>
          <span className="text-white/80">{project.reporter.name}</span>
        </div>
        {project.assignee && (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span className="text-white/50">Assignee:</span>
            <span className="text-white/80">{project.assignee.name}</span>
          </div>
        )}
        {!project.assignee && (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span className="text-white/50">Assignee:</span>
            <span className="text-white/40 italic">Unassigned</span>
          </div>
        )}
      </div>

      {/* Expandable Description */}
      {project.description && isExpanded && (
        <div className="border-t border-white/10 pt-4 mt-3">
          <div className="text-white/70 text-sm prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2">{children}</p>,
                h1: ({ children }) => <h4 className="text-base font-semibold text-white/90 mb-2 mt-4 first:mt-0">{children}</h4>,
                h2: ({ children }) => <h5 className="text-sm font-semibold text-white/90 mb-2 mt-3 first:mt-0">{children}</h5>,
                h3: ({ children }) => <h6 className="text-sm font-semibold text-white/90 mb-1 mt-2 first:mt-0">{children}</h6>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 pl-4">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 pl-4">{children}</ol>,
                li: ({ children }) => <li className="text-sm text-white/70">{children}</li>,
                a: ({ href, children }) => <a href={href} className="text-ocean-300 hover:text-ocean-200 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                code: ({ children }) => <code className="bg-white/10 px-2 py-1 rounded text-sm font-mono">{children}</code>,
                pre: ({ children }) => <pre className="bg-white/5 border border-white/10 rounded-lg p-3 mb-3 overflow-x-auto">{children}</pre>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-ocean-400/50 pl-4 mb-3 italic text-white/60">{children}</blockquote>
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