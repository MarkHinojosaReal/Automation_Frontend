import React from "react"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import type { Ticket } from "../types"

interface ProjectTableProps {
  projects: Ticket[]
  sortColumn?: string
  sortOrder?: "asc" | "desc"
  onSort?: (column: string) => void
}

function getYouTrackUrl(idReadable: string): string {
  const youtrackBase = import.meta.env.VITE_YOUTRACK_BASE_URL || 'https://realbrokerage.youtrack.cloud'
  return `${youtrackBase}/issue/${idReadable}`
}

function getPriorityColor(priorityName: string): string {
  const normalized = priorityName.replace(/^\d+\s*-\s*/, '')
  switch (normalized) {
    case 'Urgent': return "bg-priority-urgent/10 text-priority-urgent border border-priority-urgent/20"
    case 'High':   return "bg-priority-high/10 text-priority-high border border-priority-high/20"
    case 'Medium': return "bg-priority-medium/10 text-priority-medium border border-priority-medium/20"
    case 'Low':    return "bg-priority-low/10 text-priority-low border border-priority-low/20"
    case 'TBD':    return "bg-priority-tbd/10 text-priority-tbd border border-priority-tbd/20"
    default:       return "bg-breeze-500/10 text-breeze-800 border border-breeze-400/20"
  }
}

function getStateColor(stateName: string): string {
  const statusMapping: Record<string, string> = {
    'Open': 'To Do',
    'To Do': 'To Do',
    'In Progress': 'In Progress',
    'Done': 'Done',
    'Completed': 'Done',
    'Needs Scoping': 'Needs Scoping',
  }
  const normalized = statusMapping[stateName] || stateName
  switch (normalized) {
    case 'To Do':         return "bg-status-todo/10 text-status-todo border border-status-todo/20"
    case 'In Progress':   return "bg-status-progress/10 text-status-progress border border-status-progress/20"
    case 'Done':          return "bg-status-done/10 text-status-done border border-status-done/20"
    case 'Needs Scoping': return "bg-status-scoping/10 text-status-scoping border border-status-scoping/20"
    default:              return "bg-breeze-500/10 text-breeze-800 border border-breeze-400/20"
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function normalizePriority(priorityName: string): string {
  return priorityName.replace(/^\d+\s*-\s*/, '')
}

const COLUMNS: { label: string; key: string }[] = [
  { label: "Issue ID",   key: "idReadable" },
  { label: "Summary",    key: "summary" },
  { label: "Status",     key: "state" },
  { label: "Priority",   key: "priority" },
  { label: "Assignee",   key: "assignee" },
  { label: "Initiative", key: "initiative" },
  { label: "Reporter",   key: "reporter" },
  { label: "Created",    key: "created" },
]

export function ProjectTable({ projects, sortColumn, sortOrder, onSort }: ProjectTableProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-breeze-600">No projects match your current filters.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-ocean-500/10 border-b border-ocean-200">
              {COLUMNS.map(({ label, key }) => {
                const isActive = sortColumn === key
                return (
                  <th
                    key={key}
                    onClick={() => onSort?.(key)}
                    className="px-4 py-3 text-left text-xs font-semibold text-ocean-700 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:bg-ocean-500/20 transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {isActive ? (
                        sortOrder === "asc"
                          ? <ChevronUp className="w-3.5 h-3.5 text-ocean-600" />
                          : <ChevronDown className="w-3.5 h-3.5 text-ocean-600" />
                      ) : (
                        <ChevronsUpDown className="w-3.5 h-3.5 text-ocean-300" />
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-breeze-100">
            {projects.map(project => (
              <tr key={project.id} className="hover:bg-breeze-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <a
                    href={getYouTrackUrl(project.idReadable)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-ocean-600 hover:text-ocean-800 hover:underline transition-colors"
                  >
                    {project.idReadable}
                  </a>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <span className="text-sm text-breeze-800 line-clamp-2">{project.summary}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(project.state.name)}`}>
                    {project.state.name}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority.name)}`}>
                    {normalizePriority(project.priority.name)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-breeze-700">
                  {project.assignee?.name || <span className="text-breeze-400 italic">Unassigned</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-breeze-700">
                  {project.initiative || <span className="text-breeze-400">—</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-breeze-700">
                  {(project.requestor?.name || project.reporter.name)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-breeze-600">
                  {formatDate(project.created)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
