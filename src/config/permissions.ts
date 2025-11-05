// Admin users with full access to all pages
export const ADMIN_EMAILS = [
  'mark.hinojosa@therealbrokerage.com',
  'taylor.potter@therealbrokerage.com',
  'jenna.rozenblat@therealbrokerage.com',
  'guru.jorepalli@therealbrokerage.com',
  'akash.bawa@therealbrokerage.com',
  'nanda.anumolu@therealbrokerage.com',
  'rahul.dasari@therealbrokerage.com',
  'sreekanth.pogula@therealbrokerage.com',
  'soham.nehra@therealbrokerage.com',
  // Add more admin emails here
]

// Page access levels
export type UserRole = 'admin' | 'user'

export interface PageAccess {
  path: string
  label: string
  allowedRoles: UserRole[]
}

// Define which pages are accessible to which roles
// Note: Order matters - this is the order they appear in the sidebar
export const PAGE_ACCESS: PageAccess[] = [
  { path: '/', label: 'Home', allowedRoles: ['admin'] }, // Admin only
  { path: '/tasks', label: 'Tasks', allowedRoles: ['admin', 'user'] },
  { path: '/projects', label: 'Projects', allowedRoles: ['admin', 'user'] },
  { path: '/metrics', label: 'Metrics', allowedRoles: ['admin'] },
  { path: '/automations', label: 'Control Panel', allowedRoles: ['admin'] }, // Admin only - sensitive!
  { path: '/tools', label: 'Tools', allowedRoles: ['admin'] },
  { path: '/request', label: 'New Request', allowedRoles: ['admin', 'user'] }, // Always last
]

// Check if user is admin
export function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

// Get user role
export function getUserRole(email: string): UserRole {
  return isAdmin(email) ? 'admin' : 'user'
}

// Check if user has access to a page
export function hasPageAccess(userEmail: string, pagePath: string): boolean {
  const role = getUserRole(userEmail)
  const page = PAGE_ACCESS.find(p => p.path === pagePath)
  
  if (!page) return false
  return page.allowedRoles.includes(role)
}

// Get accessible pages for a user
export function getAccessiblePages(userEmail: string): PageAccess[] {
  const role = getUserRole(userEmail)
  return PAGE_ACCESS.filter(page => page.allowedRoles.includes(role))
}

