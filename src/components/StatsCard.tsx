import React from "react"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: string
  trend?: {
    value: number
    direction: "up" | "down"
  }
}

export function StatsCard({ title, value, icon: Icon, color, trend }: StatsCardProps) {
  // Map old colors to new gradient classes
  const getGradientClass = (color: string) => {
    switch (color) {
      case 'bg-blue-500':
        return 'from-ocean-400 to-ocean-600'
      case 'bg-orange-500':
        return 'from-accent-400 to-accent-600'
      case 'bg-green-500':
        return 'from-emerald-400 to-emerald-600'
      case 'bg-purple-500':
        return 'from-purple-400 to-purple-600'
      case 'bg-indigo-500':
        return 'from-indigo-400 to-indigo-600'
      case 'bg-yellow-500':
        return 'from-yellow-400 to-yellow-600'
      default:
        return 'from-ocean-400 to-ocean-600'
    }
  }

  return (
    <div className="stats-card group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/70 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.direction === "up" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {trend.direction === "up" ? "+" : "-"}{Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-white/50 ml-1">vs last week</span>
            </div>
          )}
        </div>
        <div
          className={`p-4 rounded-xl bg-gradient-to-br ${getGradientClass(color)} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}
