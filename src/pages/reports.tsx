import React from "react"
import { Layout } from "../components/Layout"
import { AuthGuard } from "../components/AuthGuard"
import { StatsCard } from "../components/StatsCard"
import { ChartCard } from "../components/ChartCard"
import { ReportChart } from "../components/ReportChart"
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock,
  Download
} from "lucide-react"
import { 
  mockDashboardStats, 
  mockPriorityData, 
  mockStatusData, 
  mockTimeSeriesData 
} from "../utils/mockData"

function ReportsPageContent() {
  return (
    <Layout title="Reports & Analytics">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-white/70 mt-1">
            Track performance and analyze ticket trends
          </p>
        </div>
        <button className="btn-secondary flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Resolution Rate"
          value={87}
          icon={TrendingUp}
          color="bg-green-500"
          trend={{ value: 12, direction: "up" }}
        />
        <StatsCard
          title="Avg Resolution Time"
          value={2.3}
          icon={Clock}
          color="bg-blue-500"
          trend={{ value: 8, direction: "down" }}
        />
        <StatsCard
          title="Team Velocity"
          value={24}
          icon={Activity}
          color="bg-purple-500"
          trend={{ value: 15, direction: "up" }}
        />
        <StatsCard
          title="Backlog Growth"
          value={5}
          icon={TrendingDown}
          color="bg-orange-500"
          trend={{ value: 3, direction: "down" }}
        />
      </div>

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ReportChart
          title="Tickets Created vs Resolved"
          data={mockTimeSeriesData}
          type="line"
        />
        <ReportChart
          title="Weekly Ticket Volume"
          data={mockTimeSeriesData}
          type="bar"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Priority Distribution" data={mockPriorityData} />
        <ChartCard title="Status Distribution" data={mockStatusData} />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Top Contributors</h3>
          <div className="space-y-3">
            {[
              { name: "Jane Smith", tickets: 12, avatar: "JS" },
              { name: "John Doe", tickets: 8, avatar: "JD" },
              { name: "Mike Johnson", tickets: 6, avatar: "MJ" }
            ].map((contributor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      {contributor.avatar}
                    </span>
                  </div>
                  <span className="font-medium text-white">{contributor.name}</span>
                </div>
                <span className="text-sm text-white/60">{contributor.tickets} tickets</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Project Health</h3>
          <div className="space-y-3">
            {[
              { name: "Web Application", health: 85, color: "bg-green-500" },
              { name: "Mobile App", health: 72, color: "bg-yellow-500" },
              { name: "API Services", health: 91, color: "bg-green-500" }
            ].map((project, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{project.name}</span>
                  <span className="text-sm text-white/60">{project.health}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${project.color}`}
                    style={{ width: `${project.health}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: "Ticket WEB-101 resolved", time: "2 hours ago" },
              { action: "New ticket MOB-205 created", time: "4 hours ago" },
              { action: "Ticket API-302 assigned", time: "6 hours ago" }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="text-xs text-white/50">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function ReportsPage() {
  return (
    <AuthGuard>
      <ReportsPageContent />
    </AuthGuard>
  )
}

export default ReportsPage

export function Head() {
  return (
    <>
      <title>Reports - YouTrack</title>
      <meta name="description" content="Analytics and reporting dashboard" />
    </>
  )
}
