import React, { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
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
  let logout: (() => Promise<void>) | (() => void) = () => {}
  
  try {
    const auth = useAuth()
    user = auth.user
    logout = auth.logout
  } catch (error) {
    // AuthContext not available (e.g., on login page) - that's okay
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
    setIsUserMenuOpen(false)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const handleLogout = async () => {
    setIsUserMenuOpen(false)
    await logout()
  }

  return (
    <div className="min-h-screen relative">
      <Header
        title={title}
        isMobile
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        user={user}
        isUserMenuOpen={isUserMenuOpen}
        onToggleUserMenu={toggleUserMenu}
        onLogout={handleLogout}
      />
      <Header title={title} />

      <div className="flex relative">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => {
            setIsSidebarOpen(false)
            setIsUserMenuOpen(false)
          }}
        />
        <main className="flex-1 p-4 lg:p-6 lg:ml-64 min-h-screen pt-20 lg:pt-24">
          <div className="max-w-7xl mx-auto relative">
            {children}
          </div>
        </main>
        
        <div
          className={`fixed inset-0 z-40 lg:hidden bg-black/50 transition-opacity duration-400 ease-out ${
            isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => {
            setIsSidebarOpen(false)
            setIsUserMenuOpen(false)
          }}
        />
      </div>
    </div>
  )
}
