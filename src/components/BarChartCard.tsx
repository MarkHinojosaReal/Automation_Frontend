import React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { ChartData } from "../types"

interface BarChartCardProps {
  title: string
  data: ChartData[]
}

export function BarChartCard({ title, data }: BarChartCardProps) {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-xl border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].payload.name}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: payload[0].payload.color }}>
            {payload[0].value}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-breeze-800 mb-6">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              {data.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e2e8f0" 
              vertical={false}
              opacity={0.5}
            />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
              axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
              tickLine={false}
              angle={0}
              height={40}
            />
            <YAxis 
              tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
              axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            <Bar 
              dataKey="value" 
              radius={[12, 12, 0, 0]}
              maxBarSize={80}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#gradient-${index})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

