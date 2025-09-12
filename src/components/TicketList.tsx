import React, { useState } from "react"
import { TicketCard } from "./TicketCard"
import { Search, Filter, SortAsc, ArrowUpDown } from "lucide-react"
import type { Ticket } from "../types"

interface TicketListProps {
  tickets: Ticket[]
  compact?: boolean
  showFilters?: boolean
}

export function TicketList({ tickets, compact = false, showFilters = false }: TicketListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [stateFilter, setStateFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("updated")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Extract unique values from tickets for dynamic filters
  const uniqueStates = Array.from(new Set(tickets.map(ticket => ticket.state.name))).sort()
  const uniquePriorities = Array.from(new Set(tickets.map(ticket => ticket.priority.name))).sort()
  const uniqueAssignees = Array.from(new Set(tickets.filter(ticket => ticket.assignee).map(ticket => ticket.assignee!.name))).sort()

  const filteredTickets = tickets
    .filter(ticket => {
      const matchesSearch = ticket.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.idReadable.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesState = stateFilter === "all" || ticket.state.name === stateFilter
      const matchesPriority = priorityFilter === "all" || ticket.priority.name === priorityFilter
      const matchesAssignee = assigneeFilter === "all" || 
                             (assigneeFilter === "unassigned" && !ticket.assignee) ||
                             (ticket.assignee && ticket.assignee.name === assigneeFilter)
      
      return matchesSearch && matchesState && matchesPriority && matchesAssignee
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "created":
          comparison = a.created - b.created
          break
        case "updated":
          comparison = a.updated - b.updated
          break
        case "priority":
          const priorityOrder = { "Urgent": 5, "High": 4, "Medium": 3, "Low": 2, "TBD": 1 }
          comparison = (priorityOrder[a.priority.name as keyof typeof priorityOrder] || 0) - 
                      (priorityOrder[b.priority.name as keyof typeof priorityOrder] || 0)
          break
        default:
          comparison = a.updated - b.updated
      }
      
      return sortOrder === "desc" ? -comparison : comparison
    })

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">No tasks found.</p>
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
              placeholder="Search tasks..."
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

            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-white/50" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-glass px-3 py-2 text-sm text-white/90"
              >
                <option value="updated">Last Updated</option>
                <option value="created">Date Created</option>
                <option value="priority">Priority</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="input-glass px-3 py-2 text-sm text-white/90"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tickets */}
      <div className={compact ? "glass-card border border-white/20 rounded-xl overflow-hidden" : "space-y-4"}>
        {filteredTickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} compact={compact} />
        ))}
      </div>

      {filteredTickets.length === 0 && tickets.length > 0 && (
        <div className="text-center py-12">
          <p className="text-white/60">No tasks match your current filters.</p>
        </div>
      )}
    </div>
  )
}
