import type { Ticket, DashboardStats, ChartData, TimeSeriesData, User, Project } from "../types"

export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b3c5?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
  }
]

export const mockProjects: Project[] = [
  {
    id: "1",
    name: "Web Application",
    shortName: "WEB",
    description: "Main web application project"
  },
  {
    id: "2",
    name: "Mobile App",
    shortName: "MOB",
    description: "Mobile application for iOS and Android"
  },
  {
    id: "3",
    name: "API Services",
    shortName: "API",
    description: "Backend API services"
  }
]

export const mockTickets: Ticket[] = [
  {
    id: "1",
    idReadable: "WEB-101",
    summary: "Fix login page styling issues",
    description: "The login page has several CSS issues that need to be addressed for better user experience.",
    project: mockProjects[0],
    reporter: mockUsers[0],
    assignee: mockUsers[1],
    priority: { id: "1", name: "High", color: "#ef4444" },
    state: { id: "1", name: "In Progress", resolved: false },
    type: { id: "1", name: "Bug", color: "#f59e0b" },
    created: Date.now() - 86400000 * 2, // 2 days ago
    updated: Date.now() - 3600000, // 1 hour ago
    tags: ["frontend", "css", "urgent"],
    comments: [],
    attachments: []
  },
  {
    id: "2",
    idReadable: "WEB-102",
    summary: "Implement dark mode toggle",
    description: "Add a dark mode toggle to the application settings.",
    project: mockProjects[0],
    reporter: mockUsers[1],
    assignee: mockUsers[2],
    priority: { id: "2", name: "Medium", color: "#f59e0b" },
    state: { id: "2", name: "Open", resolved: false },
    type: { id: "2", name: "Feature", color: "#10b981" },
    created: Date.now() - 86400000 * 5, // 5 days ago
    updated: Date.now() - 7200000, // 2 hours ago
    tags: ["frontend", "ui", "enhancement"],
    comments: [],
    attachments: []
  },
  {
    id: "3",
    idReadable: "MOB-201",
    summary: "App crashes on iOS 17",
    description: "The mobile app crashes when opening on iOS 17 devices.",
    project: mockProjects[1],
    reporter: mockUsers[2],
    assignee: mockUsers[0],
    priority: { id: "1", name: "High", color: "#ef4444" },
    state: { id: "3", name: "Resolved", resolved: true },
    type: { id: "1", name: "Bug", color: "#f59e0b" },
    created: Date.now() - 86400000 * 7, // 7 days ago
    updated: Date.now() - 86400000, // 1 day ago
    resolved: Date.now() - 86400000, // 1 day ago
    tags: ["mobile", "ios", "crash"],
    comments: [],
    attachments: []
  },
  {
    id: "4",
    idReadable: "API-301",
    summary: "Add rate limiting to authentication endpoints",
    description: "Implement rate limiting for login and registration endpoints to prevent abuse.",
    project: mockProjects[2],
    reporter: mockUsers[0],
    assignee: mockUsers[1],
    priority: { id: "2", name: "Medium", color: "#f59e0b" },
    state: { id: "2", name: "Open", resolved: false },
    type: { id: "3", name: "Task", color: "#6366f1" },
    created: Date.now() - 86400000 * 3, // 3 days ago
    updated: Date.now() - 1800000, // 30 minutes ago
    tags: ["backend", "security", "api"],
    comments: [],
    attachments: []
  },
  {
    id: "5",
    idReadable: "WEB-103",
    summary: "Optimize image loading performance",
    description: "Images are loading slowly on the dashboard. Need to implement lazy loading and optimization.",
    project: mockProjects[0],
    reporter: mockUsers[2],
    assignee: mockUsers[0],
    priority: { id: "3", name: "Low", color: "#6b7280" },
    state: { id: "1", name: "In Progress", resolved: false },
    type: { id: "4", name: "Improvement", color: "#8b5cf6" },
    created: Date.now() - 86400000 * 4, // 4 days ago
    updated: Date.now() - 900000, // 15 minutes ago
    tags: ["frontend", "performance", "images"],
    comments: [],
    attachments: []
  }
]

export const mockDashboardStats: DashboardStats = {
  totalTickets: mockTickets.length,
  openTickets: mockTickets.filter(t => !t.state.resolved).length,
  resolvedTickets: mockTickets.filter(t => t.state.resolved).length,
  myTickets: mockTickets.filter(t => t.assignee?.id === "1").length,
  overdueTickets: 2
}

export const mockPriorityData: ChartData[] = [
  { name: "Urgent", value: 2, color: "#dc2626" },
  { name: "High", value: 2, color: "#ef4444" },
  { name: "Medium", value: 2, color: "#f59e0b" },
  { name: "TBD", value: 1, color: "#8b5cf6" }
]

export const mockStatusData: ChartData[] = [
  { name: "Open", value: 2, color: "#3b82f6" },
  { name: "In Progress", value: 2, color: "#f59e0b" },
  { name: "Resolved", value: 1, color: "#10b981" }
]

export const mockTimeSeriesData: TimeSeriesData[] = [
  { date: "2024-01-01", created: 3, resolved: 1 },
  { date: "2024-01-02", created: 2, resolved: 2 },
  { date: "2024-01-03", created: 4, resolved: 1 },
  { date: "2024-01-04", created: 1, resolved: 3 },
  { date: "2024-01-05", created: 3, resolved: 2 },
  { date: "2024-01-06", created: 2, resolved: 4 },
  { date: "2024-01-07", created: 5, resolved: 1 }
]
