import React, { useState } from "react"
import { Layout } from "../components/Layout"
import { Link } from "gatsby"
import { 
  Search,
  Copy,
  Loader2,
  ExternalLink,
  Grid3X3,
  Database,
  ChevronRight,
  FileText,
  Download
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

function ToolsPage() {
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
      // Use proxy server in development, direct API in production
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api/metabase/inspect'
        : '/api/metabase/inspect'
      
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

      // Separate completed and upcoming projects
      const completedProjects = projects.filter((project: any) => {
        return ['Done', 'Completed', 'Closed', 'Resolved', 'Finished'].includes(project.state.name)
      })

      const upcomingProjects = projects.filter((project: any) => {
        return project.state.name === 'In Progress'
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

      setReportData({
        completedProjects,
        upcomingProjects,
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

    const reportText = `AUTOMATION PROJECT REPORT
Generated: ${new Date(reportData.generatedAt).toLocaleDateString()}

=== COMPLETED PROJECTS ===

${reportData.completedProjects.map((project: any, index: number) => {
  const formatted = formatProjectForReport(project)
  return `${index + 1}. ${formatted.name}
Initiative: ${formatted.initiative}
Ticket: ${formatted.ticket}

Description: ${formatted.description}

Time Savings: ${formatted.timeSavings.toFixed(0)} hrs
Cost Impact: $${formatted.costImpact.toLocaleString()}

`
}).join('')}

=== IN PROGRESS PROJECTS ===

${reportData.upcomingProjects.map((project: any, index: number) => {
  const formatted = formatProjectForReport(project)
  return `${index + 1}. ${formatted.name}
Initiative: ${formatted.initiative}
Ticket: ${formatted.ticket}

Description: ${formatted.description}

${formatted.timeSavings > 0 ? `Time Savings: ${formatted.timeSavings.toFixed(0)} hrs
Cost Impact: $${formatted.costImpact.toLocaleString()}` : 'Time Savings: Not yet calculated'}

`
}).join('')}

=== SUMMARY ===
Completed Projects: ${reportData.completedProjects.length}
In Progress Projects: ${reportData.upcomingProjects.length}

Time Savings Breakdown:
- Completed Projects: ${reportData.completedTimeSaved.toFixed(0)} hrs
- In Progress Projects: ${reportData.upcomingTimeSaved.toFixed(0)} hrs
- Total Time Saved: ${reportData.totalTimeSaved.toFixed(0)} hrs

Cost Impact Breakdown:
- Completed Projects: $${reportData.completedCostImpact.toLocaleString()}
- In Progress Projects: $${reportData.upcomingCostImpact.toLocaleString()}
- Total Cost Impact: $${reportData.totalCostImpact.toLocaleString()}

Cost impact calculated using $70k annual salary ($35/hour).`

    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `automation-project-report-${new Date().toISOString().split('T')[0]}.txt`
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
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg">
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
                    className="w-full px-3 py-2 bg-white border border-white/20 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50"
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
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm">{inspectorError}</p>
                </div>
              )}

              {inspectorResult && (
                <div className="space-y-4">
                  {/* Card Title */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Card Information</h4>
                    <div className="text-sm text-gray-600">
                      <p><span className="font-medium">Card ID:</span> {inspectorResult.card_id}</p>
                      <p><span className="font-medium">Card Title:</span> {inspectorResult.card_title}</p>
                    </div>
                  </div>

                  {/* SQL Query */}
                  {inspectorResult.sql_query && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">SQL Query</h4>
                        <button
                          onClick={copySQLQuery}
                          className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-500 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy SQL</span>
                        </button>
                      </div>
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto bg-gray-50 p-3 rounded border">
                        {inspectorResult.sql_query}
                      </pre>
                    </div>
                  )}

                  {/* Columns */}
                  {inspectorResult.columns && inspectorResult.columns.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Columns ({inspectorResult.columns.length})</h4>
                      <div className="space-y-2">
                        {inspectorResult.columns.map((col: any) => (
                          <div key={col.index} className="flex items-center space-x-3 text-sm">
                            <span className="font-mono text-gray-500 w-8">{col.index}.</span>
                            <span className="font-medium text-gray-800">{col.name}</span>
                            <span className="text-gray-500">({col.type})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {inspectorResult.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Error</h4>
                      <p className="text-sm text-red-700">{inspectorResult.error}</p>
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
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
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

          {/* Report Generator Tool */}
          <div className="card mb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-breeze-800 mb-2">Generate Project Report</h4>
                  <p className="text-sm text-breeze-600">
                    This report will show completed projects with time savings and cost impact, plus upcoming projects in progress.
                  </p>
                </div>
                <button
                  onClick={generateProjectReport}
                  disabled={generatingReport}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingReport ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Generate Report</span>
                    </>
                  )}
                </button>
              </div>

              {reportError && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm">{reportError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Report Results */}
          {reportData && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-800 mb-2">Completed Projects</h5>
                  <p className="text-2xl font-bold text-green-600">{reportData.completedProjects.length}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {reportData.completedTimeSaved.toFixed(0)} hrs saved
                  </p>
                  <p className="text-sm text-gray-600">
                    ${reportData.completedCostImpact.toLocaleString()} impact
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-800 mb-2">In Progress Projects</h5>
                  <p className="text-2xl font-bold text-blue-600">{reportData.upcomingProjects.length}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {reportData.upcomingTimeSaved.toFixed(0)} hrs saved
                  </p>
                  <p className="text-sm text-gray-600">
                    ${reportData.upcomingCostImpact.toLocaleString()} impact
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-800 mb-2">Total Time Saved</h5>
                  <p className="text-2xl font-bold text-purple-600">{reportData.totalTimeSaved.toFixed(0)} hrs</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Completed: {reportData.completedTimeSaved.toFixed(0)} hrs
                  </p>
                  <p className="text-sm text-gray-600">
                    In Progress: {reportData.upcomingTimeSaved.toFixed(0)} hrs
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-800 mb-2">Total Cost Impact</h5>
                  <p className="text-2xl font-bold text-orange-600">${reportData.totalCostImpact.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Completed: ${reportData.completedCostImpact.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    In Progress: ${reportData.upcomingCostImpact.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Download Button */}
              <div className="flex justify-center">
                <button
                  onClick={downloadReport}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report</span>
                </button>
              </div>

              {/* Completed Projects */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Completed Projects</h3>
                <div className="space-y-6">
                  {reportData.completedProjects.map((project: any, index: number) => {
                    const formatted = formatProjectForReport(project)
                    return (
                      <div key={project.idReadable} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{formatted.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>Initiative: {formatted.initiative}</span>
                            <span>•</span>
                            <span>Ticket: {formatted.ticket}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{formatted.description}</p>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-500">Time Savings:</span>
                            <span className="font-semibold text-green-600">{formatted.timeSavings.toFixed(0)} hrs</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-500">Cost Impact:</span>
                            <span className="font-semibold text-orange-600">${formatted.costImpact.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Upcoming Projects */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">In Progress Projects</h3>
                <div className="space-y-4">
                  {reportData.upcomingProjects.map((project: any, index: number) => {
                    const formatted = formatProjectForReport(project)
                    return (
                      <div key={project.idReadable} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{formatted.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>Initiative: {formatted.initiative}</span>
                            <span>•</span>
                            <span>Ticket: {formatted.ticket}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{formatted.description}</p>
                        {formatted.timeSavings > 0 && (
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-500">Time Savings:</span>
                              <span className="font-semibold text-green-600">{formatted.timeSavings.toFixed(0)} hrs</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-500">Cost Impact:</span>
                              <span className="font-semibold text-orange-600">${formatted.costImpact.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
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
                <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl">
                  {tool.icon}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  tool.status === 'available' 
                    ? 'bg-green-500/20 text-green-700' 
                    : 'bg-yellow-500/20 text-yellow-700'
                }`}>
                  {tool.status === 'available' ? 'Available' : 'Coming Soon'}
                </span>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-breeze-800 mb-2">{tool.name}</h3>
                <p className="text-sm text-breeze-600 mb-3">{tool.description}</p>
                <span className="text-xs text-accent-300 font-medium">{tool.category}</span>
              </div>

              <div className="flex items-center justify-between">
                {tool.status === 'available' ? (
                  <button
                    onClick={tool.action}
                    className="flex items-center space-x-2 text-purple-700 hover:text-purple-600 transition-colors"
                  >
                    <span>Open Tool</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-breeze-500 text-sm">Coming Soon</span>
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

export default ToolsPage

export function Head() {
  return (
    <>
      <title>Tools Directory - YouTrack</title>
      <meta name="description" content="Directory of automation tools and utilities for data analysis and workflow optimization" />
    </>
  )
}