import React from "react"

interface StatsCardProps {
  title: string
  value: number
  href?: string
}

export function StatsCard({ title, value, href }: StatsCardProps) {
  const content = (
    <div className="flex flex-col items-center justify-center text-center">
      <p className="text-sm font-medium text-breeze-600 mb-2">{title}</p>
      <p className="text-4xl font-bold text-breeze-800">{value}</p>
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="stats-card block cursor-pointer hover:shadow-xl transition-shadow duration-200">
        {content}
      </a>
    )
  }

  return <div className="stats-card">{content}</div>
}
