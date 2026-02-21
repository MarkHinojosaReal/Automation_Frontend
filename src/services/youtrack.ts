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
      proxyUrl: import.meta.env.VITE_PROXY_URL || window.location.origin,
      useProxy: true // Always use proxy in this setup
    }
  }

  private async makeRequest(endpoint: string, params?: Record<string, string>, method: string = 'GET', body?: any): Promise<YouTrackApiResponse> {
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
        const youtrackBase = import.meta.env.VITE_YOUTRACK_BASE_URL || 'https://realbrokerage.youtrack.cloud'
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
        const token = import.meta.env.VITE_YOUTRACK_TOKEN || 'perm-T3Bz.NTktMTYx.pbpLPTlaXss6AQjl0F1tXn7q4Cl4a8'
        headers['Authorization'] = `Bearer ${token}`
      }

      const fetchOptions: RequestInit = {
        method,
        headers
      }

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        fetchOptions.body = JSON.stringify(body)
      }

      const response = await fetch(url, fetchOptions)

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
    const agileId = import.meta.env.VITE_YOUTRACK_AGILE_ID || '124-333'
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
      const response = await this.makeRequest(`/issues/${issueId}`, { fields: fieldsParam })
      // Handle both array responses and single issue responses
      if (response.data && !Array.isArray(response.data)) {
        return { data: response.data }
      }
      return response
    } else {
      const response = await this.makeRequest(`/issues/${issueId}`, { fields: fieldsParam })
      // Handle both array responses and single issue responses  
      if (response.data && !Array.isArray(response.data)) {
        return { data: response.data }
      }
      return response
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

  // TEMPORARY: Count Done tasks with Automation tag in ATOP project
  async getDoneAutomationTasksCount(): Promise<YouTrackApiResponse> {
    try {
      const fields = 'idReadable,summary,state(name),tags(name)'
      const query = 'project:ATOP State:Done tag:Automation'
      
      if (this.config.useProxy) {
        return this.makeRequest('/issues', { fields, query, top: '1000' })
      } else {
        return this.makeRequest('/issues', { fields, query, '$top': '1000' })
      }
    } catch (error) {
      console.error('Failed to fetch done automation tasks:', error)
      return { error: error instanceof Error ? error.message : 'Failed to fetch done automation tasks' }
    }
  }

  async getAllProjectCustomFields(projectId: string = 'ATOP'): Promise<YouTrackApiResponse> {
    try {
      if (this.config.useProxy) {
        return this.makeRequest(`/projects/${projectId}/custom-fields`)
      } else {
        return this.makeRequest(`/admin/projects/${projectId}/customFields`, { 
          fields: 'id,field(id,name,fieldType(id,name)),bundle(values(name))' 
        })
      }
    } catch (error) {
      console.error('Failed to fetch all custom fields:', error)
      return { error: error instanceof Error ? error.message : 'Failed to fetch all custom fields' }
    }
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

  async updateIssue(issueId: string, updateData: {
    summary?: string
    description?: string
  }): Promise<YouTrackApiResponse> {
    try {
      const payload: any = {}
      
      if (updateData.summary !== undefined) {
        payload.summary = updateData.summary
      }
      
      if (updateData.description !== undefined) {
        payload.description = updateData.description
      }

      console.log('Updating issue with payload:', payload)

      let result
      if (this.config.useProxy) {
        result = await this.makeRequest(`/issues/${issueId}`, {}, 'PATCH', payload)
      } else {
        result = await this.makeRequest(`/issues/${issueId}`, {}, 'POST', payload)
      }

      return result
    } catch (error) {
      console.error('Error updating issue:', error)
      return { error: error instanceof Error ? error.message : 'Failed to update issue' }
    }
  }

  async createIssue(issueData: {
    summary: string
    description: string
    project: string
    type?: string
    state?: string
    requestor?: string
    initiative?: string
    targetDate?: string
    priority?: string
    links?: Array<{ name: string; url: string }>
  }): Promise<YouTrackApiResponse> {
    try {
      const payload = {
        project: { id: issueData.project },
        summary: issueData.summary,
        description: issueData.description,
        customFields: [
          // Always set Type to "Project"
          { 
            "name": "Type", 
            "$type": "SingleEnumIssueCustomField", 
            "value": { "name": "Project" } 
          },
          // Always set State to "Needs Scoping"
          { 
            "name": "State", 
            "$type": "SingleEnumIssueCustomField", 
            "value": { "name": "Needs Scoping" } 
          },
          // Set Priority to always be TBD
          {
            "name": "Priority", 
            "$type": "SingleEnumIssueCustomField",
            "value": { "name": "TBD" }
          },
          // Set Initiative from form selection
          ...(issueData.initiative ? [{
            "name": "Initiative",
            "$type": "SingleEnumIssueCustomField",
            "value": { "name": this.getInitiativeDisplayName(issueData.initiative) }
          }] : []),
          // Set Target Date - uses timestamp format
          ...(issueData.targetDate ? [{
            "name": "Target Date",
            "$type": "DateIssueCustomField",
            "value": new Date(issueData.targetDate).getTime()
          }] : []),
          // Set Requestor from email - SingleUserIssueCustomField expects user login
          ...(issueData.requestor ? [{
            "name": "Requestor",
            "$type": "SingleUserIssueCustomField",
            "value": { "login": this.extractLoginFromEmail(issueData.requestor) }
          }] : []),
          // Set Supporting Documents from links in markdown format
          ...(issueData.links && issueData.links.length > 0 ? [{
            "name": "Supporting Documents",
            "$type": "TextIssueCustomField",
            "value": {
              "$type": "TextFieldValue",
              "text": this.formatLinksAsMarkdown(issueData.links)
            }
          }] : [])
        ]
      }

      // Links are now handled in Supporting Documents custom field

      console.log('Creating issue with payload:', payload)

      let result
      if (this.config.useProxy) {
        result = await this.makeRequest('/issues', {}, 'POST', payload)
      } else {
        result = await this.makeRequest('/issues', {}, 'POST', payload)
      }

      // If ticket was created successfully, fetch the readable ID
      if (result.data && (result.data as any).id) {
        const internalId = (result.data as any).id
        console.log('Ticket created with internal ID:', internalId)
        
        // Fetch the ticket details to get the readable ID
        const ticketDetails = await this.getIssueById(internalId, ['idReadable'])
        if (ticketDetails.data && (ticketDetails.data as any).idReadable) {
          // Replace the internal response with readable ID
          result.data = {
            ...(result.data as any),
            idReadable: (ticketDetails.data as any).idReadable
          } as any
          console.log('Readable ticket ID:', (ticketDetails.data as any).idReadable)
        }
      }

      return result
    } catch (error) {
      console.error('Error creating issue:', error)
      return { error: error instanceof Error ? error.message : 'Failed to create issue' }
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

    // Extract requestor from custom fields (for ATOP projects, this is the actual requestor)
    const requestorField = issue.customFields?.find(field => field.name === 'Requestor')
    const requestor = requestorField?.value?.name ? {
      id: requestorField.value.name.toLowerCase().replace(/\s+/g, '.'),
      name: requestorField.value.name,
      email: `${requestorField.value.name.toLowerCase().replace(/\s+/g, '.')}@therealbrokerage.com`
    } : null

    // Extract reporter from YouTrack response (this is who created the ticket)
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

    // Extract saved time from custom fields
    const savedTimeField = issue.customFields?.find(field => field.name === 'Saved Time (Mins)')
    const savedTimeMins = savedTimeField?.value ? parseInt(savedTimeField.value.toString()) || null : null

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
      requestor,
      assignee,
      priority,
      state,
      type,
      initiative,
      savedTimeMins,
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

  private getInitiativeDisplayName(initiativeValue: string): string {
    const initiativeMap: Record<string, string> = {
      'infrastructure': 'Infrastructure',
      'offboarding': 'Offboarding',
      'onboarding': 'Onboarding',
      'transactions': 'Transactions',
      'enablement': 'Enablement',
      'support': 'Support',
      'brokerage': 'Brokerage',
      'core-operations': 'Core Operations',
      'zapier-support': 'Zapier Support',
      'marketing': 'Marketing',
      'legal': 'Legal',
      'hr': 'HR',
      'finance': 'Finance'
    }
    
    return initiativeMap[initiativeValue] || initiativeValue
  }

  private getPriorityDisplayName(priorityValue: string): string {
    const priorityMap: Record<string, string> = {
      'low': '3 - Low',
      'medium': '2 - Medium', 
      'high': '1 - High',
      'critical': '0 - Urgent'
    }
    
    return priorityMap[priorityValue] || priorityValue
  }

  private extractLoginFromEmail(email: string): string {
    // Extract username from email address (everything before @)
    return email.split('@')[0]
  }

  private formatLinksAsMarkdown(links: Array<{ name: string; url: string }>): string {
    // Filter out empty links and format as markdown
    const validLinks = links.filter(link => link.name.trim() && link.url.trim())
    
    if (validLinks.length === 0) {
      return ''
    }

    return validLinks
      .map(link => `**${link.name}**\n${link.url}`)
      .join('\n\n')
  }
}

export const youTrackService = new YouTrackService()
export type { YouTrackIssue, YouTrackApiResponse }
