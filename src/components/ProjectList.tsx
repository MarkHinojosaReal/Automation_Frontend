import React, { useState } from "react"
import { ProjectCard } from "./ProjectCard"
import { Search, Filter, SortAsc, ArrowUpDown, X, SlidersHorizontal, ChevronDown } from "lucide-react"
import type { Ticket } from "../types"

interface ProjectListProps {
  projects: Ticket[]
  compact?: boolean
  showFilters?: boolean
}

export function ProjectList({ projects, compact = false, showFilters = false }: ProjectListProps) {
  const [showFilterSidebar, setShowFilterSidebar] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [stateFilterMode, setStateFilterMode] = useState<"include" | "exclude">("include")
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  const [priorityFilterMode, setPriorityFilterMode] = useState<"include" | "exclude">("include")
  const [selectedRequestors, setSelectedRequestors] = useState<string[]>([])
  const [requestorFilterMode, setRequestorFilterMode] = useState<"include" | "exclude">("include")
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [assigneeFilterMode, setAssigneeFilterMode] = useState<"include" | "exclude">("include")
  const [includeUnassigned, setIncludeUnassigned] = useState(false)
  const [selectedInitiatives, setSelectedInitiatives] = useState<string[]>([])
  const [initiativeFilterMode, setInitiativeFilterMode] = useState<"include" | "exclude">("include")
  const [includeNoInitiative, setIncludeNoInitiative] = useState(false)
  const [sortBy, setSortBy] = useState("updated")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  // Collapsible filter sections
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set())
  
  const toggleFilterSection = (filterName: string) => {
    setExpandedFilters(prev => {
      const newSet = new Set(prev)
      if (newSet.has(filterName)) {
        newSet.delete(filterName)
      } else {
        newSet.add(filterName)
      }
      return newSet
    })
  }

  // Extract unique values from projects for dynamic filters
  const uniqueStates = Array.from(new Set(projects.map(project => project.state.name))).sort()
  const uniquePriorities = Array.from(new Set(projects.map(project => project.priority.name))).sort()
  const uniqueRequestors = Array.from(new Set(projects.map(project => project.requestor?.name || project.reporter.name))).sort()
  const uniqueAssignees = Array.from(new Set(projects.filter(project => project.assignee).map(project => project.assignee!.name))).sort()
  const uniqueInitiatives = Array.from(new Set(projects.filter(project => project.initiative).map(project => project.initiative!))).sort()

  // Toggle functions
  const toggleState = (state: string) => {
    setSelectedStates(prev => 
      prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]
    )
  }

  const togglePriority = (priority: string) => {
    setSelectedPriorities(prev =>
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    )
  }

  const toggleRequestor = (requestor: string) => {
    setSelectedRequestors(prev =>
      prev.includes(requestor) ? prev.filter(r => r !== requestor) : [...prev, requestor]
    )
  }

  const toggleAssignee = (assignee: string) => {
    setSelectedAssignees(prev =>
      prev.includes(assignee) ? prev.filter(a => a !== assignee) : [...prev, assignee]
    )
  }

  const toggleInitiative = (initiative: string) => {
    setSelectedInitiatives(prev =>
      prev.includes(initiative) ? prev.filter(i => i !== initiative) : [...prev, initiative]
    )
  }

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.idReadable.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ((project.requestor?.name || project.reporter.name) && (project.requestor?.name || project.reporter.name).toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (project.assignee?.name && project.assignee.name.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // State filter logic based on mode
      let matchesState = true
      if (selectedStates.length > 0) {
        if (stateFilterMode === "include") {
          matchesState = selectedStates.includes(project.state.name)
        } else {
          matchesState = !selectedStates.includes(project.state.name)
        }
      }
      
      // Priority filter logic based on mode
      let matchesPriority = true
      if (selectedPriorities.length > 0) {
        if (priorityFilterMode === "include") {
          matchesPriority = selectedPriorities.includes(project.priority.name)
        } else {
          matchesPriority = !selectedPriorities.includes(project.priority.name)
        }
      }
      
      // Requestor filter logic based on mode
      let matchesRequestor = true
      if (selectedRequestors.length > 0) {
        const projectRequestor = project.requestor?.name || project.reporter.name
        if (requestorFilterMode === "include") {
          matchesRequestor = selectedRequestors.includes(projectRequestor)
        } else {
          matchesRequestor = !selectedRequestors.includes(projectRequestor)
        }
      }
      
      // Assignee filter logic based on mode
      let matchesAssignee = true
      if (selectedAssignees.length > 0 || includeUnassigned) {
        const projectAssignee = project.assignee?.name || ""
        const isUnassigned = !project.assignee
        if (assigneeFilterMode === "include") {
          matchesAssignee = selectedAssignees.includes(projectAssignee) || (includeUnassigned && isUnassigned)
        } else {
          matchesAssignee = !selectedAssignees.includes(projectAssignee) && (!includeUnassigned || !isUnassigned)
        }
      }
      
      // Initiative filter logic based on mode
      let matchesInitiative = true
      if (selectedInitiatives.length > 0 || includeNoInitiative) {
        const projectInitiative = project.initiative || ""
        const hasNoInitiative = !project.initiative
        if (initiativeFilterMode === "include") {
          matchesInitiative = selectedInitiatives.includes(projectInitiative) || (includeNoInitiative && hasNoInitiative)
        } else {
          matchesInitiative = !selectedInitiatives.includes(projectInitiative) && (!includeNoInitiative || !hasNoInitiative)
        }
      }
      
      return matchesSearch && matchesState && matchesPriority && matchesRequestor && matchesAssignee && matchesInitiative
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

  const clearFilters = () => {
    setSelectedStates([])
    setStateFilterMode("include")
    setSelectedPriorities([])
    setPriorityFilterMode("include")
    setSelectedRequestors([])
    setRequestorFilterMode("include")
    setSelectedAssignees([])
    setAssigneeFilterMode("include")
    setIncludeUnassigned(false)
    setSelectedInitiatives([])
    setInitiativeFilterMode("include")
    setIncludeNoInitiative(false)
    setSortBy("updated")
    setSortOrder("desc")
    setSearchTerm("")
  }

  const activeFilterCount = [
    selectedStates.length > 0,
    selectedPriorities.length > 0,
    selectedRequestors.length > 0,
    selectedAssignees.length > 0 || includeUnassigned,
    selectedInitiatives.length > 0 || includeNoInitiative,
    searchTerm !== ""
  ].filter(Boolean).length

  return (
    <div className="relative">
      {showFilters && (
        <>
          {/* Filter Toggle Button & Search Bar */}
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => setShowFilterSidebar(!showFilterSidebar)}
              className="bg-ocean-500 hover:bg-ocean-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 whitespace-nowrap focus:outline-none focus:ring-0 shadow-none hover:shadow-none"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-breeze-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects, requestors, assignees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-glass pl-10 pr-4 w-full text-breeze-800 placeholder-breeze-500"
              />
            </div>
          </div>

          {/* Filter Sidebar Overlay */}
          {showFilterSidebar && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowFilterSidebar(false)}
              />
              
              {/* Sidebar */}
              <div className="fixed left-0 top-0 h-full w-80 bg-gradient-to-br from-breeze-100 via-ocean-50 to-accent-50 shadow-2xl z-50 overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-ocean-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    <h3 className="font-semibold text-lg">Filters</h3>
                    {activeFilterCount > 0 && (
                      <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">
                        {activeFilterCount} active
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowFilterSidebar(false)}
                    className="hover:bg-white/20 p-1 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Filter Content */}
                <div className="p-4 space-y-6">
                  {/* Clear All Button */}
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-700 rounded text-xs font-medium transition-colors flex items-center space-x-1.5"
                    >
                      <X className="w-3 h-3" />
                      <span>Clear Filters</span>
                    </button>
                  )}

                  {/* State Filter Mode Toggle */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-breeze-700">State Mode:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setStateFilterMode("include")}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          stateFilterMode === "include"
                            ? "bg-green-500 text-white"
                            : "bg-white/60 text-breeze-600 hover:bg-white/80"
                        }`}
                      >
                        Include
                      </button>
                      <button
                        onClick={() => setStateFilterMode("exclude")}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          stateFilterMode === "exclude"
                            ? "bg-red-500 text-white"
                            : "bg-white/60 text-breeze-600 hover:bg-white/80"
                        }`}
                      >
                        Exclude
                      </button>
                    </div>
                  </div>

                  {/* State Filter */}
                  <div className="space-y-2">
                    <div 
                      className="flex items-center space-x-2 cursor-pointer hover:bg-white/10 p-2 rounded transition-colors"
                      onClick={() => toggleFilterSection('state')}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.has('state') ? 'rotate-0' : '-rotate-90'}`} />
                      <span className="text-sm font-semibold text-breeze-800">State</span>
                      {selectedStates.length > 0 && (
                        <span className="text-xs bg-ocean-500/30 px-2 py-0.5 rounded-full">
                          {selectedStates.length}
                        </span>
                      )}
                    </div>
                    {expandedFilters.has('state') && (
                      <div className="bg-white/30 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {uniqueStates.map(state => (
                          <label
                            key={state}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-1 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStates.includes(state)}
                              onChange={() => toggleState(state)}
                              className="w-4 h-4 text-ocean-600 focus:ring-ocean-500 border-gray-300 rounded cursor-pointer"
                            />
                            <span className="text-sm text-breeze-800">{state}</span>
                          </label>
                        ))}
                      </div>
                    )}
            </div>

                  {/* Priority Filter Mode Toggle */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-breeze-700">Priority Mode:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPriorityFilterMode("include")}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          priorityFilterMode === "include"
                            ? "bg-green-500 text-white"
                            : "bg-white/60 text-breeze-600 hover:bg-white/80"
                        }`}
                      >
                        Include
                      </button>
                      <button
                        onClick={() => setPriorityFilterMode("exclude")}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          priorityFilterMode === "exclude"
                            ? "bg-red-500 text-white"
                            : "bg-white/60 text-breeze-600 hover:bg-white/80"
                        }`}
                      >
                        Exclude
                      </button>
                    </div>
                  </div>

                  {/* Priority Filter */}
                  <div className="space-y-2">
                    <div 
                      className="flex items-center space-x-2 cursor-pointer hover:bg-white/10 p-2 rounded transition-colors"
                      onClick={() => toggleFilterSection('priority')}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.has('priority') ? 'rotate-0' : '-rotate-90'}`} />
                      <span className="text-sm font-semibold text-breeze-800">Priority</span>
                      {selectedPriorities.length > 0 && (
                        <span className="text-xs bg-ocean-500/30 px-2 py-0.5 rounded-full">
                          {selectedPriorities.length}
                        </span>
                      )}
                    </div>
                    {expandedFilters.has('priority') && (
                      <div className="bg-white/30 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {uniquePriorities.map(priority => (
                          <label
                            key={priority}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-1 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPriorities.includes(priority)}
                              onChange={() => togglePriority(priority)}
                              className="w-4 h-4 text-ocean-600 focus:ring-ocean-500 border-gray-300 rounded cursor-pointer"
                            />
                            <span className="text-sm text-breeze-800">{priority}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Requestor Filter Mode Toggle */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-breeze-700">Requestor Mode:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setRequestorFilterMode("include")}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          requestorFilterMode === "include"
                            ? "bg-green-500 text-white"
                            : "bg-white/60 text-breeze-600 hover:bg-white/80"
                        }`}
                      >
                        Include
                      </button>
                      <button
                        onClick={() => setRequestorFilterMode("exclude")}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          requestorFilterMode === "exclude"
                            ? "bg-red-500 text-white"
                            : "bg-white/60 text-breeze-600 hover:bg-white/80"
                        }`}
                      >
                        Exclude
                      </button>
                    </div>
                  </div>

                  {/* Requestor Filter */}
                  <div className="space-y-2">
                    <div 
                      className="flex items-center space-x-2 cursor-pointer hover:bg-white/10 p-2 rounded transition-colors"
                      onClick={() => toggleFilterSection('requestor')}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.has('requestor') ? 'rotate-0' : '-rotate-90'}`} />
                      <span className="text-sm font-semibold text-breeze-800">Requestor</span>
                      {selectedRequestors.length > 0 && (
                        <span className="text-xs bg-ocean-500/30 px-2 py-0.5 rounded-full">
                          {selectedRequestors.length}
                        </span>
                      )}
                    </div>
                    {expandedFilters.has('requestor') && (
                      <div className="bg-white/30 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {uniqueRequestors.map(requestor => (
                          <label
                            key={requestor}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-1 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedRequestors.includes(requestor)}
                              onChange={() => toggleRequestor(requestor)}
                              className="w-4 h-4 text-ocean-600 focus:ring-ocean-500 border-gray-300 rounded cursor-pointer"
                            />
                            <span className="text-sm text-breeze-800">{requestor}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assignee Filter Mode Toggle */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-breeze-700">Assignee Mode:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setAssigneeFilterMode("include")}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          assigneeFilterMode === "include"
                            ? "bg-green-500 text-white"
                            : "bg-white/60 text-breeze-600 hover:bg-white/80"
                        }`}
                      >
                        Include
                      </button>
                      <button
                        onClick={() => setAssigneeFilterMode("exclude")}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          assigneeFilterMode === "exclude"
                            ? "bg-red-500 text-white"
                            : "bg-white/60 text-breeze-600 hover:bg-white/80"
                        }`}
                      >
                        Exclude
                      </button>
                    </div>
                  </div>

                  {/* Assignee Filter */}
                  <div className="space-y-2">
                    <div 
                      className="flex items-center space-x-2 cursor-pointer hover:bg-white/10 p-2 rounded transition-colors"
                      onClick={() => toggleFilterSection('assignee')}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.has('assignee') ? 'rotate-0' : '-rotate-90'}`} />
                      <span className="text-sm font-semibold text-breeze-800">Assignee</span>
                      {(selectedAssignees.length > 0 || includeUnassigned) && (
                        <span className="text-xs bg-ocean-500/30 px-2 py-0.5 rounded-full">
                          {selectedAssignees.length + (includeUnassigned ? 1 : 0)}
                        </span>
                      )}
                    </div>
                    {expandedFilters.has('assignee') && (
                      <div className="bg-white/30 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-1 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={includeUnassigned}
                            onChange={() => setIncludeUnassigned(!includeUnassigned)}
                            className="w-4 h-4 text-ocean-600 focus:ring-ocean-500 border-gray-300 rounded cursor-pointer"
                          />
                          <span className="text-sm text-breeze-800 italic">Unassigned</span>
                        </label>
                        {uniqueAssignees.map(assignee => (
                          <label
                            key={assignee}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-1 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedAssignees.includes(assignee)}
                              onChange={() => toggleAssignee(assignee)}
                              className="w-4 h-4 text-ocean-600 focus:ring-ocean-500 border-gray-300 rounded cursor-pointer"
                            />
                            <span className="text-sm text-breeze-800">{assignee}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Initiative Filter */}
            {uniqueInitiatives.length > 0 && (
                    <>
                      {/* Initiative Filter Mode Toggle */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-breeze-700">Initiative Mode:</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setInitiativeFilterMode("include")}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                              initiativeFilterMode === "include"
                                ? "bg-green-500 text-white"
                                : "bg-white/60 text-breeze-600 hover:bg-white/80"
                            }`}
                          >
                            Include
                          </button>
                          <button
                            onClick={() => setInitiativeFilterMode("exclude")}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                              initiativeFilterMode === "exclude"
                                ? "bg-red-500 text-white"
                                : "bg-white/60 text-breeze-600 hover:bg-white/80"
                            }`}
                          >
                            Exclude
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div 
                          className="flex items-center space-x-2 cursor-pointer hover:bg-white/10 p-2 rounded transition-colors"
                          onClick={() => toggleFilterSection('initiative')}
                        >
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.has('initiative') ? 'rotate-0' : '-rotate-90'}`} />
                        <span className="text-sm font-semibold text-breeze-800">Initiative</span>
                        {(selectedInitiatives.length > 0 || includeNoInitiative) && (
                          <span className="text-xs bg-ocean-500/30 px-2 py-0.5 rounded-full">
                            {selectedInitiatives.length + (includeNoInitiative ? 1 : 0)}
                          </span>
                        )}
                      </div>
                      {expandedFilters.has('initiative') && (
                        <div className="bg-white/30 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                          <label className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-1 rounded transition-colors">
                            <input
                              type="checkbox"
                              checked={includeNoInitiative}
                              onChange={() => setIncludeNoInitiative(!includeNoInitiative)}
                              className="w-4 h-4 text-ocean-600 focus:ring-ocean-500 border-gray-300 rounded cursor-pointer"
                            />
                            <span className="text-sm text-breeze-800 italic">No Initiative</span>
                          </label>
                {uniqueInitiatives.map(initiative => (
                            <label
                              key={initiative}
                              className="flex items-center space-x-2 cursor-pointer hover:bg-white/20 p-1 rounded transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedInitiatives.includes(initiative)}
                                onChange={() => toggleInitiative(initiative)}
                                className="w-4 h-4 text-ocean-600 focus:ring-ocean-500 border-gray-300 rounded cursor-pointer"
                              />
                              <span className="text-sm text-breeze-800">{initiative}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      </div>
                    </>
                  )}

                  {/* Sorting */}
                  <div className="pt-4 border-t border-white/20">
                    <label className="block text-sm font-semibold text-breeze-800 mb-3">
            <div className="flex items-center space-x-2">
                        <ArrowUpDown className="w-4 h-4" />
                        <span>Sort By</span>
                      </div>
                    </label>
                    <div className="space-y-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                        className="input-glass w-full px-3 py-2 text-sm text-breeze-800"
              >
                <option value="updated">Last Updated</option>
                <option value="created">Date Created</option>
                <option value="priority">Priority</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                        className="input-glass w-full px-3 py-2 text-sm text-breeze-800"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
          
                  {/* Results Summary */}
                  <div className="pt-4 border-t border-white/20">
                    <div className="bg-white/50 rounded-lg p-3 text-sm text-breeze-700">
                      <p className="font-semibold">
                        Showing {filteredProjects.length} of {projects.length} projects
                      </p>
                    </div>
                  </div>
          </div>
        </div>
            </>
          )}
        </>
      )}

      {/* Projects */}
      <div className={compact ? "glass-card border border-white/20 rounded-xl overflow-hidden" : "space-y-4"}>
        {filteredProjects.map((project) => (
          <div key={project.id} className="w-full">
            <ProjectCard project={project} compact={compact} />
          </div>
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