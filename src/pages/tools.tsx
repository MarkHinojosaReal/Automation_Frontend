import React, { useState, useEffect } from "react"
import { Layout } from "../components/Layout"
import { AuthGuard } from "../components/AuthGuard"
import { ProtectedRoute } from "../components/ProtectedRoute"
import { Link } from "react-router-dom"
import { 
  Search,
  Copy,
  Loader2,
  ExternalLink,
  Grid3X3,
  Database,
  ChevronRight,
  FileText,
  Download,
  Plus
} from "lucide-react"
import { youTrackService } from "../services/youtrack"

interface Tool {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  status: 'available' | 'coming-soon'
  action?: () => void
  href?: string
}

function ToolsPageContent() {
  // Metabase Card Inspector state
  const [cardId, setCardId] = useState<string>("")
  const [inspectorResult, setInspectorResult] = useState<any>(null)
  const [inspecting, setInspecting] = useState<boolean>(false)
  const [inspectorError, setInspectorError] = useState<string>("")
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  // Project Report Generator state
  const [reportData, setReportData] = useState<any>(null)
  const [generatingReport, setGeneratingReport] = useState<boolean>(false)
  const [reportError, setReportError] = useState<string>("")
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())

  // Add Automation state
  const [automationName, setAutomationName] = useState<string>("")
  const [automationInitiative, setAutomationInitiative] = useState<string>("")
  const [automationPlatform, setAutomationPlatform] = useState<string>("")
  const [creatingAutomation, setCreatingAutomation] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string>("")
  const [createdAutomationId, setCreatedAutomationId] = useState<string | null>(null)

  // Tools directory
  const tools: Tool[] = [
    {
      id: 'card-inspector',
      name: 'Metabase Card Inspector',
      description: 'Inspect Metabase cards to view SQL queries and column metadata for debugging and analysis.',
      icon: <Database className="w-6 h-6" />,
      category: 'Data Analysis',
      status: 'available',
      action: () => setSelectedTool('card-inspector')
    },
    {
      id: 'project-report',
      name: 'Project Report Generator',
      description: 'Generate comprehensive reports showing completed and upcoming projects with time savings and cost impact analysis.',
      icon: <FileText className="w-6 h-6" />,
      category: 'Reporting',
      status: 'available',
      action: () => setSelectedTool('project-report')
    },
    {
      id: 'add-automation',
      name: 'Add Automation',
      description: 'Create a new automation record in the database with name, platform, and initiative.',
      icon: <Plus className="w-6 h-6" />,
      category: 'Automation',
      status: 'available',
      action: () => setSelectedTool('add-automation')
    }
  ]

  const handleInspectCard = async () => {
    if (!cardId.trim()) {
      setInspectorError("Please enter a card ID")
      return
    }

    setInspecting(true)
    setInspectorError("")
    setInspectorResult(null)

    try {
      const apiUrl = '/api/metabase/inspect'
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardId: cardId.trim() }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setInspectorResult(data)
    } catch (error) {
      setInspectorError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setInspecting(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const copySQLQuery = () => {
    if (inspectorResult?.sql_query) {
      copyToClipboard(inspectorResult.sql_query)
    }
  }

  const generateProjectReport = async () => {
    setGeneratingReport(true)
    setReportError("")
    setReportData(null)

    try {
      // Fetch project data from YouTrack using the service
      const response = await youTrackService.getProjectIssues()
      
      if (response.error) {
        throw new Error(response.error)
      }

      // Transform the raw YouTrack data to our internal format
      const projects = (response.data || []).map((issue: any) => youTrackService.transformIssueToTicket(issue))

      // Separate completed, upcoming, and queued projects
      const completedProjects = projects.filter((project: any) => {
        return ['Done', 'Completed', 'Closed', 'Resolved', 'Finished'].includes(project.state.name)
      })

      const upcomingProjects = projects.filter((project: any) => {
        return project.state.name === 'In Progress'
      })

      const queuedProjects = projects.filter((project: any) => {
        return ['To Do', 'Discover', 'Need to Scope'].includes(project.state.name)
      })

      // Calculate totals for completed projects
      const completedTimeSaved = completedProjects.reduce((total: number, project: any) => {
        return total + (project.savedTimeMins || 0) / 60 // Convert to hours
      }, 0)

      const completedCostImpact = completedTimeSaved * 35 // $35/hour based on $70k salary

      // Calculate totals for upcoming projects
      const upcomingTimeSaved = upcomingProjects.reduce((total: number, project: any) => {
        return total + (project.savedTimeMins || 0) / 60 // Convert to hours
      }, 0)

      const upcomingCostImpact = upcomingTimeSaved * 35 // $35/hour based on $70k salary

      // Calculate grand totals
      const totalTimeSaved = completedTimeSaved + upcomingTimeSaved
      const totalCostImpact = completedCostImpact + upcomingCostImpact

      const allProjectIds = [...completedProjects, ...upcomingProjects].map((p: any) => p.idReadable)
      setSelectedProjects(new Set(allProjectIds))

      setReportData({
        completedProjects,
        upcomingProjects,
        queuedProjects,
        completedTimeSaved,
        completedCostImpact,
        upcomingTimeSaved,
        upcomingCostImpact,
        totalTimeSaved,
        totalCostImpact,
        generatedAt: new Date().toISOString()
      })

    } catch (error) {
      setReportError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setGeneratingReport(false)
    }
  }

  const toggleProjectSelection = (projectId: string) => {
    const newSelected = new Set(selectedProjects)
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId)
    } else {
      newSelected.add(projectId)
    }
    setSelectedProjects(newSelected)
  }

  const getFilteredMetrics = () => {
    if (!reportData) return null

    const filteredCompleted = reportData.completedProjects.filter((p: any) => 
      selectedProjects.has(p.idReadable)
    )
    const filteredUpcoming = reportData.upcomingProjects.filter((p: any) => 
      selectedProjects.has(p.idReadable)
    )

    const completedTimeSaved = filteredCompleted.reduce((total: number, project: any) => {
      return total + (project.savedTimeMins || 0) / 60
    }, 0)

    const completedCostImpact = completedTimeSaved * 35

    const upcomingTimeSaved = filteredUpcoming.reduce((total: number, project: any) => {
      return total + (project.savedTimeMins || 0) / 60
    }, 0)

    const upcomingCostImpact = upcomingTimeSaved * 35

    return {
      completedProjects: filteredCompleted,
      upcomingProjects: filteredUpcoming,
      completedTimeSaved,
      completedCostImpact,
      upcomingTimeSaved,
      upcomingCostImpact,
      totalTimeSaved: completedTimeSaved + upcomingTimeSaved,
      totalCostImpact: completedCostImpact + upcomingCostImpact
    }
  }

  // Auto-generate report when tool is opened
  useEffect(() => {
    if (selectedTool === 'project-report' && !reportData && !generatingReport) {
      generateProjectReport()
    }
  }, [selectedTool])

  const handleCreateAutomation = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!automationName.trim()) {
      setCreateError("Name is required")
      return
    }

    setCreatingAutomation(true)
    setCreateError("")
    setCreatedAutomationId(null)

    try {
      const apiUrl = '/api/automations'
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: automationName.trim(),
          initiative: automationInitiative.trim() || null,
          platform: automationPlatform.trim() || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Created automation:', data)
      
      setCreatedAutomationId(data.id)
      // Clear form
      setAutomationName("")
      setAutomationInitiative("")
      setAutomationPlatform("")
      
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setCreatingAutomation(false)
    }
  }

  const formatProjectForReport = (project: any) => {
    const initiative = project.initiative || 'Not Specified'
    const savedTimeHours = (project.savedTimeMins || 0) / 60
    const costImpact = savedTimeHours * 35 // $35/hour based on $70k salary

    // Clean up description by removing markdown headers and formatting
    const cleanDescription = (project.description || 'No description available')
      .replace(/^###\s*Project Description\s*\n?/gi, '') // Remove "### Project Description" header
      .replace(/^###\s*/gm, '') // Remove any remaining ### headers
      .replace(/^##\s*/gm, '') // Remove ## headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .replace(/`(.*?)`/g, '$1') // Remove code formatting
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links, keep text
      .split(/What Needs to Be Done/i)[0] // Remove everything after "What Needs to Be Done"
      .trim() // Remove leading/trailing whitespace

    return {
      name: project.summary,
      initiative,
      ticket: project.idReadable,
      description: cleanDescription,
      timeSavings: savedTimeHours,
      costImpact
    }
  }

  const downloadReport = () => {
    if (!reportData) return

    const filteredMetrics = getFilteredMetrics()
    if (!filteredMetrics) return

    const reportText = `## Summary

Completed projects: ${filteredMetrics.completedProjects.length}

Projects in-flight: ${filteredMetrics.upcomingProjects.length}

Projects in queue: ${reportData.queuedProjects ? reportData.queuedProjects.length : 0}

Total Tasks: ~${(filteredMetrics.completedProjects.length + filteredMetrics.upcomingProjects.length) * 1000}

Total Time Savings: ~${Math.round(filteredMetrics.totalTimeSaved).toLocaleString()}

Total Cost Impact: ~$${Math.round(filteredMetrics.totalCostImpact).toLocaleString()}

## Completed Projects

**All tasks and time savings were given by the project requestor. Cost impact is based on $70,000 salary / time savings. For continuous tasks, we are calculating on a full year.

${filteredMetrics.completedProjects.map((project: any) => {
  const formatted = formatProjectForReport(project)
  return `### ${formatted.name}

**Initiative**: ${formatted.initiative}

**Ticket**: [${formatted.ticket}](https://realbrokerage.youtrack.cloud/issue/${formatted.ticket})

${formatted.description}

Total Tasks: Pending

Time Savings: ${Math.round(formatted.timeSavings)} hrs

Cost Impact: ~$${Math.round(formatted.costImpact).toLocaleString()}
`
}).join('\n')}

## To Be Completed Next

**All tasks and time savings were given by the project requestor. Cost impact is based on $70,000 salary / time savings. For continuous tasks, we are calculating on a full year.

${filteredMetrics.upcomingProjects.map((project: any) => {
  const formatted = formatProjectForReport(project)
  return `### ${formatted.name}

**Initiative**: ${formatted.initiative}

**Ticket**: [${formatted.ticket}](https://realbrokerage.youtrack.cloud/issue/${formatted.ticket})

${formatted.description}

Total Tasks: ${formatted.timeSavings > 0 ? 'Pending' : 'NA'}

Time Savings: ${formatted.timeSavings > 0 ? `${Math.round(formatted.timeSavings)} hrs` : 'Pending'}

Cost Impact: ${formatted.timeSavings > 0 ? `~$${Math.round(formatted.costImpact).toLocaleString()}` : 'Pending'}
`
}).join('\n')}

## Platforms We Can Automate

* ReZen
* Real Signature
* ZenDesk
* Workvivo
* Google Sheets
`

    const blob = new Blob([reportText], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `automation-project-report-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (selectedTool === 'card-inspector') {
    return (
      <Layout title="Metabase Card Inspector">
        <div className="max-w-4xl mx-auto">
          {/* Back to Tools */}
          <div className="mb-6">
            <button
              onClick={() => setSelectedTool(null)}
              className="flex items-center space-x-2 text-ocean-300 hover:text-ocean-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>Back to Tools Directory</span>
            </button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-xl shadow-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-breeze-800">Metabase Card Inspector</h1>
                <p className="text-breeze-600 mt-1">
                  Enter a Metabase card ID to inspect its SQL query and column metadata
                </p>
              </div>
            </div>
          </div>

          {/* Card Inspector Tool */}
          <div className="card">
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label htmlFor="cardId" className="block text-sm font-medium text-breeze-700 mb-2">
                    Card ID
                  </label>
                  <input
                    id="cardId"
                    type="text"
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    placeholder="Enter Metabase card ID (e.g., 5342)"
                    className="w-full px-3 py-2 bg-white border border-breeze-200 rounded-lg text-breeze-900 placeholder-breeze-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/50 focus:border-ocean-400/50"
                    onKeyDown={(e) => e.key === 'Enter' && handleInspectCard()}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleInspectCard}
                    disabled={inspecting}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {inspecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Inspecting...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Inspect</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {inspectorError && (
                <div className="p-4 bg-priority-high/10 border border-priority-high/20 rounded-lg">
                  <p className="text-priority-high text-sm">{inspectorError}</p>
                </div>
              )}

              {inspectorResult && (
                <div className="space-y-4">
                  {/* Card Title */}
                  <div className="bg-white border border-breeze-200 rounded-lg p-4">
                    <h4 className="font-semibold text-breeze-800 mb-2">Card Information</h4>
                    <div className="text-sm text-breeze-600">
                      <p><span className="font-medium">Card ID:</span> {inspectorResult.card_id}</p>
                      <p><span className="font-medium">Card Title:</span> {inspectorResult.card_title}</p>
                    </div>
                  </div>

                  {/* SQL Query */}
                  {inspectorResult.sql_query && (
                    <div className="bg-white border border-breeze-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-breeze-800">SQL Query</h4>
                        <button
                          onClick={copySQLQuery}
                          className="flex items-center space-x-1 text-sm text-ocean-600 hover:text-ocean-500 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy SQL</span>
                        </button>
                      </div>
                      <pre className="text-sm text-breeze-800 whitespace-pre-wrap overflow-x-auto bg-breeze-50 p-3 rounded border border-breeze-200">
                        {inspectorResult.sql_query}
                      </pre>
                    </div>
                  )}

                  {/* Columns */}
                  {inspectorResult.columns && inspectorResult.columns.length > 0 && (
                    <div className="bg-white border border-breeze-200 rounded-lg p-4">
                      <h4 className="font-semibold text-breeze-800 mb-3">Columns ({inspectorResult.columns.length})</h4>
                      <div className="space-y-2">
                        {inspectorResult.columns.map((col: any) => (
                          <div key={col.index} className="flex items-center space-x-3 text-sm">
                            <span className="font-mono text-breeze-400 w-8">{col.index}.</span>
                            <span className="font-medium text-breeze-800">{col.name}</span>
                            <span className="text-breeze-500">({col.type})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {inspectorResult.error && (
                    <div className="bg-priority-high/10 border border-priority-high/20 rounded-lg p-4">
                      <h4 className="font-semibold text-priority-high mb-2">Error</h4>
                      <p className="text-sm text-priority-high">{inspectorResult.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (selectedTool === 'project-report') {
    return (
      <Layout title="Project Report Generator">
        <div className="max-w-6xl mx-auto">
          {/* Back to Tools */}
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedTool(null)
                setReportData(null)
                setReportError("")
              }}
              className="flex items-center space-x-2 text-ocean-300 hover:text-ocean-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>Back to Tools Directory</span>
            </button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-status-done/80 to-status-done rounded-xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-breeze-800">Project Report Generator</h1>
                <p className="text-breeze-600 mt-1">
                  Generate comprehensive reports showing completed and upcoming automation projects
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {generatingReport && (
            <div className="card mb-6">
              <div className="flex items-center justify-center space-x-3 py-8">
                <Loader2 className="w-6 h-6 animate-spin text-ocean-600" />
                <span className="text-breeze-700 font-medium">Generating report...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {reportError && !generatingReport && (
            <div className="card mb-6">
              <div className="space-y-4">
                <div className="p-4 bg-priority-high/10 border border-priority-high/20 rounded-lg">
                  <p className="text-priority-high text-sm">{reportError}</p>
                </div>
                <button
                  onClick={generateProjectReport}
                  className="btn-primary flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          )}

          {/* Report Results */}
          {reportData && (() => {
            const filteredMetrics = getFilteredMetrics()
            if (!filteredMetrics) return null

            return (
              <div className="space-y-6">
                {/* Download Button */}
                <div className="flex justify-center">
                  <button
                    onClick={downloadReport}
                    className="flex items-center space-x-2 bg-status-done hover:bg-priority-low text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Report ({selectedProjects.size} selected)</span>
                  </button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-breeze-200 rounded-lg p-4">
                    <h5 className="font-semibold text-breeze-800 mb-2">Completed Projects</h5>
                    <p className="text-2xl font-bold text-status-done">{filteredMetrics.completedProjects.length}</p>
                    <p className="text-sm text-breeze-600 mt-1">
                      {filteredMetrics.completedTimeSaved.toFixed(0)} hrs saved
                    </p>
                    <p className="text-sm text-breeze-600">
                      ${filteredMetrics.completedCostImpact.toLocaleString()} impact
                    </p>
                  </div>
                  <div className="bg-white border border-breeze-200 rounded-lg p-4">
                    <h5 className="font-semibold text-breeze-800 mb-2">In Progress Projects</h5>
                    <p className="text-2xl font-bold text-status-todo">{filteredMetrics.upcomingProjects.length}</p>
                    <p className="text-sm text-breeze-600 mt-1">
                      {filteredMetrics.upcomingTimeSaved.toFixed(0)} hrs saved
                    </p>
                    <p className="text-sm text-breeze-600">
                      ${filteredMetrics.upcomingCostImpact.toLocaleString()} impact
                    </p>
                  </div>
                  <div className="bg-white border border-breeze-200 rounded-lg p-4">
                    <h5 className="font-semibold text-breeze-800 mb-2">Total Time Saved</h5>
                    <p className="text-2xl font-bold text-ocean-600">{filteredMetrics.totalTimeSaved.toFixed(0)} hrs</p>
                    <p className="text-sm text-breeze-600 mt-1">
                      Completed: {filteredMetrics.completedTimeSaved.toFixed(0)} hrs
                    </p>
                    <p className="text-sm text-breeze-600">
                      In Progress: {filteredMetrics.upcomingTimeSaved.toFixed(0)} hrs
                    </p>
                  </div>
                  <div className="bg-white border border-breeze-200 rounded-lg p-4">
                    <h5 className="font-semibold text-breeze-800 mb-2">Total Cost Impact</h5>
                    <p className="text-2xl font-bold text-priority-medium">${filteredMetrics.totalCostImpact.toLocaleString()}</p>
                    <p className="text-sm text-breeze-600 mt-1">
                      Completed: ${filteredMetrics.completedCostImpact.toLocaleString()}
                    </p>
                    <p className="text-sm text-breeze-600">
                      In Progress: ${filteredMetrics.upcomingCostImpact.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Completed Projects */}
                <div className="bg-white border border-breeze-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-breeze-800 mb-4">Completed Projects</h3>
                  <div className="space-y-6">
                    {reportData.completedProjects.map((project: any, index: number) => {
                      const formatted = formatProjectForReport(project)
                      const isSelected = selectedProjects.has(project.idReadable)
                      return (
                        <div key={project.idReadable} className="border-b border-breeze-100 pb-4 last:border-b-0">
                          <div className="flex items-start space-x-3 mb-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleProjectSelection(project.idReadable)}
                              className="mt-1 h-4 w-4 text-ocean-600 focus:ring-ocean-500 border-breeze-300 rounded cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h4 className="font-semibold text-breeze-800">{formatted.name}</h4>
                                <div className="flex items-center space-x-2 text-sm text-breeze-500">
                                  <span>Initiative: {formatted.initiative}</span>
                                  <span>•</span>
                                  <span>Ticket: <a 
                                    href={`https://realbrokerage.youtrack.cloud/issue/${formatted.ticket}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-ocean-600 hover:text-ocean-700 underline"
                                  >{formatted.ticket}</a></span>
                                </div>
                              </div>
                              <p className="text-breeze-600 mb-3">{formatted.description}</p>
                              <div className="flex items-center space-x-6 text-sm">
                                <div className="flex items-center space-x-1">
                                  <span className="text-breeze-500">Time Savings:</span>
                                  <span className="font-semibold text-status-done">{formatted.timeSavings.toFixed(0)} hrs</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-breeze-500">Cost Impact:</span>
                                  <span className="font-semibold text-priority-medium">${formatted.costImpact.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Upcoming Projects */}
                <div className="bg-white border border-breeze-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-breeze-800 mb-4">In Progress Projects</h3>
                  <div className="space-y-4">
                    {reportData.upcomingProjects.map((project: any, index: number) => {
                      const formatted = formatProjectForReport(project)
                      const isSelected = selectedProjects.has(project.idReadable)
                      return (
                        <div key={project.idReadable} className="border-b border-breeze-100 pb-4 last:border-b-0">
                          <div className="flex items-start space-x-3 mb-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleProjectSelection(project.idReadable)}
                              className="mt-1 h-4 w-4 text-ocean-600 focus:ring-ocean-500 border-breeze-300 rounded cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h4 className="font-semibold text-breeze-800">{formatted.name}</h4>
                                <div className="flex items-center space-x-2 text-sm text-breeze-500">
                                  <span>Initiative: {formatted.initiative}</span>
                                  <span>•</span>
                                  <span>Ticket: <a 
                                    href={`https://realbrokerage.youtrack.cloud/issue/${formatted.ticket}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-ocean-600 hover:text-ocean-700 underline"
                                  >{formatted.ticket}</a></span>
                                </div>
                              </div>
                              <p className="text-breeze-600 mb-3">{formatted.description}</p>
                              {formatted.timeSavings > 0 && (
                                <div className="flex items-center space-x-6 text-sm">
                                  <div className="flex items-center space-x-1">
                                    <span className="text-breeze-500">Time Savings:</span>
                                    <span className="font-semibold text-status-done">{formatted.timeSavings.toFixed(0)} hrs</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-breeze-500">Cost Impact:</span>
                                    <span className="font-semibold text-priority-medium">${formatted.costImpact.toLocaleString()}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </Layout>
    )
  }

  if (selectedTool === 'add-automation') {
    return (
      <Layout title="Add Automation">
        <div className="max-w-2xl mx-auto">
          {/* Back to Tools */}
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedTool(null)
                setAutomationName("")
                setAutomationInitiative("")
                setAutomationPlatform("")
                setCreateError("")
                setCreatedAutomationId(null)
              }}
              className="flex items-center space-x-2 text-ocean-300 hover:text-ocean-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>Back to Tools Directory</span>
            </button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-xl shadow-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-breeze-800">Add Automation</h1>
                <p className="text-breeze-600 mt-1">
                  Create a new automation record in the database
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card">
            <form onSubmit={handleCreateAutomation} className="space-y-6">
              {/* Success Message */}
              {createdAutomationId && (
                <div className="p-6 bg-status-done/10 border-2 border-status-done/20 rounded-lg">
                  <p className="text-status-done text-base font-semibold mb-2">Automation created successfully!</p>
                  <p className="text-breeze-800 text-sm font-mono bg-status-done/10 p-2 rounded">ID: {createdAutomationId}</p>
                </div>
              )}

              {/* Error Message */}
              {createError && (
                <div className="p-4 bg-priority-high/10 border border-priority-high/20 rounded-lg">
                  <p className="text-priority-high text-sm">{createError}</p>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label htmlFor="automation-name" className="block text-sm font-medium text-breeze-700 mb-2">
                  Name <span className="text-priority-high">*</span>
                </label>
                <input
                  id="automation-name"
                  type="text"
                  value={automationName}
                  onChange={(e) => setAutomationName(e.target.value)}
                  placeholder="Enter automation name"
                  className="w-full px-3 py-2 bg-white border border-breeze-200 rounded-lg text-breeze-900 placeholder-breeze-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/50 focus:border-ocean-400/50"
                  required
                />
              </div>

              {/* Platform Field */}
              <div>
                <label htmlFor="automation-platform" className="block text-sm font-medium text-breeze-700 mb-2">
                  Platform
                </label>
                <input
                  id="automation-platform"
                  type="text"
                  value={automationPlatform}
                  onChange={(e) => setAutomationPlatform(e.target.value)}
                  placeholder="Enter platform (optional)"
                  className="w-full px-3 py-2 bg-white border border-breeze-200 rounded-lg text-breeze-900 placeholder-breeze-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/50 focus:border-ocean-400/50"
                />
              </div>

              {/* Initiative Field */}
              <div>
                <label htmlFor="automation-initiative" className="block text-sm font-medium text-breeze-700 mb-2">
                  Initiative
                </label>
                <input
                  id="automation-initiative"
                  type="text"
                  value={automationInitiative}
                  onChange={(e) => setAutomationInitiative(e.target.value)}
                  placeholder="Enter initiative (optional)"
                  className="w-full px-3 py-2 bg-white border border-breeze-200 rounded-lg text-breeze-900 placeholder-breeze-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/50 focus:border-ocean-400/50"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={creatingAutomation}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingAutomation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Automation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Tools Directory">
      <div className="max-w-6xl mx-auto">
        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div key={tool.id} className="card hover:bg-white/[0.08] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-xl shadow-md">
                  {tool.icon}
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  tool.status === 'available' 
                    ? 'bg-status-done/10 text-status-done border border-status-done/20' 
                    : 'bg-priority-medium/10 text-priority-medium border border-priority-medium/20'
                }`}>
                  {tool.status === 'available' ? 'Available' : 'Coming Soon'}
                </span>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-breeze-800 mb-2">{tool.name}</h3>
                <p className="text-sm text-breeze-600 mb-3">{tool.description}</p>
                <span className="text-xs text-accent-500 font-semibold uppercase tracking-wider">{tool.category}</span>
              </div>

              <div className="flex items-center justify-between">
                {tool.status === 'available' ? (
                  <button
                    onClick={tool.action}
                    className="flex items-center space-x-2 text-ocean-600 hover:text-ocean-700 font-medium transition-colors"
                  >
                    <span>Open Tool</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-breeze-400 text-sm italic">Coming Soon</span>
                )}
                
                {tool.href && (
                  <a 
                    href={tool.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-breeze-500 hover:text-breeze-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

function ToolsPage() {
  return (
    <AuthGuard>
      <ProtectedRoute requiredPath="/tools">
        <ToolsPageContent />
      </ProtectedRoute>
    </AuthGuard>
  )
}

export default ToolsPage

