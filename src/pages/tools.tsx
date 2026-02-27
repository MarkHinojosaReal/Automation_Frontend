import React, { useState, useEffect, useRef, useCallback } from "react"
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
  Plus,
  FolderDown,
  CheckCircle2,
  AlertCircle,
  BookOpen
} from "lucide-react"
import { youTrackService } from "../services/youtrack"
import type { Ticket } from "../types"

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

interface MetabaseColumn {
  index: number
  name: string
  type: string
}

interface InspectorResult {
  card_id: string
  card_title: string
  sql_query: string
  columns: MetabaseColumn[]
  error?: string
}

interface ProjectReportData {
  completedProjects: Ticket[]
  upcomingProjects: Ticket[]
  queuedProjects: Ticket[]
  completedTimeSaved: number
  completedCostImpact: number
  upcomingTimeSaved: number
  upcomingCostImpact: number
  totalTimeSaved: number
  totalCostImpact: number
  generatedAt: string
}

interface FilteredMetrics {
  completedProjects: Ticket[]
  upcomingProjects: Ticket[]
  completedTimeSaved: number
  completedCostImpact: number
  upcomingTimeSaved: number
  upcomingCostImpact: number
  totalTimeSaved: number
  totalCostImpact: number
}

interface TransactionResult {
  transactionId: string
  address?: string
  fileCount?: number
  error?: string
}

interface KBArticle {
  id: number
  title: string
  snippetHtml: string
  html_url: string
  updated_at: string
  locale: string
  section_id: number
  brand_id: number
  is_internal: boolean
}

interface KBSearchResult {
  query: string
  count: number
  results: KBArticle[]
}

function isMetabaseColumn(value: unknown): value is MetabaseColumn {
  if (!value || typeof value !== "object") {
    return false
  }

  return (
    "index" in value &&
    typeof value.index === "number" &&
    "name" in value &&
    typeof value.name === "string" &&
    "type" in value &&
    typeof value.type === "string"
  )
}

function normalizeInspectorResult(data: unknown): InspectorResult {
  if (!data || typeof data !== "object") {
    return {
      card_id: "",
      card_title: "",
      sql_query: "",
      columns: [],
      error: "Unexpected response from inspector endpoint"
    }
  }

  const columnsSource = "columns" in data && Array.isArray(data.columns) ? data.columns : []
  const columns = columnsSource.filter(isMetabaseColumn)

  return {
    card_id: "card_id" in data && typeof data.card_id === "string" ? data.card_id : "",
    card_title: "card_title" in data && typeof data.card_title === "string" ? data.card_title : "Unknown",
    sql_query: "sql_query" in data && typeof data.sql_query === "string" ? data.sql_query : "",
    columns,
    error: "error" in data && typeof data.error === "string" ? data.error : undefined
  }
}

