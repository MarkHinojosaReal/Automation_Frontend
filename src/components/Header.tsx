import React from "react"
import { Menu, X, User, LogOut } from "lucide-react"

interface HeaderUser {
  name: string
  email: string
}

interface HeaderProps {
  title?: string
  isMobile?: boolean
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
  user?: HeaderUser | null
  isUserMenuOpen?: boolean
  onToggleUserMenu?: () => void
  onLogout?: () => void
}

export function Header({
  title = "Automation Ops",
  isMobile = false,
  isSidebarOpen = false,
  onToggleSidebar,
  user = null,
  isUserMenuOpen = false,
  onToggleUserMenu,
  onLogout
}: HeaderProps) {
  const containerClassName = isMobile
    ? "lg:hidden nav-glass fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-breeze-200/85 border-b border-breeze-300/80"
    : "hidden lg:block nav-glass fixed top-0 left-64 right-0 z-40 backdrop-blur-lg bg-breeze-200/80 border-b border-breeze-300/80"

  return (
    <header className={`${containerClassName} h-20`}>
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold text-breeze-800">{title}</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {isMobile && (
            <>
              <button
                onClick={onToggleSidebar}
                className="text-breeze-800 p-2 hover:bg-white/50 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {user && (
                <div className="relative">
                  <button
                    onClick={onToggleUserMenu}
                    className="flex items-center space-x-2 text-breeze-800 p-2 hover:bg-white/50 rounded-lg transition-colors"
                    aria-label="Open user menu"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm hidden sm:block">{user.name || user.email}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white/90 backdrop-blur-md rounded-xl shadow-xl py-2 z-50 border border-white/50">
                      <div className="px-4 py-2 border-b border-breeze-200">
                        <p className="text-sm font-medium text-breeze-900">{user.name}</p>
                        <p className="text-xs text-breeze-700 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={onLogout}
                        className="w-full px-4 py-2 text-left text-sm text-breeze-800 hover:bg-breeze-100 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
