import React, { useState, useEffect, useRef, useCallback } from "react"
import { ArrowLeft, ChevronDown, ChevronRight, Search, Users, FolderKanban, Loader2, X } from "lucide-react"
import { youTrackService } from "../services/youtrack"
import type { Ticket } from "../types"

interface SelectedProject {
  id: string
  summary: string
  initiative?: string | null
}

interface ProjectPickerProps {
  value: SelectedProject | null
  onChange: (project: SelectedProject | null) => void
  error?: string
}

type GroupMode = "initiative" | "requester"

function getStateClasses(stateName: string): string {
  const mapping: Record<string, string> = {
    "Open": "bg-status-todo/10 text-status-todo",
    "To Do": "bg-status-todo/10 text-status-todo",
    "In Progress": "bg-status-progress/10 text-status-progress",
    "Done": "bg-status-done/10 text-status-done",
    "Completed": "bg-status-done/10 text-status-done",
    "Needs Scoping": "bg-status-scoping/10 text-status-scoping",
  }
  return mapping[stateName] || "bg-breeze-500/10 text-breeze-800"
}

function groupTickets(tickets: Ticket[], mode: GroupMode): Map<string, Ticket[]> {
  const groups = new Map<string, Ticket[]>()

  for (const ticket of tickets) {
    const key =
      mode === "initiative"
        ? ticket.initiative || "No Initiative"
        : ticket.requestor?.name || "Unknown"

    const list = groups.get(key) || []
    list.push(ticket)
    groups.set(key, list)
  }

  return new Map(
    [...groups.entries()].sort(([a], [b]) => {
      if (a === "No Initiative" || a === "Unknown") return 1
      if (b === "No Initiative" || b === "Unknown") return -1
      return a.localeCompare(b)
    })
  )
}

