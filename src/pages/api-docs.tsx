import React, { useState } from "react"
import { Layout } from "../components/Layout"
import { AuthGuard } from "../components/AuthGuard"
import { 
  BookOpen, 
  Code, 
  ExternalLink, 
  ChevronRight,
  Copy,
  Check,
  Globe,
  Server,
  Database,
  Mail,
  User,
  Settings
} from "lucide-react"

interface ApiParameter {
  name: string
  type: string
  required: boolean
  description?: string
  enum?: string[]
}

interface ApiEndpoint {
  method: string
  path: string
  description: string
  category: string
  icon: React.ReactNode
  pathParams?: ApiParameter[]
  queryParams?: ApiParameter[]
  requestBody?: {
    type: string
    fields: ApiParameter[]
  }
  supportedStates?: string[]
}

const apiEndpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/",
    description: "Health check endpoint returning 'Hello World'",
    category: "Health",
    icon: <Server className="w-4 h-4" />
  },
  {
    method: "GET",
    path: "/api/agentDetails/{id}",
    description: "Gets agent details by ID from Rezen API",
    category: "Agent Management",
    icon: <User className="w-4 h-4" />,
    pathParams: [
      {
        name: "id",
        type: "string",
        required: true,
        description: "Agent ID"
      }
    ]
  },
  {
    method: "GET",
    path: "/api/license_release/visit/{url:path}",
    description: "Visits URL and extracts metadata for license release",
    category: "License Management",
    icon: <Globe className="w-4 h-4" />,
    pathParams: [
      {
        name: "url",
        type: "string",
        required: true,
        description: "Full URL path to visit and extract metadata"
      }
    ]
  },
  {
    method: "POST",
    path: "/api/license_release/run/{url:path}",
    description: "Runs license release automation for specific URL and agent",
    category: "License Management",
    icon: <Settings className="w-4 h-4" />,
    pathParams: [
      {
        name: "url",
        type: "string",
        required: true,
        description: "Base URL for license release automation"
      }
    ],
    requestBody: {
      type: "JSON",
      fields: [
        {
          name: "agent_name",
          type: "string",
          required: true,
          description: "Full name of agent"
        }
      ]
    }
  },
  {
    method: "PUT",
    path: "/api/disableStock/{id}",
    description: "Disables stock options for agent by ID",
    category: "Agent Management",
    icon: <Database className="w-4 h-4" />,
    pathParams: [
      {
        name: "id",
        type: "string",
        required: true,
        description: "Agent ID"
      }
    ]
  },
  {
    method: "GET",
    path: "/api/state/{state}/agent/{agent_id}",
    description: "Gets agent details from state-specific services",
    category: "State Services",
    icon: <User className="w-4 h-4" />,
    pathParams: [
      {
        name: "state",
        type: "string",
        required: true,
        description: "State name or code (e.g., 'georgia', 'ga', 'california', 'ca')"
      },
      {
        name: "agent_id",
        type: "string",
        required: true,
        description: "Agent ID"
      }
    ],
    supportedStates: ["Georgia (GA)", "California (CA)"]
  },
  {
    method: "POST",
    path: "/api/state/{state}/offboard/{agent_id}",
    description: "Processes agent offboarding for specific state",
    category: "State Services",
    icon: <Settings className="w-4 h-4" />,
    pathParams: [
      {
        name: "state",
        type: "string",
        required: true,
        description: "State name or code (e.g., 'georgia', 'ga', 'california', 'ca')"
      },
      {
        name: "agent_id",
        type: "string",
        required: true,
        description: "Agent ID"
      }
    ],
    supportedStates: ["Georgia (GA)", "California (CA)"]
  },
  {
    method: "POST",
    path: "/api/zendesk/create_ticket",
    description: "Creates Zendesk support ticket",
    category: "Support",
    icon: <Mail className="w-4 h-4" />,
    requestBody: {
      type: "JSON",
      fields: [
        {
          name: "subject",
          type: "string",
          required: true,
          description: "Ticket subject"
        },
        {
          name: "description",
          type: "string",
          required: true,
          description: "Ticket description"
        }
      ]
    }
  },
  {
    method: "POST",
    path: "/api/send_termination_email/{agent_id}",
    description: "Sends termination email to agent",
    category: "Agent Management",
    icon: <Mail className="w-4 h-4" />,
    pathParams: [
      {
        name: "agent_id",
        type: "string",
        required: true,
        description: "Agent ID"
      }
    ]
  },
  {
    method: "PUT",
    path: "/api/agent/{agent_id}",
    description: "Terminates agent with detailed termination information",
    category: "Agent Management",
    icon: <User className="w-4 h-4" />,
    pathParams: [
      {
        name: "agent_id",
        type: "string",
        required: true,
        description: "Agent ID"
      }
    ],
    requestBody: {
      type: "JSON",
      fields: [
        {
          name: "eligibleForRehire",
          type: "boolean",
          required: true,
          description: "Whether agent is eligible for rehire"
        },
        {
          name: "terminationReason",
          type: "string",
          required: true,
          description: "Termination reason",
          enum: [
            "LEFT_INDUSTRY",
            "LEFT_BROKERAGE_VOLUNTARILY", 
            "INITIATED_BY_REAL",
            "DISCIPLINARY",
            "DECEASED",
            "REORG",
            "LICENSE_EXPIRED",
            "UNPAID_FEES",
            "DUPLICATE",
            "OTHER"
          ]
        },
        {
          name: "terminationReasonDetails",
          type: "string",
          required: true,
          description: "Additional termination details"
        }
      ]
    }
  }
]

