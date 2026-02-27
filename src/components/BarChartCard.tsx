import React, { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from "recharts"
import type { ChartData } from "../types"

interface BarChartCardProps {
  title: string
  data: ChartData[]
  onBarClick?: (name: string) => void
}

interface BarShapeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  index?: number
}

export function BarChartCard({ title, data, onBarClick }: BarChartCardProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <div className="glass-card p-4 sm:p-6">
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
              maxBarSize={60}
              cursor={onBarClick ? 'pointer' : 'default'}
              onClick={onBarClick ? (entry) => onBarClick(entry.name) : undefined}
              onMouseEnter={(_: unknown, index: number) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              shape={(props: unknown) => {
                const { x = 0, y = 0, width = 0, height = 0, index = 0 } = props as BarShapeProps
                const isActive = index === activeIndex
                const pop = isActive ? 4 : 0
                return (
                  <rect
                    x={x}
                    y={y - pop}
                    width={width}
                    height={height + pop}
                    fill={data[index]?.color ?? '#888'}
                    fillOpacity={isActive ? 1 : 0.9}
                    rx={4}
                    ry={4}
                  />
                )
              }}
            >
              <LabelList
                dataKey="value"
                position="top"
                fill="#475569"
                fontSize={12}
                fontWeight={600}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
