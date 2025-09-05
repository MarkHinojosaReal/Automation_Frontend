import React from "react"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"
import type { TimeSeriesData } from "../types"

interface ReportChartProps {
  title: string
  data: TimeSeriesData[]
  type?: "line" | "bar"
}

export function ReportChart({ title, data, type = "line" }: ReportChartProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="created" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Created"
              />
              <Line 
                type="monotone" 
                dataKey="resolved" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Resolved"
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="created" fill="#3b82f6" name="Created" />
              <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
