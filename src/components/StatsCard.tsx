import React from "react"

interface StatsCardProps {
  title: string
  value: number
}

export function StatsCard({ title, value }: StatsCardProps) {
  return (
    <div className="stats-card">
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-breeze-600 mb-2">{title}</p>
        <p className="text-4xl font-bold text-breeze-800">{value}</p>
      </div>
    </div>
  )
}
