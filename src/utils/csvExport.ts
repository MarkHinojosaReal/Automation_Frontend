import type { Ticket } from "../types"

function csvEscape(value: string | number | null | undefined): string {
  const str = String(value ?? "")
  if (/[",\n\r]/.test(str)) return '"' + str.replace(/"/g, '""') + '"'
  return str
}

function normalizePriority(name: string): string {
  return name.replace(/^\d+\s*-\s*/, "")
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function exportProjectsToCsv(projects: Ticket[]): void {
  const headers = [
    "Issue ID",
    "Summary",
    "Status",
    "Priority",
    "Assignee",
    "Initiative",
    "Reporter",
    "Created",
    "Updated",
  ]

  const rows = projects.map((p) => [
    csvEscape(p.idReadable),
    csvEscape(p.summary),
    csvEscape(p.state.name),
    csvEscape(normalizePriority(p.priority.name)),
    csvEscape(p.assignee?.name ?? "Unassigned"),
    csvEscape(p.initiative ?? ""),
    csvEscape(p.requestor?.name ?? p.reporter.name),
    csvEscape(formatDate(p.created)),
    csvEscape(formatDate(p.updated)),
  ])

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const date = new Date().toISOString().slice(0, 10)
  const a = document.createElement("a")
  a.href = url
  a.download = `projects-export-${date}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
