import React from "react"
import { Sidebar } from "./Sidebar"

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen relative">
      <div className="flex relative z-10">
        <Sidebar />
        <main className="flex-1 p-6 ml-64 min-h-screen">
          <div className="max-w-7xl mx-auto relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
