import React, { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Menu, X, User, LogOut } from "lucide-react"
import logo from "../images/logo.png"
import { useAuth } from "../contexts/AuthContext"

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export function Layout({ children, title }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  
  // Try to get auth context, but handle case where it might not exist (e.g., login page)
  let user = null
  let logout = () => {}
  
  try {
    const auth = useAuth()
    user = auth.user
    logout = auth.logout
  } catch (error) {
    // AuthContext not available (e.g., on login page) - that's okay
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen relative">
      {/* Mobile Header */}
      <div className="lg:hidden bg-ocean-600 shadow-lg relative z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Automation Ops" className="h-12 w-auto" />
            {title && <h1 className="text-white font-semibold text-lg">{title}</h1>}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSidebar}
              className="text-white p-2 hover:bg-ocean-700 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-white p-2 hover:bg-ocean-700 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">{user?.name || user?.email}</span>
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
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
