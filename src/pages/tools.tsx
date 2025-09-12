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
  ChevronRight
} from "lucide-react"

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
  const [inspectorResult, setInspectorResult] = useState<string>("")
  const [inspecting, setInspecting] = useState<boolean>(false)
  const [inspectorError, setInspectorError] = useState<string>("")
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

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
    }
  ]

  const handleInspectCard = async () => {
    if (!cardId.trim()) {
      setInspectorError("Please enter a card ID")
      return
    }

    setInspecting(true)
    setInspectorError("")
    setInspectorResult("")

    try {
      const response = await fetch('http://localhost:3001/api/metabase/inspect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardId: cardId.trim() }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.text()
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
                <h1 className="text-3xl font-bold text-white">Metabase Card Inspector</h1>
                <p className="text-white/70 mt-1">
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
                  <label htmlFor="cardId" className="block text-sm font-medium text-white/80 mb-2">
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">Inspection Result</h4>
                    <button
                      onClick={() => copyToClipboard(inspectorResult)}
                      className="flex items-center space-x-1 text-sm text-purple-300 hover:text-purple-200 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="bg-gray-900/50 border border-white/10 rounded-lg p-4">
                    <pre className="text-sm text-white/90 whitespace-pre-wrap overflow-x-auto">
                      {inspectorResult}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Tools Directory">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl shadow-lg">
              <Grid3X3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Tools Directory</h1>
              <p className="text-white/70 mt-1">
                Automation tools and utilities for data analysis and workflow optimization
              </p>
            </div>
          </div>
        </div>

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
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {tool.status === 'available' ? 'Available' : 'Coming Soon'}
                </span>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-white mb-2">{tool.name}</h3>
                <p className="text-sm text-white/70 mb-3">{tool.description}</p>
                <span className="text-xs text-accent-300 font-medium">{tool.category}</span>
              </div>

              <div className="flex items-center justify-between">
                {tool.status === 'available' ? (
                  <button
                    onClick={tool.action}
                    className="flex items-center space-x-2 text-purple-300 hover:text-purple-200 transition-colors"
                  >
                    <span>Open Tool</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-white/50 text-sm">Coming Soon</span>
                )}
                
                {tool.href && (
                  <a 
                    href={tool.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/50 hover:text-white/70 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State for Future Tools */}
        <div className="mt-8 text-center">
          <div className="max-w-md mx-auto">
            <p className="text-white/50 text-sm mb-4">
              More tools are being developed to help automate your workflows.
            </p>
            <div className="text-xs text-white/30">
              Have an idea for a tool? Let the automation team know!
            </div>
          </div>
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