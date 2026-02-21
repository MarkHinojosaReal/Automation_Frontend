import React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from "recharts"
import type { ChartData } from "../types"

interface BarChartCardProps {
  title: string
  data: ChartData[]
}

export function BarChartCard({ title, data }: BarChartCardProps) {
  return (
    <div className="card">
      <h3 className="text-xl font-bold text-breeze-800 mb-6">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="2 2" 
              stroke="#e2e8f0" 
              vertical={false}
              opacity={0.6}
            />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              angle={0}
              height={40}
              dy={10}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              dx={-10}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            >
              <LabelList 
                dataKey="value" 
                position="top" 
                fill="#475569" 
                fontSize={12} 
                fontWeight={600}
              />
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  fillOpacity={0.9}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