function ToolsPageContent() {
  // Metabase Card Inspector state
  const [cardId, setCardId] = useState<string>("")
  const [inspectorResult, setInspectorResult] = useState<InspectorResult | null>(null)
  const [inspecting, setInspecting] = useState<boolean>(false)
  const [inspectorError, setInspectorError] = useState<string>("")
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  // Project Report Generator state
  const [reportData, setReportData] = useState<ProjectReportData | null>(null)
  const [generatingReport, setGeneratingReport] = useState<boolean>(false)
  const [reportError, setReportError] = useState<string>("")
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())

  // reZEN File Downloader state
  const [rezenLookupMode, setRezenLookupMode] = useState<'transaction' | 'agent'>('transaction')
  const [rezenTransactionId, setRezenTransactionId] = useState<string>("")
  const [rezenYentaId, setRezenYentaId] = useState<string>("")
  const [rezenLifecycleFilter, setRezenLifecycleFilter] = useState<string>("")
  const [rezenDownloading, setRezenDownloading] = useState<boolean>(false)
  const [rezenError, setRezenError] = useState<string>("")
  const [rezenStatus, setRezenStatus] = useState<string>("")
  const [rezenResults, setRezenResults] = useState<TransactionResult[] | null>(null)
  const [rezenValidation, setRezenValidation] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle')
  const [rezenValidatedAddress, setRezenValidatedAddress] = useState<string>("")
  const rezenValidationRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // KB Search state
  const [kbQuery, setKbQuery] = useState<string>("")
  const [kbSearching, setKbSearching] = useState<boolean>(false)
  const [kbError, setKbError] = useState<string>("")
  const [kbResults, setKbResults] = useState<KBSearchResult | null>(null)
  const kbAbortRef = useRef<AbortController | null>(null)
  const kbDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      id: 'rezen-downloader',
      name: 'reZEN File Downloader',
      description: 'Download transaction documents from reZEN by Transaction ID or Agent ID as a ZIP file.',
      icon: <FolderDown className="w-6 h-6" />,
      category: 'File Management',
      status: 'available',
      action: () => setSelectedTool('rezen-downloader')
    },
    {
      id: 'kb-search',
      name: 'KB Article Search',
      description: 'Search Zendesk Help Center articles across internal and public knowledge bases.',
      icon: <BookOpen className="w-6 h-6" />,
      category: 'Knowledge Base',
      status: 'available',
      action: () => setSelectedTool('kb-search')
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
      setInspectorResult(normalizeInspectorResult(data))
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

      if (!Array.isArray(response.data)) {
        throw new Error("Unexpected project response format")
      }

      // Transform the raw YouTrack data to our internal format
      const projects = response.data.map((issue) => youTrackService.transformIssueToTicket(issue))

      // Separate completed, upcoming, and queued projects
      const completedProjects = projects.filter((project) => {
        return ['Done', 'Completed', 'Closed', 'Resolved', 'Finished'].includes(project.state.name)
      })

      const upcomingProjects = projects.filter((project) => {
        return project.state.name === 'In Progress'
      })

      const queuedProjects = projects.filter((project) => {
        return ['To Do', 'Discover', 'Need to Scope'].includes(project.state.name)
      })

      // Calculate totals for completed projects
      const completedTimeSaved = completedProjects.reduce((total, project) => {
        return total + (project.savedTimeMins || 0) / 60 // Convert to hours
      }, 0)

      const completedCostImpact = completedTimeSaved * 35 // $35/hour based on $70k salary

      // Calculate totals for upcoming projects
      const upcomingTimeSaved = upcomingProjects.reduce((total, project) => {
        return total + (project.savedTimeMins || 0) / 60 // Convert to hours
      }, 0)

      const upcomingCostImpact = upcomingTimeSaved * 35 // $35/hour based on $70k salary

      // Calculate grand totals
      const totalTimeSaved = completedTimeSaved + upcomingTimeSaved
      const totalCostImpact = completedCostImpact + upcomingCostImpact

      const allProjectIds = [...completedProjects, ...upcomingProjects].map((project) => project.idReadable)
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

  const getFilteredMetrics = (): FilteredMetrics | null => {
    if (!reportData) return null

    const filteredCompleted = reportData.completedProjects.filter((project) =>
      selectedProjects.has(project.idReadable)
    )
    const filteredUpcoming = reportData.upcomingProjects.filter((project) =>
      selectedProjects.has(project.idReadable)
    )

    const completedTimeSaved = filteredCompleted.reduce((total, project) => {
      return total + (project.savedTimeMins || 0) / 60
    }, 0)

    const completedCostImpact = completedTimeSaved * 35

    const upcomingTimeSaved = filteredUpcoming.reduce((total, project) => {
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
        let msg = `HTTP error! status: ${response.status}`
        try { const e = await response.json(); msg = e.error || msg } catch { /* non-JSON error body */ }
        throw new Error(msg)
      }

      const data = await response.json()

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

  const executeKBSearch = useCallback(async (query: string, isManual = false) => {
    if (!query.trim()) {
      if (isManual) setKbError("Please enter a search query")
      return
    }

    if (kbAbortRef.current) kbAbortRef.current.abort()
    const controller = new AbortController()
    kbAbortRef.current = controller

    setKbSearching(true)
    setKbError("")
    if (isManual) setKbResults(null)

    try {
      const response = await fetch('/api/zendesk/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({
          query: query.trim(),
          perPage: 50,
          maxPages: 4,
          multibrand: true,
          locale: '*',
        }),
      })

      if (!response.ok) {
        let msg = `Search failed: ${response.status}`
        try { const e = await response.json(); msg = e.error || msg } catch { /* non-JSON error body */ }
        throw new Error(msg)
      }

      const data = await response.json() as KBSearchResult
      setKbResults(data)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setKbError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      if (!controller.signal.aborted) setKbSearching(false)
    }
  }, [])

  const handleKBSearch = () => {
    if (kbDebounceRef.current) clearTimeout(kbDebounceRef.current)
    executeKBSearch(kbQuery, true)
  }

  useEffect(() => {
    if (selectedTool !== 'kb-search') return
    if (kbDebounceRef.current) clearTimeout(kbDebounceRef.current)

    if (kbQuery.trim().length < 3) return

    kbDebounceRef.current = setTimeout(() => {
      executeKBSearch(kbQuery)
    }, 400)

    return () => {
      if (kbDebounceRef.current) clearTimeout(kbDebounceRef.current)
    }
  }, [kbQuery, selectedTool, executeKBSearch])

  // Auto-validate a single transaction UUID as the user types
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  useEffect(() => {
    if (rezenValidationRef.current) clearTimeout(rezenValidationRef.current)

    const id = rezenTransactionId.trim()
    // Only auto-validate single UUIDs (not comma-separated lists)
    if (!id || !UUID_RE.test(id)) {
      setRezenValidation('idle')
      setRezenValidatedAddress("")
      return
    }

    setRezenValidation('loading')
    rezenValidationRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/rezen/validate-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ transactionId: id }),
        })
        const data = await res.json()
        if (res.ok && data.valid) {
          setRezenValidation('valid')
          setRezenValidatedAddress(data.address || "")
        } else {
          setRezenValidation('invalid')
          setRezenValidatedAddress("")
        }
      } catch {
        setRezenValidation('invalid')
        setRezenValidatedAddress("")
      }
    }, 600)

    return () => {
      if (rezenValidationRef.current) clearTimeout(rezenValidationRef.current)
    }
  }, [rezenTransactionId])

  const stripHtml = (html: string): string => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  const csvEscape = (v: string | number | null | undefined): string => {
    const s = String(v == null ? '' : v)
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }

  const exportKBCsv = () => {
    if (!kbResults || kbResults.results.length === 0) return

    const headers = ['Title', 'URL', 'Visibility', 'Locale', 'Updated At', 'Article ID', 'Section ID', 'Brand ID', 'Snippet']
    const lines = [headers.join(',')]

    for (const r of kbResults.results) {
      const values = [
        r.title || '',
        r.html_url || '',
        r.is_internal ? 'internal' : 'public',
        r.locale || '',
        r.updated_at || '',
        r.id || '',
        r.section_id || '',
        r.brand_id || '',
        stripHtml(r.snippetHtml || ''),
      ]
      lines.push(values.map(csvEscape).join(','))
    }

    const csv = lines.join('\n')
    const q = kbResults.query.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const date = new Date().toISOString().slice(0, 10)
    const filename = `zd_search_${q || 'results'}_${date}.csv`

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRezenDownload = async () => {
    const isTransaction = rezenLookupMode === 'transaction'
    const idValue = isTransaction ? rezenTransactionId.trim() : rezenYentaId.trim()

    if (!idValue) {
      setRezenError(isTransaction ? "Please enter a Transaction ID" : "Please enter an Agent/Yenta ID")
      return
    }

    setRezenDownloading(true)
    setRezenError("")
    setRezenResults(null)
    setRezenStatus(isTransaction ? "Fetching transaction files..." : "Fetching agent transactions...")

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 300_000) // 5-minute timeout

    try {
      const endpoint = isTransaction ? '/api/rezen/download-transaction' : '/api/rezen/download-agent'
      const body = isTransaction
        ? { transactionIds: idValue.split(',').map((id: string) => id.trim()).filter(Boolean) }
        : { yentaId: idValue, lifecycleFilter: rezenLifecycleFilter || undefined }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        let msg = `Download failed: ${response.status}`
        try { const e = await response.json(); msg = e.error || msg } catch { /* non-JSON error body */ }
        throw new Error(msg)
      }

      const fileCount = response.headers.get('X-File-Count')
      const txResultsHeader = response.headers.get('X-Transaction-Results')
      let txResults: TransactionResult[] = []
      if (txResultsHeader) {
        try { txResults = JSON.parse(txResultsHeader) } catch { /* ignore */ }
      }

      setRezenStatus("Preparing download...")
      const blob = await response.blob()
      const disposition = response.headers.get('Content-Disposition')
      const filenameMatch = disposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : 'rezen-files.zip'

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setRezenResults(txResults)
      setRezenStatus(`Downloaded ${fileCount || '?'} files successfully`)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setRezenError("Request timed out after 5 minutes. Try using a lifecycle filter or fewer transaction IDs.")
      } else {
        setRezenError(error instanceof Error ? error.message : 'An error occurred')
      }
      setRezenStatus("")
    } finally {
      clearTimeout(timeoutId)
      setRezenDownloading(false)
    }
  }

  const formatProjectForReport = (project: Ticket) => {
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

${filteredMetrics.completedProjects.map((project) => {
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

${filteredMetrics.upcomingProjects.map((project) => {
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
                        {inspectorResult.columns.map((col) => (
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
                    {reportData.completedProjects.map((project) => {
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
                    {reportData.upcomingProjects.map((project) => {
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

  if (selectedTool === 'kb-search') {
    return (
      <Layout title="KB Article Search">
        <div className="max-w-4xl mx-auto">
          {/* Back to Tools */}
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedTool(null)
                setKbError("")
                setKbResults(null)
                setKbQuery("")
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
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-breeze-800">KB Article Search</h1>
                <p className="text-breeze-600 mt-1">
                  Search internal and public Zendesk Help Center articles
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="card">
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label htmlFor="kb-query" className="block text-sm font-medium text-breeze-700 mb-2">
                    Search Query
                  </label>
                  <input
                    id="kb-query"
                    type="text"
                    value={kbQuery}
                    onChange={(e) => setKbQuery(e.target.value)}
                    placeholder="Search internal and public Zendesk articles..."
                    className="w-full px-3 py-2 bg-white border border-breeze-200 rounded-lg text-breeze-900 placeholder-breeze-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/50 focus:border-ocean-400/50"
                    onKeyDown={(e) => e.key === 'Enter' && !kbSearching && handleKBSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleKBSearch}
                    disabled={kbSearching}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {kbSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {kbError && (
                <div className="p-4 bg-priority-high/10 border border-priority-high/20 rounded-lg">
                  <p className="text-priority-high text-sm">{kbError}</p>
                </div>
              )}

              {/* Results */}
              {kbResults && (
                <div className="space-y-4">
                  {/* Result count + export */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-breeze-600">
                      {kbResults.query ? `"${kbResults.query}"` : 'Results'} &mdash; {kbResults.count} article(s)
                    </p>
                    {kbResults.results.length > 0 && (
                      <button
                        onClick={exportKBCsv}
                        className="flex items-center space-x-1 text-sm text-ocean-600 hover:text-ocean-500 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                      </button>
                    )}
                  </div>

                  {/* No results */}
                  {kbResults.results.length === 0 && (
                    <div className="text-sm text-breeze-500 py-2">
                      No articles found.
                    </div>
                  )}

                  {/* Article cards */}
                  {kbResults.results.map((article) => (
                    <div
                      key={article.id}
                      className="bg-white border border-breeze-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <a
                          href={article.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-ocean-600 hover:text-ocean-700 hover:underline transition-colors"
                        >
                          {article.title}
                        </a>
                        <span className={`ml-2 flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${
                          article.is_internal
                            ? 'bg-priority-high/10 text-priority-high border border-priority-high/20'
                            : 'bg-breeze-100 text-breeze-500 border border-breeze-200'
                        }`}>
                          {article.is_internal ? 'internal' : 'public'}
                        </span>
                      </div>
                      {article.snippetHtml && (
                        <div
                          className="text-sm text-breeze-600 mb-2 [&_em]:not-italic [&_em]:bg-yellow-100 [&_em]:text-breeze-900 [&_em]:px-0.5 [&_em]:rounded"
                          dangerouslySetInnerHTML={{
                            __html: article.snippetHtml
                              .replace(/<(?!em|\/em)[^>]*>/g, '')
                          }}
                        />
                      )}
                      <div className="text-xs text-breeze-400">
                        Locale: {article.locale || '\u2014'} &bull; Updated: {
                          article.updated_at
                            ? new Date(article.updated_at).toLocaleDateString()
                            : '\u2014'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (selectedTool === 'rezen-downloader') {
    return (
      <Layout title="reZEN File Downloader">
        <div className="max-w-4xl mx-auto">
          {/* Back to Tools */}
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedTool(null)
                setRezenError("")
                setRezenStatus("")
                setRezenResults(null)
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
                <FolderDown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-breeze-800">reZEN File Downloader</h1>
                <p className="text-breeze-600 mt-1">
                  Download transaction documents from reZEN as a ZIP file
                </p>
              </div>
            </div>
          </div>

          {/* Tool Content */}
          <div className="card">
            <div className="space-y-6">
              {/* Lookup Mode Toggle */}
              <div>
                <label className="block text-sm font-medium text-breeze-700 mb-2">
                  Lookup Type
                </label>
                <div className="flex rounded-lg overflow-hidden border border-breeze-200">
                  <button
                    onClick={() => { setRezenLookupMode('transaction'); setRezenValidation('idle'); setRezenValidatedAddress("") }}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                      rezenLookupMode === 'transaction'
                        ? 'bg-ocean-500 text-white'
                        : 'bg-white text-breeze-600 hover:bg-breeze-50'
                    }`}
                  >
                    Transaction ID
                  </button>
                  <button
                    onClick={() => setRezenLookupMode('agent')}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                      rezenLookupMode === 'agent'
                        ? 'bg-ocean-500 text-white'
                        : 'bg-white text-breeze-600 hover:bg-breeze-50'
                    }`}
                  >
                    Agent / Yenta ID
                  </button>
                </div>
              </div>

              {/* Transaction ID Input */}
              {rezenLookupMode === 'transaction' && (
                <div>
                  <label htmlFor="rezen-transaction-id" className="block text-sm font-medium text-breeze-700 mb-2">
                    Transaction ID(s)
                  </label>
                  <input
                    id="rezen-transaction-id"
                    type="text"
                    value={rezenTransactionId}
                    onChange={(e) => setRezenTransactionId(e.target.value)}
                    placeholder="Enter transaction ID (or comma-separated for multiple)"
                    className="w-full px-3 py-2 bg-white border border-breeze-200 rounded-lg text-breeze-900 placeholder-breeze-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/50 focus:border-ocean-400/50"
                    onKeyDown={(e) => e.key === 'Enter' && !rezenDownloading && handleRezenDownload()}
                  />
                  {rezenValidation === 'idle' && (
                    <p className="text-xs text-breeze-400 mt-1">
                      UUID format, e.g. 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d
                    </p>
                  )}
                  {rezenValidation === 'loading' && (
                    <p className="text-xs text-breeze-400 mt-1 flex items-center space-x-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Validating transaction...</span>
                    </p>
                  )}
                  {rezenValidation === 'valid' && (
                    <p className="text-xs text-status-done mt-1 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{rezenValidatedAddress}</span>
                    </p>
                  )}
                  {rezenValidation === 'invalid' && (
                    <p className="text-xs text-priority-high mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Transaction not found</span>
                    </p>
                  )}
                </div>
              )}

              {/* Agent ID Input */}
              {rezenLookupMode === 'agent' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="rezen-yenta-id" className="block text-sm font-medium text-breeze-700 mb-2">
                      Agent / Yenta ID
                    </label>
                    <input
                      id="rezen-yenta-id"
                      type="text"
                      value={rezenYentaId}
                      onChange={(e) => setRezenYentaId(e.target.value)}
                      placeholder="Enter agent Yenta ID"
                      className="w-full px-3 py-2 bg-white border border-breeze-200 rounded-lg text-breeze-900 placeholder-breeze-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/50 focus:border-ocean-400/50"
                      onKeyDown={(e) => e.key === 'Enter' && !rezenDownloading && handleRezenDownload()}
                    />
                  </div>
                  <div>
                    <label htmlFor="rezen-lifecycle" className="block text-sm font-medium text-breeze-700 mb-2">
                      Lifecycle Filter
                    </label>
                    <select
                      id="rezen-lifecycle"
                      value={rezenLifecycleFilter}
                      onChange={(e) => setRezenLifecycleFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-breeze-200 rounded-lg text-breeze-900 focus:outline-none focus:ring-2 focus:ring-ocean-400/50 focus:border-ocean-400/50"
                    >
                      <option value="">All (Open, Closed, Terminated)</option>
                      <option value="OPEN">Open only</option>
                      <option value="CLOSED">Closed only</option>
                      <option value="TERMINATED">Terminated only</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Download Button */}
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleRezenDownload}
                  disabled={rezenDownloading}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed self-start"
                >
                  {rezenDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Files</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-breeze-400">Large downloads may take several minutes. Times out after 5 minutes.</p>
              </div>

              {/* Status Message */}
              {rezenStatus && !rezenError && (
                <div className={`p-4 rounded-lg flex items-center space-x-3 ${
                  rezenResults
                    ? 'bg-status-done/10 border border-status-done/20'
                    : 'bg-ocean-50 border border-ocean-200'
                }`}>
                  {rezenResults ? (
                    <CheckCircle2 className="w-5 h-5 text-status-done flex-shrink-0" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-ocean-600 animate-spin flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${rezenResults ? 'text-status-done' : 'text-ocean-700'}`}>
                    {rezenStatus}
                  </span>
                </div>
              )}

              {/* Error */}
              {rezenError && (
                <div className="p-4 bg-priority-high/10 border border-priority-high/20 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-priority-high flex-shrink-0" />
                  <p className="text-priority-high text-sm">{rezenError}</p>
                </div>
              )}

              {/* Results Summary */}
              {rezenResults && rezenResults.length > 0 && (
                <div className="bg-white border border-breeze-200 rounded-lg p-4">
                  <h4 className="font-semibold text-breeze-800 mb-3">Download Summary</h4>
                  <div className="space-y-2">
                    {rezenResults.map((result) => (
                      <div
                        key={result.transactionId}
                        className="flex items-center justify-between text-sm py-1 border-b border-breeze-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-2">
                          {result.error ? (
                            <AlertCircle className="w-4 h-4 text-priority-high" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-status-done" />
                          )}
                          <span className="font-medium text-breeze-800">
                            {result.address || result.transactionId.substring(0, 8) + '...'}
                          </span>
                        </div>
                        <span className={`${result.error ? 'text-priority-high' : 'text-breeze-500'}`}>
                          {result.error ? 'Error' : `${result.fileCount} files`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
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