function TicketRow({ ticket, onSelect }: { ticket: Ticket; onSelect: (t: Ticket) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(ticket)}
      className="w-full text-left px-3 py-2.5 hover:bg-ocean-50 transition-colors border-b border-breeze-100 last:border-b-0"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono font-medium text-ocean-600 flex-shrink-0">
          {ticket.idReadable}
        </span>
        <span
          className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0 ${getStateClasses(
            ticket.state.name
          )}`}
        >
          {ticket.state.name}
        </span>
      </div>
      <p className="text-sm text-breeze-700 mt-0.5 line-clamp-2">
        {ticket.summary}
      </p>
    </button>
  )
}

export function ProjectPicker({ value, onChange, error }: ProjectPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [groupMode, setGroupMode] = useState<GroupMode>("initiative")
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const response = await youTrackService.getProjectIssues()

      if (cancelled) return

      if (response.data && Array.isArray(response.data)) {
        const transformed = response.data.map((issue) =>
          youTrackService.transformIssueToTicket(issue)
        )
        setTickets(transformed)
      }
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setActiveGroup(null)
        setSearchQuery("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = useCallback(
    (ticket: Ticket) => {
      onChange({ id: ticket.idReadable, summary: ticket.summary, initiative: ticket.initiative })
      setIsOpen(false)
      setActiveGroup(null)
      setSearchQuery("")
    },
    [onChange]
  )

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange(null)
    },
    [onChange]
  )

  const handleBack = useCallback(() => {
    setActiveGroup(null)
    setSearchQuery("")
  }, [])

  const groups = groupTickets(tickets, groupMode)

  const activeTickets = activeGroup ? groups.get(activeGroup) || [] : []

  const q = searchQuery.trim().toLowerCase()
  const hasQuery = q.length > 0

  // When at top level with a query, first try filtering group names
  const filteredGroupEntries = hasQuery && !activeGroup
    ? [...groups.entries()].filter(([key]) => key.toLowerCase().includes(q))
    : null

  // If no group names match, fall back to flat ticket search
  const showFlatSearch = hasQuery && !activeGroup && filteredGroupEntries !== null && filteredGroupEntries.length === 0
  const flatSearchResults = showFlatSearch
    ? tickets.filter(
        (t) =>
          t.idReadable.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q)
      )
    : []

  // When drilled into a group, filter tickets within it
  const drilledFilteredTickets = activeGroup && hasQuery
    ? activeTickets.filter(
        (t) =>
          t.idReadable.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q)
      )
    : null

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
          if (isOpen) {
            setActiveGroup(null)
            setSearchQuery("")
          }
        }}
        className={`input-glass w-full text-left flex items-center justify-between text-breeze-800 ${
          error ? "border-red-400 ring-1 ring-red-400" : ""
        }`}
      >
        <span className={value ? "text-breeze-800 truncate" : "text-breeze-500"}>
          {value ? `${value.id} - ${value.summary}` : "Select an existing project..."}
        </span>
        <span className="flex items-center space-x-1 flex-shrink-0">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => { if (e.key === "Enter") handleClear(e as unknown as React.MouseEvent) }}
              className="p-0.5 rounded hover:bg-breeze-300 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-breeze-500" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-breeze-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-xl border border-breeze-300 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-ocean-500 animate-spin" />
              <span className="ml-2 text-sm text-breeze-600">Loading projects...</span>
            </div>
          ) : (
            <>
              {/* Header: back button when drilled in, search + tabs otherwise */}
              <div className="p-2 border-b border-breeze-200 space-y-2">
                {activeGroup ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center space-x-2 text-sm font-medium text-ocean-600 hover:text-ocean-700 transition-colors w-full py-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{activeGroup}</span>
                    <span className="text-breeze-400 font-normal">({activeTickets.length})</span>
                  </button>
                ) : (
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => { setGroupMode("initiative"); setActiveGroup(null); setSearchQuery("") }}
                      className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                        groupMode === "initiative"
                          ? "bg-ocean-500 text-white"
                          : "bg-breeze-100 text-breeze-600 hover:bg-breeze-200"
                      }`}
                    >
                      <FolderKanban className="w-3 h-3" />
                      <span>By Initiative</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setGroupMode("requester"); setActiveGroup(null); setSearchQuery("") }}
                      className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                        groupMode === "requester"
                          ? "bg-ocean-500 text-white"
                          : "bg-breeze-100 text-breeze-600 hover:bg-breeze-200"
                      }`}
                    >
                      <Users className="w-3 h-3" />
                      <span>By Requester</span>
                    </button>
                  </div>
                )}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-breeze-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={activeGroup ? "Search in this group..." : "Search projects..."}
                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-breeze-200 focus:border-ocean-400 focus:ring-1 focus:ring-ocean-400 outline-none text-breeze-800 placeholder-breeze-400"
                  />
                </div>
              </div>

              {/* Content area */}
              <div className="max-h-72 overflow-y-auto">
                {showFlatSearch ? (
                  /* No group names matched -- show flat ticket results */
                  flatSearchResults.length === 0 ? (
                    <div className="py-6 text-center text-sm text-breeze-500">
                      No projects match &ldquo;{searchQuery}&rdquo;
                    </div>
                  ) : (
                    flatSearchResults.map((ticket) => (
                      <TicketRow key={ticket.idReadable} ticket={ticket} onSelect={handleSelect} />
                    ))
                  )
                ) : activeGroup ? (
                  /* Drilled-in: show tickets for the selected group */
                  (() => {
                    const ticketsToShow = drilledFilteredTickets || activeTickets
                    return ticketsToShow.length === 0 ? (
                      <div className="py-6 text-center text-sm text-breeze-500">
                        No matching projects
                      </div>
                    ) : (
                      ticketsToShow.map((ticket) => (
                        <TicketRow key={ticket.idReadable} ticket={ticket} onSelect={handleSelect} />
                      ))
                    )
                  })()
                ) : (
                  /* Top level: show group list */
                  (() => {
                    const displayGroups = filteredGroupEntries || [...groups.entries()]
                    return displayGroups.length === 0 ? (
                      <div className="py-6 text-center text-sm text-breeze-500">
                        No groups found
                      </div>
                    ) : (
                      displayGroups.map(([groupName, groupItems]) => (
                        <button
                          key={groupName}
                          type="button"
                          onClick={() => { setActiveGroup(groupName); setSearchQuery("") }}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-breeze-700 hover:bg-ocean-50 transition-colors border-b border-breeze-100 last:border-b-0"
                        >
                          <span className="font-medium">{groupName}</span>
                          <span className="flex items-center space-x-1.5">
                            <span className="text-xs text-breeze-400">{groupItems.length}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-breeze-400" />
                          </span>
                        </button>
                      ))
                    )
                  })()
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
