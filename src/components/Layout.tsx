import React from "react"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ocean-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-ocean-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>
      
      <Header title={title} />
      <div className="flex relative z-10 pt-16">
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
