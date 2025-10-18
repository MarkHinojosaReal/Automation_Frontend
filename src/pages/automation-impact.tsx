import React, { useState } from "react"
import { Layout } from "../components/Layout"
import { AuthGuard } from "../components/AuthGuard"
import { 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Target,
  Calendar,
  Filter,
  Search
} from "lucide-react"

interface AutomationProject {
  id: string
  title: string
  projectLead: string
  status: 'completed' | 'in-flight' | 'planned'
  timeImpact: {
    hours: number
    frequency: 'one-time' | 'yearly' | 'monthly' | 'per-transaction'
    details?: string
  }
  category: string
  description?: string
}

const automationProjects: AutomationProject[] = [
  {
    id: '1',
    title: 'Automated Deactivation for Non-Compliant TCs',
    projectLead: 'Akash Bawa',
    status: 'completed',
    timeImpact: { hours: 10, frequency: 'one-time' },
    category: 'Compliance',
    description: 'Automatically deactivate team captains who fail to meet compliance requirements'
  },
  {
    id: '2',
    title: 'Automation for Application Cleanup',
    projectLead: 'Akash Bawa',
    status: 'completed',
    timeImpact: { hours: 35, frequency: 'one-time' },
    category: 'Operations',
    description: 'Streamline application cleanup processes to reduce manual overhead'
  },
  {
    id: '3',
    title: 'Nashville ICA Automation',
    projectLead: 'Akash Bawa',
    status: 'completed',
    timeImpact: { hours: 13, frequency: 'one-time' },
    category: 'Legal',
    description: 'Automate Independent Contractor Agreement processes for Nashville market'
  },
  {
    id: '4',
    title: 'Pro Team Migration',
    projectLead: 'Akash Bawa',
    status: 'completed',
    timeImpact: { hours: 4500, frequency: 'one-time' },
    category: 'Infrastructure',
    description: 'Major system migration for Pro Team functionality'
  },
  {
    id: '5',
    title: 'Non-Compliance Sheet Automation',
    projectLead: 'Akash Bawa',
    status: 'completed',
    timeImpact: { hours: 200, frequency: 'yearly' },
    category: 'Compliance',
    description: 'Automated generation and processing of non-compliance tracking sheets'
  },
  {
    id: '6',
    title: 'Lawyer Contact Sync',
    projectLead: 'Mark Hinojosa',
    status: 'in-flight',
    timeImpact: { 
      hours: 127, 
      frequency: 'one-time',
      details: 'Contact Creation: ~127 Hours, Per Transaction: ~3,900 – 6,500 Hours/yr'
    },
    category: 'Legal',
    description: 'Synchronize lawyer contact information across systems'
  }
]

function AutomationImpactPageContent() {
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProjects = automationProjects.filter(project => {
    const matchesFilter = filter === 'all' || project.status === filter
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.projectLead.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
      case 'in-flight': return 'text-accent-400 bg-accent-400/10 border-accent-400/30'
      case 'planned': return 'text-ocean-400 bg-ocean-400/10 border-ocean-400/30'
      default: return 'text-breeze-400 bg-breeze-400/10 border-breeze-400/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />
      case 'in-flight': return <Clock className="w-4 h-4" />
      case 'planned': return <Calendar className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatTimeImpact = (timeImpact: AutomationProject['timeImpact']) => {
    const { hours, frequency, details } = timeImpact
    
    if (details) {
      return details
    }
    
    let formattedHours = hours.toLocaleString()
    if (hours >= 1000) {
      formattedHours = `${(hours / 1000).toFixed(1)}k`
    }
    
    const frequencyText = frequency === 'one-time' ? '' : `/${frequency.replace('-', ' ')}`
    return `~${formattedHours} Hours${frequencyText}`
  }

  const getTotalImpact = () => {
    return filteredProjects.reduce((total, project) => {
      return total + project.timeImpact.hours
    }, 0)
  }

  const getCompletedProjects = () => {
    return filteredProjects.filter(p => p.status === 'completed').length
  }

  const getInFlightProjects = () => {
    return filteredProjects.filter(p => p.status === 'in-flight').length
  }

  return (
    <Layout title="Automation Impact">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Automation Impact</h1>
              <p className="text-white/70 mt-1">
                Track the efficiency gains and time savings from our automation initiatives
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stats-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-400/20 rounded-lg">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{getTotalImpact().toLocaleString()}</h3>
            <p className="text-white/70 text-sm">Total Hours Saved</p>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-400/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{getCompletedProjects()}</h3>
            <p className="text-white/70 text-sm">Completed Projects</p>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-accent-400/20 rounded-lg">
                <Clock className="w-5 h-5 text-accent-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{getInFlightProjects()}</h3>
            <p className="text-white/70 text-sm">In Progress</p>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-ocean-400/20 rounded-lg">
                <Users className="w-5 h-5 text-ocean-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">2</h3>
            <p className="text-white/70 text-sm">Project Leads</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects, leads, or categories..."
                  className="input-glass pl-10 pr-4 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-white/70" />
              <select
                className="input-glass min-w-[140px]"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in-flight">In Flight</option>
                <option value="planned">Planned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="card hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
                    {project.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-white/70 mb-3">
                    <Users className="w-4 h-4" />
                    <span>Project Lead: {project.projectLead}</span>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                  {getStatusIcon(project.status)}
                  <span className="capitalize">{project.status.replace('-', ' ')}</span>
                </div>
              </div>

              {project.description && (
                <p className="text-white/80 text-sm mb-4 leading-relaxed">
                  {project.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-emerald-400/20 rounded-lg">
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-emerald-400 font-semibold text-sm">
                      {formatTimeImpact(project.timeImpact)}
                    </div>
                    {project.timeImpact.frequency !== 'one-time' && (
                      <div className="text-white/50 text-xs capitalize">
                        {project.timeImpact.frequency.replace('-', ' ')} savings
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-2 py-1 bg-ocean-400/10 rounded-lg">
                  <span className="text-ocean-300 text-xs font-medium">
                    {project.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="card text-center py-12">
            <BarChart3 className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white/70 mb-2">No Projects Found</h3>
            <p className="text-white/50">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

function AutomationImpactPage() {
  return (
    <AuthGuard>
      <AutomationImpactPageContent />
    </AuthGuard>
  )
}

export default AutomationImpactPage

export function Head() {
  return (
    <>
      <title>Automation Impact - YouTrack</title>
      <meta name="description" content="Track automation efficiency gains and time savings" />
    </>
  )
}