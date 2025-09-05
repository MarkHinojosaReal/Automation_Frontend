interface YouTrackConfig {
  proxyUrl: string
  useProxy: boolean
}

interface YouTrackCustomField {
  name: string
  value?: {
    name: string
  }
}

interface YouTrackIssue {
  idReadable: string
  summary: string
  description?: string
  created?: number
  updated?: number
  reporter?: {
    name: string
    email?: string
  }
  assignee?: {
    name: string
    email?: string
  }
  state?: {
    name: string
  }
  customFields?: YouTrackCustomField[]
}

interface YouTrackApiResponse {
  data?: YouTrackIssue[]
  error?: string
}

class YouTrackService {
  private config: YouTrackConfig

  constructor() {
    this.config = {
      proxyUrl: process.env.GATSBY_PROXY_URL || 'https://youtrack-proxy.onrender.com',
      useProxy: true // Always use proxy for CORS handling
    }
  }

  private async makeRequest(endpoint: string, params?: Record<string, string>): Promise<YouTrackApiResponse> {
    try {
      let url: string
      
      if (this.config.useProxy) {
        // Use proxy server
        url = `${this.config.proxyUrl}/api/youtrack${endpoint}`
        if (params) {
          const searchParams = new URLSearchParams(params)
          url += `?${searchParams}`
        }
      } else {
        // Direct API call (for production with proper CORS setup)
        const youtrackBase = process.env.GATSBY_YOUTRACK_BASE_URL || 'https://realbrokerage.youtrack.cloud'
        url = `${youtrackBase}/api${endpoint}`
        if (params) {
          const searchParams = new URLSearchParams(params)
          url += `?${searchParams}`
        }
      }
      
      console.log('Fetching from:', url)

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      }

      // Only add auth header for direct API calls
      if (!this.config.useProxy) {
        const token = process.env.GATSBY_YOUTRACK_TOKEN || 'perm-bWFyay5oaW5vam9zYQ==.NTktMTU4.0k4Ad1tAdROERwu5cBfYRMdUcDS6T3'
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      return { data }
    } catch (error) {
      console.error('API Request failed:', error)
      return { 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  async getCurrentSprintIssues(): Promise<YouTrackApiResponse> {
    const agileId = process.env.GATSBY_YOUTRACK_AGILE_ID || '124-333'
    const fields = 'idReadable,summary,description,created,updated,reporter(name,email),assignee(name,email),customFields(name,value(name)),state(name)'
    
    if (this.config.useProxy) {
      return this.makeRequest('/current-sprint', { agileId, fields })
    } else {
      return this.makeRequest(`/agiles/${agileId}/sprints/current/issues`, { fields })
    }
  }

  async getAllIssues(fields: string[] = ['idReadable', 'summary', 'description', 'created', 'updated']): Promise<YouTrackApiResponse> {
    const fieldsParam = fields.join(',')
    
    if (this.config.useProxy) {
      return this.makeRequest('/issues', { fields: fieldsParam, top: '100' })
    } else {
      return this.makeRequest('/issues', { fields: fieldsParam, '$top': '100' })
    }
  }

  async getIssueById(issueId: string, fields: string[] = ['idReadable', 'summary', 'description', 'created', 'updated']): Promise<YouTrackApiResponse> {
    const fieldsParam = fields.join(',')
    
    if (this.config.useProxy) {
      return this.makeRequest(`/issues/${issueId}`, { fields: fieldsParam })
    } else {
      return this.makeRequest(`/issues/${issueId}`, { fields: fieldsParam })
    }
  }

  async getProjectCustomFieldValues(projectId: string, fieldName: string): Promise<YouTrackApiResponse> {
    try {
      if (this.config.useProxy) {
        return this.makeRequest(`/projects/${projectId}/custom-fields/${fieldName}`)
      } else {
        return this.makeRequest(`/admin/projects/${projectId}/customFields`, { 
          fields: 'id,field(id,name,fieldType(id,name)),bundle(values(name))' 
        })
      }
    } catch (error) {
      console.error('Failed to fetch custom field values:', error)
      return { error: error instanceof Error ? error.message : 'Failed to fetch custom field values' }
    }
  }

  async getCustomFieldValues(fieldName: string): Promise<YouTrackApiResponse> {
    // Use ATOP project as default
    return this.getProjectCustomFieldValues('ATOP', fieldName)
  }

  async getProjectIssues(): Promise<YouTrackApiResponse> {
    const fields = 'idReadable,summary,description,created,updated,reporter(name,email),assignee(name,email),customFields(name,value(name)),state(name)'
    const query = 'project:ATOP Type:Project' // Filter for issues with type "Project" from ATOP project only
    
    if (this.config.useProxy) {
      return this.makeRequest('/issues', { fields, query, top: '100' })
    } else {
      return this.makeRequest('/issues', { fields, query, '$top': '100' })
    }
  }

  // Transform YouTrack data to our internal format
  transformIssueToTicket(issue: YouTrackIssue): any {
    
    // Extract state from customFields
    const stateField = issue.customFields?.find(field => field.name === 'State')
    const state = stateField?.value?.name ? {
      id: stateField.value.name.toLowerCase().replace(/\s+/g, '-'),
      name: stateField.value.name,
      resolved: ['Done', 'Closed', 'Resolved', 'Finished'].includes(stateField.value.name)
    } : { id: 'open', name: 'Open', resolved: false }

    // Extract assignee from customFields
    const assigneeField = issue.customFields?.find(field => field.name === 'Assignee')
    const assignee = assigneeField?.value?.name ? {
      id: assigneeField.value.name.toLowerCase().replace(/\s+/g, '.'),
      name: assigneeField.value.name,
      email: `${assigneeField.value.name.toLowerCase().replace(/\s+/g, '.')}@therealbrokerage.com`
    } : null

    // Extract reporter from YouTrack response
    const reporter = issue.reporter ? {
      id: issue.reporter.email || issue.reporter.name.toLowerCase().replace(/\s+/g, '.'),
      name: issue.reporter.name,
      email: issue.reporter.email || `${issue.reporter.name.toLowerCase().replace(/\s+/g, '.')}@company.com`
    } : { id: 'unknown', name: 'Unknown', email: 'unknown@company.com' }

    // Extract priority from custom fields
    const priorityField = issue.customFields?.find(field => 
      field.name.toLowerCase().includes('priority')
    )
    const priority = priorityField?.value?.name ? {
      id: priorityField.value.name.toLowerCase(),
      name: priorityField.value.name,
      color: this.getPriorityColor(priorityField.value.name)
    } : { id: 'medium', name: 'Medium', color: '#f59e0b' }

    // Extract type from custom fields or default
    const typeField = issue.customFields?.find(field => 
      field.name.toLowerCase().includes('type') || field.name.toLowerCase().includes('category')
    )
    const type = typeField?.value?.name ? {
      id: typeField.value.name.toLowerCase().replace(/\s+/g, '-'),
      name: typeField.value.name,
      color: this.getTypeColor(typeField.value.name)
    } : { id: 'task', name: 'Task', color: '#6366f1' }

    // Extract initiative from custom fields
    const initiativeField = issue.customFields?.find(field => field.name === 'Initiative')
    const initiative = initiativeField?.value?.name || null

    return {
      id: issue.idReadable,
      idReadable: issue.idReadable,
      summary: issue.summary,
      description: issue.description || '',
      project: {
        id: issue.idReadable.split('-')[0],
        name: issue.idReadable.split('-')[0],
        shortName: issue.idReadable.split('-')[0]
      },
      reporter,
      assignee,
      priority,
      state,
      type,
      initiative,
      created: issue.created || Date.now(),
      updated: issue.updated || Date.now(),
      tags: [],
      comments: [],
      attachments: [],
      customFields: issue.customFields || []
    }
  }

  private getPriorityColor(priority: string): string {
    if (priority === '0 - Urgent' || priority.toLowerCase().includes('urgent')) {
      return '#dc2626'
    } else if (priority === '1 - High' || priority.toLowerCase().includes('high') || priority.toLowerCase().includes('critical')) {
      return '#ef4444'
    } else if (priority === '2 - Medium' || priority.toLowerCase().includes('medium')) {
      return '#f59e0b'
    } else if (priority === '3 - Low' || priority.toLowerCase().includes('low')) {
      return '#10b981'
    } else if (priority === 'TBD' || priority.toLowerCase().includes('tbd')) {
      return '#8b5cf6'
    } else {
      return '#06b6d4' // Default cyan color for any other priorities
    }
  }

  private getTypeColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'bug':
        return '#ef4444'
      case 'feature':
        return '#10b981'
      case 'task':
        return '#6366f1'
      case 'story':
        return '#8b5cf6'
      default:
        return '#6366f1'
    }
  }
}

export const youTrackService = new YouTrackService()
export type { YouTrackIssue, YouTrackApiResponse }
