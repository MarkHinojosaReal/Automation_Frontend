import React, { useState, useEffect } from "react"
import { Layout } from "../components/Layout"
import { AuthGuard } from "../components/AuthGuard"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { ErrorMessage } from "../components/ErrorMessage"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts"
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity,
  Calendar,
  Zap
} from "lucide-react"

interface AutomationExecution {
  id: string
  automation_id: string
  automation_start_time: string
  automation_end_time: string
  status: string
  duration_seconds: number
}

interface MetricsData {
  totalExecutions: number
  successRate: number
  averageDuration: number
  executionsByStatus: Array<{ name: string; value: number; color: string }>
  executionsByDay: Array<{ date: string; executions: number }>
  executionsByAutomation: Array<{ automation_id: string; count: number; avg_duration: number }>
  durationTrend: Array<{ time: string; duration: number }>
  recentExecutions: Array<{
    id: string
    automation_id: string
    automation_start_time: string
    automation_end_time: string
    status: string
    duration_seconds: number
  }>
}

function MetricsPageContent() {
  const [data, setData] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetricsData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Use proxy server in development, direct API in production
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api/metrics'
        : '/api/metrics'
      
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const metricsData = await response.json()
      setData(metricsData)
    } catch (err) {
      // Handle development environment database connection issues gracefully
      if (err instanceof Error && (err.message.includes('503') || err.message.includes('timeout'))) {
        setError('Development environment: Database connection unavailable. Metrics will work in production.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load metrics data')
      }
      console.error('Error fetching metrics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetricsData()
  }, [])

  if (loading) {
    return (
      <Layout title="Metrics">
        <LoadingSpinner message="Loading automation metrics..." />
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Metrics">
        <ErrorMessage 
          message={`Failed to load metrics: ${error}`}
          onRetry={fetchMetricsData}
        />
      </Layout>
    )
  }

  if (!data) {
    return (
      <Layout title="Metrics">
        <div className="text-center py-12">
          <p className="text-breeze-600">No metrics data available.</p>
        </div>
      </Layout>
    )
  }

  const formatDuration = (seconds: number | null | undefined) => {
    if (seconds == null || isNaN(seconds)) return '0s'
    const validSeconds = Number(seconds)
    if (validSeconds < 60) return `${validSeconds.toFixed(1)}s`
    if (validSeconds < 3600) return `${(validSeconds / 60).toFixed(1)}m`
    return `${(validSeconds / 3600).toFixed(1)}h`
  }

  return (
    <Layout title="Automation Metrics">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-breeze-600 text-sm font-medium">Total Executions</p>
                <p className="text-3xl font-bold text-breeze-800">{data.totalExecutions}</p>
              </div>
              <div className="p-3 bg-ocean-500/20 rounded-xl">
                <Activity className="w-6 h-6 text-ocean-600" />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-breeze-600 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-green-700">{data.successRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-breeze-600 text-sm font-medium">Avg Duration</p>
                <p className="text-3xl font-bold text-breeze-800">{formatDuration(data.averageDuration)}</p>
              </div>
              <div className="p-3 bg-accent-500/20 rounded-xl">
                <Clock className="w-6 h-6 text-accent-600" />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-breeze-600 text-sm font-medium">Active Automations</p>
                <p className="text-3xl font-bold text-breeze-800">{data.executionsByAutomation.length}</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Status Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-breeze-800 mb-6 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Execution Status Distribution</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.executionsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.executionsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value, 'Executions']}
                    labelFormatter={(label) => `Status: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {data.executionsByStatus.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-breeze-700">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Executions by Day */}
          <div className="card">
            <h3 className="text-lg font-semibold text-breeze-800 mb-6 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-ocean-600" />
              <span>Daily Execution Volume</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.executionsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Executions']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="executions"
                    stroke="#0ea5e9"
                    fill="url(#colorExecutions)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorExecutions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Execution Duration Trend */}
          <div className="card">
            <h3 className="text-lg font-semibold text-breeze-800 mb-6 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-accent-600" />
              <span>Execution Duration Trend</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.durationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12}
                    tickFormatter={(value) => formatDuration(value)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatDuration(value), 'Duration']}
                    labelFormatter={(label) => `Time: ${label}`}
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="duration"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Executions by Automation */}
          <div className="card">
            <h3 className="text-lg font-semibold text-breeze-800 mb-6 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <span>Performance by Automation</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.executionsByAutomation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="automation_id" 
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => value.slice(0, 8) + '...'}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'count') return [value, 'Executions']
                      if (name === 'avg_duration') return [formatDuration(value), 'Avg Duration']
                      return [value, name]
                    }}
                    labelFormatter={(label) => `Automation: ${label.slice(0, 16)}...`}
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" name="count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Executions Table */}
        <div className="card">
          <h3 className="text-lg font-semibold text-breeze-800 mb-6 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-breeze-600" />
            <span>Recent Executions</span>
          </h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-breeze-700 text-sm">Automation ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-breeze-700 text-sm">Start Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-breeze-700 text-sm">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold text-breeze-700 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentExecutions?.map((execution) => (
                  <tr key={execution.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <code className="text-xs bg-slate-200 px-2 py-1 rounded font-mono text-breeze-800">
                        {execution.automation_id.slice(0, 8)}...
                      </code>
                    </td>
                    <td className="py-3 px-4 text-sm text-breeze-600">
                      {new Date(execution.automation_start_time).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-breeze-700 font-medium">
                      {formatDuration(execution.duration_seconds)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        execution.status === 'Passed' 
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : execution.status === 'Failed'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {execution.status}
                      </span>
                    </td>
                  </tr>
                )) || []}
                {(!data.recentExecutions || data.recentExecutions.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-breeze-500">
                      No recent executions found
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center">
          <p className="text-breeze-500 text-sm">
            Last Updated: {new Date().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </Layout>
  )
}

function MetricsPage() {
  return (
    <AuthGuard>
      <MetricsPageContent />
    </AuthGuard>
  )
}

export default MetricsPage

export function Head() {
  return (
    <>
      <title>Automation Metrics - YouTrack</title>
      <meta name="description" content="Analytics and performance metrics for automation executions" />
    </>
  )
}