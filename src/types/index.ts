export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Project {
  id: string
  name: string
  shortName: string
  description?: string
}

export interface TicketPriority {
  id: string
  name: string
  color: string
}

export interface TicketState {
  id: string
  name: string
  resolved: boolean
}

export interface TicketType {
  id: string
  name: string
  color: string
}

export interface Ticket {
  id: string
  idReadable: string
  summary: string
  description?: string
  project: Project
  reporter: User
  requestor?: User | null
  assignee?: User
  priority: TicketPriority
  state: TicketState
  type: TicketType
  initiative?: string | null
  created: number
  updated: number
  resolved?: number
  tags: string[]
  comments: Comment[]
  attachments: Attachment[]
}

export interface Comment {
  id: string
  text: string
  author: User
  created: number
  updated?: number
}

export interface Attachment {
  id: string
  name: string
  url: string
  size: number
  mimeType: string
}

export interface DashboardStats {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  myTickets: number
  overdueTickets: number
}

export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface TimeSeriesData {
  date: string
  created: number
  resolved: number
}
