import React from "react"
import { Link } from "gatsby"

interface HeaderProps {
  title?: string
}

export function Header({ title = "YouTrack Dashboard" }: HeaderProps) {
  return (
    <header className="nav-glass h-20 fixed top-0 left-64 right-0 z-40">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xs">ATOP</span>
            </div>
            <h1 className="text-xl font-semibold text-breeze-800">{title}</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Request Automation Button */}
          <Link
            to="/request"
            className="btn-primary bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Request Automation
          </Link>
        </div>
      </div>
    </header>
  )
}
