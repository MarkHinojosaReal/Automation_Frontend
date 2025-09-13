import React, { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Menu, X } from "lucide-react"

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export function Layout({ children, title }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="min-h-screen relative">
      {/* Mobile Header */}
      <div className="lg:hidden bg-ocean-600 shadow-lg relative z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xs">ATOP</span>
            </div>
            {title && <h1 className="text-white font-semibold text-lg">{title}</h1>}
          </div>
          <button
            onClick={toggleSidebar}
            className="text-white p-2 hover:bg-ocean-700 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="flex relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 p-4 lg:p-6 lg:ml-64 min-h-screen pt-20 lg:pt-6">
          <div className="max-w-7xl mx-auto relative">
            {children}
          </div>
        </main>
        
        {/* Mobile overlay - only visible when sidebar is open */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
