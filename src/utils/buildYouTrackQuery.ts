export interface YouTrackFilterState {
  selectedStates: string[]
  stateFilterMode: "include" | "exclude"
  selectedPriorities: string[]
  priorityFilterMode: "include" | "exclude"
  selectedRequestors: string[]
  requestorFilterMode: "include" | "exclude"
  requestorLoginMap: Record<string, string>
  selectedAssignees: string[]
  assigneeFilterMode: "include" | "exclude"
  assigneeLoginMap: Record<string, string>
  includeUnassigned: boolean
  selectedInitiatives: string[]
  initiativeFilterMode: "include" | "exclude"
  includeNoInitiative: boolean
}

function formatValue(value: string): string {
  return value.includes(' ') ? `{${value}}` : value
}

function buildClause(
  field: string,
  values: string[],
  mode: "include" | "exclude"
): string | null {
  if (values.length === 0) return null
  if (mode === "include") {
    return `${field}: ${values.map(formatValue).join(', ')}`
  }
  // Negate each value individually: state: -Done, -Archived, -{No Action}
  return `${field}: ${values.map(v => `-${formatValue(v)}`).join(', ')}`
}

function toLogin(displayName: string, loginMap: Record<string, string>): string {
  return loginMap[displayName] ?? displayName.toLowerCase().replace(/\s+/g, '.')
}

export function buildYouTrackQuery(filters: YouTrackFilterState): string {
  const clauses: string[] = ['type: Project']

  const stateClause = buildClause('state', filters.selectedStates, filters.stateFilterMode)
  if (stateClause) clauses.push(stateClause)

  const priorityClause = buildClause('priority', filters.selectedPriorities, filters.priorityFilterMode)
  if (priorityClause) clauses.push(priorityClause)

  // Requestor uses login names and lowercase field name
  const requestorLogins = filters.selectedRequestors.map(n => toLogin(n, filters.requestorLoginMap))
  const requestorClause = buildClause('requestor', requestorLogins, filters.requestorFilterMode)
  if (requestorClause) clauses.push(requestorClause)

  // Assignee uses login names; "Unassigned" is a YouTrack pseudo-value
  const assigneeLogins = filters.selectedAssignees.map(n => toLogin(n, filters.assigneeLoginMap))
  const assigneeValues = filters.includeUnassigned ? [...assigneeLogins, 'Unassigned'] : assigneeLogins
  const assigneeClause = buildClause('assignee', assigneeValues, filters.assigneeFilterMode)
  if (assigneeClause) clauses.push(assigneeClause)

  // includeNoInitiative has no reliable YouTrack query equivalent; named values only
  const initiativeClause = buildClause('Initiative', filters.selectedInitiatives, filters.initiativeFilterMode)
  if (initiativeClause) clauses.push(initiativeClause)

  return clauses.join(' ')
}

export function buildYouTrackUrl(filters: YouTrackFilterState): string {
  const youtrackBase = import.meta.env.VITE_YOUTRACK_BASE_URL || 'https://realbrokerage.youtrack.cloud'
  const query = buildYouTrackQuery(filters)
  return `${youtrackBase}/projects/ATOP/issues?q=${encodeURIComponent(query)}`
}
