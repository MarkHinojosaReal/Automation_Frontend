import React, { useState } from "react"
import { ProjectCard } from "./ProjectCard"
import { Search, Filter, SortAsc } from "lucide-react"
import type { Ticket } from "../types"

interface ProjectListProps {
  projects: Ticket[]
  compact?: boolean
  showFilters?: boolean
}

export function ProjectList({ projects, compact = false, showFilters = false }: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [stateFilter, setStateFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [requestorFilter, setRequestorFilter] = useState("all")
  const [initiativeFilter, setInitiativeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("updated")

  // Extract unique values from projects for dynamic filters
  const uniqueStates = Array.from(new Set(projects.map(project => project.state.name))).sort()
  const uniquePriorities = Array.from(new Set(projects.map(project => project.priority.name))).sort()
  const uniqueAssignees = Array.from(new Set(projects.filter(project => project.assignee).map(project => project.assignee!.name))).sort()
  const uniqueRequestors = Array.from(new Set(projects.map(project => project.reporter.name))).sort()
  const uniqueInitiatives = Array.from(new Set(projects.filter(project => project.initiative).map(project => project.initiative!))).sort()

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.idReadable.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (project.reporter.name && project.reporter.name.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesState = stateFilter === "all" || project.state.name === stateFilter
      const matchesPriority = priorityFilter === "all" || project.priority.name === priorityFilter
      const matchesAssignee = assigneeFilter === "all" || 
                             (assigneeFilter === "unassigned" && !project.assignee) ||
                             (project.assignee && project.assignee.name === assigneeFilter)
      const matchesRequestor = requestorFilter === "all" || project.reporter.name === requestorFilter
      const matchesInitiative = initiativeFilter === "all" ||
                               (initiativeFilter === "none" && !project.initiative) ||
                               (project.initiative && project.initiative === initiativeFilter)
      
      return matchesSearch && matchesState && matchesPriority && matchesAssignee && matchesRequestor && matchesInitiative
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "created":
          return b.created - a.created
        case "updated":
          return b.updated - a.updated
        case "priority":
          const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 }
          return (priorityOrder[b.priority.name as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority.name as keyof typeof priorityOrder] || 0)
        default:
          return b.updated - a.updated
      }
    })

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">No projects found.</p>
      </div>
    )
  }

  return (
    <div>
      {showFilters && (
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects, requestors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-glass pl-10 pr-4 w-full text-white/90 placeholder-white/50"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-white/50" />
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="input-glass px-3 py-2 text-sm text-white/90"
              >
                <option value="all">All States</option>
                {uniqueStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-glass px-3 py-2 text-sm text-white/90"
            >
              <option value="all">All Priorities</option>
              {uniquePriorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="input-glass px-3 py-2 text-sm text-white/90"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {uniqueAssignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>

            <select
              value={requestorFilter}
              onChange={(e) => setRequestorFilter(e.target.value)}
              className="input-glass px-3 py-2 text-sm text-white/90"
            >
              <option value="all">All Requestors</option>
              {uniqueRequestors.map(requestor => (
                <option key={requestor} value={requestor}>{requestor}</option>
              ))}
            </select>

            {uniqueInitiatives.length > 0 && (
              <select
                value={initiativeFilter}
                onChange={(e) => setInitiativeFilter(e.target.value)}
                className="input-glass px-3 py-2 text-sm text-white/90"
              >
                <option value="all">All Initiatives</option>
                <option value="none">No Initiative</option>
                {uniqueInitiatives.map(initiative => (
                  <option key={initiative} value={initiative}>{initiative}</option>
                ))}
              </select>
            )}

            <div className="flex items-center space-x-2">
              <SortAsc className="w-4 h-4 text-white/50" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-glass px-3 py-2 text-sm text-white/90"
              >
                <option value="updated">Last Updated</option>
                <option value="created">Date Created</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Projects */}
      <div className={compact ? "glass-card border border-white/20 rounded-xl overflow-hidden" : "space-y-4"}>
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} compact={compact} />
        ))}
      </div>

      {filteredProjects.length === 0 && projects.length > 0 && (
        <div className="text-center py-12">
          <p className="text-white/60">No projects match your current filters.</p>
        </div>
      )}
    </div>
  )
}