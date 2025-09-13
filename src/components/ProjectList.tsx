import React, { useState } from "react"
import { ProjectCard } from "./ProjectCard"
import { Search, Filter, SortAsc, ArrowUpDown } from "lucide-react"
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
  const [requestorFilter, setRequestorFilter] = useState("all")
  const [initiativeFilter, setInitiativeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("updated")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Extract unique values from projects for dynamic filters
  const uniqueStates = Array.from(new Set(projects.map(project => project.state.name))).sort()
  const uniquePriorities = Array.from(new Set(projects.map(project => project.priority.name))).sort()
  const uniqueRequestors = Array.from(new Set(projects.map(project => project.requestor?.name || project.reporter.name))).sort()
  const uniqueInitiatives = Array.from(new Set(projects.filter(project => project.initiative).map(project => project.initiative!))).sort()

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.idReadable.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ((project.requestor?.name || project.reporter.name) && (project.requestor?.name || project.reporter.name).toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesState = stateFilter === "all" || project.state.name === stateFilter
      const matchesPriority = priorityFilter === "all" || project.priority.name === priorityFilter
      const matchesRequestor = requestorFilter === "all" || (project.requestor?.name || project.reporter.name) === requestorFilter
      const matchesInitiative = initiativeFilter === "all" ||
                               (initiativeFilter === "none" && !project.initiative) ||
                               (project.initiative && project.initiative === initiativeFilter)
      
      return matchesSearch && matchesState && matchesPriority && matchesRequestor && matchesInitiative
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "created":
          comparison = Number(a.created) - Number(b.created)
          break
        case "updated":
          comparison = Number(a.updated) - Number(b.updated)
          break
        case "priority":
          const priorityOrder = { "Urgent": 5, "High": 4, "Medium": 3, "Low": 2, "TBD": 1 }
          
          // Normalize priority names to match our order mapping
          const normalizePriority = (priorityName: string): string => {
            if (priorityName === '0 - Urgent') return 'Urgent'
            if (priorityName === '1 - High') return 'High'
            if (priorityName === '2 - Medium') return 'Medium'
            if (priorityName === '3 - Low') return 'Low'
            if (priorityName === 'TBD') return 'TBD'
            // Remove any number prefix pattern like "4 - Something" -> "Something"
            return priorityName.replace(/^\d+\s*-\s*/, '')
          }
          
          const normalizedA = normalizePriority(a.priority.name)
          const normalizedB = normalizePriority(b.priority.name)
          
          comparison = (priorityOrder[normalizedA as keyof typeof priorityOrder] || 0) - 
                      (priorityOrder[normalizedB as keyof typeof priorityOrder] || 0)
          break
        default:
          comparison = a.updated - b.updated
      }
      
      return sortOrder === "desc" ? -comparison : comparison
    })

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-breeze-600">No projects found.</p>
      </div>
    )
  }

  return (
    <div>
      {showFilters && (
        <div className="mb-6 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-breeze-500" />
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="input-glass px-3 py-2 text-sm text-breeze-800"
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
              className="input-glass px-3 py-2 text-sm text-breeze-800"
            >
              <option value="all">All Priorities</option>
              {uniquePriorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>


            <select
              value={requestorFilter}
              onChange={(e) => setRequestorFilter(e.target.value)}
              className="input-glass px-3 py-2 text-sm text-breeze-800"
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
                className="input-glass px-3 py-2 text-sm text-breeze-800"
              >
                <option value="all">All Initiatives</option>
                <option value="none">No Initiative</option>
                {uniqueInitiatives.map(initiative => (
                  <option key={initiative} value={initiative}>{initiative}</option>
                ))}
              </select>
            )}

            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-breeze-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-glass px-3 py-2 text-sm text-breeze-800"
              >
                <option value="updated">Last Updated</option>
                <option value="created">Date Created</option>
                <option value="priority">Priority</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="input-glass px-3 py-2 text-sm text-breeze-800"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-breeze-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects, requestors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-glass pl-10 pr-4 w-full text-breeze-800 placeholder-breeze-500"
            />
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
          <p className="text-breeze-600">No projects match your current filters.</p>
        </div>
      )}
    </div>
  )
}