const categories = Array.from(new Set(apiEndpoints.map(endpoint => endpoint.category)))

function MethodBadge({ method }: { method: string }) {
  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-500/20 text-green-300 border-green-400/30"
      case "POST":
        return "bg-blue-500/20 text-blue-300 border-blue-400/30"
      case "PUT":
        return "bg-orange-500/20 text-orange-300 border-orange-400/30"
      case "DELETE":
        return "bg-red-500/20 text-red-300 border-red-400/30"
      default:
        return "bg-breeze-500/20 text-breeze-300 border-breeze-400/30"
    }
  }

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${getMethodColor(method)}`}>
      {method}
    </span>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
      title="Copy endpoint"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Copy className="w-4 h-4 text-breeze-400" />
      )}
    </button>
  )
}

function ParameterList({ params, title }: { params: ApiParameter[], title: string }) {
  if (!params || params.length === 0) return null

  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-breeze-200 mb-2">{title}</h4>
      <div className="space-y-2">
        {params.map((param, index) => (
          <div key={index} className="bg-breeze-800/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <code className="text-ocean-300 font-mono text-sm">{param.name}</code>
              <span className={`text-xs px-2 py-1 rounded ${
                param.required 
                  ? 'bg-red-500/20 text-red-300' 
                  : 'bg-breeze-500/20 text-breeze-300'
              }`}>
                {param.type}
              </span>
              {param.required && (
                <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                  Required
                </span>
              )}
            </div>
            {param.description && (
              <p className="text-breeze-400 text-xs">{param.description}</p>
            )}
            {param.enum && (
              <div className="mt-2">
                <p className="text-xs text-breeze-400 mb-1">Valid values:</p>
                <div className="flex flex-wrap gap-1">
                  {param.enum.map((value, i) => (
                    <code key={i} className="text-xs bg-breeze-700/50 text-breeze-200 px-2 py-1 rounded">
                      {value}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ApiEndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  return (
    <div className="glass-card p-6 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-ocean-500/20 rounded-lg">
            {endpoint.icon}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <MethodBadge method={endpoint.method} />
              <code className="text-breeze-200 font-mono text-sm bg-breeze-800/50 px-2 py-1 rounded">
                {endpoint.path}
              </code>
            </div>
          </div>
        </div>
        <CopyButton text={`${endpoint.method} ${endpoint.path}`} />
      </div>
      
      <p className="text-breeze-300 text-sm leading-relaxed mb-4">
        {endpoint.description}
      </p>

      {/* Path Parameters */}
      <ParameterList params={endpoint.pathParams || []} title="Path Parameters" />

      {/* Query Parameters */}
      <ParameterList params={endpoint.queryParams || []} title="Query Parameters" />

      {/* Request Body */}
      {endpoint.requestBody && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-breeze-200 mb-2">Request Body ({endpoint.requestBody.type})</h4>
          <div className="bg-breeze-800/30 rounded-lg p-3">
            <pre className="text-xs text-breeze-300 font-mono">
{`{`}
{endpoint.requestBody.fields.map((field, index) => (
  <div key={index} className="ml-2">
    <span className="text-ocean-300">"{field.name}"</span>
    <span className="text-breeze-400">: </span>
    <span className="text-accent-300">{field.type}</span>
    {!field.required && <span className="text-breeze-500"> // Optional</span>}
    {index < endpoint.requestBody!.fields.length - 1 && <span className="text-breeze-400">,</span>}
  </div>
))}
{`}`}
            </pre>
          </div>
        </div>
      )}

      {/* Supported States */}
      {endpoint.supportedStates && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-breeze-200 mb-2">Supported States</h4>
          <div className="flex flex-wrap gap-2">
            {endpoint.supportedStates.map((state, index) => (
              <span key={index} className="text-xs bg-ocean-500/20 text-ocean-300 px-2 py-1 rounded">
                {state}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CategorySection({ category, endpoints }: { category: string, endpoints: ApiEndpoint[] }) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-breeze-600 hover:text-breeze-800 transition-colors duration-200 mb-4"
      >
        <ChevronRight 
          className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
        />
        <h2 className="text-xl font-semibold">{category}</h2>
        <span className="text-breeze-400 text-sm">({endpoints.length})</span>
      </button>
      
      {isExpanded && (
        <div className="space-y-4">
          {endpoints.map((endpoint, index) => (
            <ApiEndpointCard key={index} endpoint={endpoint} />
          ))}
        </div>
      )}
    </div>
  )
}

function ApiDocsContent() {
  return (
    <Layout title="API Docs">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-ocean-500/20 rounded-xl">
              <BookOpen className="w-8 h-8 text-ocean-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-breeze-800 mb-2">API Docs</h1>
              <p className="text-breeze-300 text-lg">
                Complete reference for the Automation Frontend API endpoints
              </p>
            </div>
          </div>
          
          {/* Introduction */}
          <div className="glass-card p-6 mb-8">
            <h2 className="text-2xl font-semibold text-breeze-800 mb-4">Introduction</h2>
            <p className="text-breeze-300 leading-relaxed mb-4">
              The Automation Frontend API is organized around REST principles. Our API has predictable 
              resource-oriented URLs, accepts JSON-encoded request bodies, returns JSON-encoded responses, 
              and uses standard HTTP response codes, authentication, and verbs.
            </p>
            
            <div className="bg-accent-500/10 border border-accent-400/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-accent-500/20 rounded">
                  <Code className="w-4 h-4 text-accent-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-accent-200 mb-2">Base URL</h3>
                  <code className="text-accent-300 font-mono bg-breeze-800/50 px-2 py-1 rounded">
                    https://your-domain.com/api
                  </code>
                  <p className="text-accent-300/80 text-sm mt-2">
                    All API endpoints are prefixed with <code>/api</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Endpoints by Category */}
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryEndpoints = apiEndpoints.filter(endpoint => endpoint.category === category)
            return (
              <CategorySection 
                key={category} 
                category={category} 
                endpoints={categoryEndpoints} 
              />
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-breeze-800 mb-2">Need Help?</h3>
                <p className="text-breeze-300 text-sm">
                  For additional support or questions about the API, please contact the development team.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-ocean-400">
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">External Resources</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function ApiDocs() {
  return (
    <AuthGuard>
      <ApiDocsContent />
    </AuthGuard>
  )
}

export default ApiDocs
