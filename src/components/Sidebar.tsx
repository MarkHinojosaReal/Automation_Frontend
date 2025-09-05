import React from "react"
import { Link } from "gatsby"
import { 
  Home, 
  Ticket, 
  Folder,
  Bot,
  Zap
} from "lucide-react"

interface SidebarItemProps {
  to: string
  icon: React.ReactNode
  label: string
  isActive?: boolean
  accent?: boolean
}

function SidebarItem({ to, icon, label, isActive = false, accent = false }: SidebarItemProps) {
  return (
    <Link
      to={to}
      className={`menu-item flex items-center space-x-3 px-4 py-3 mx-2 transition-all duration-300 ${
        isActive
          ? "menu-item active"
          : accent
          ? "text-accent-200 hover:text-accent-100 hover:bg-accent-500/10"
          : "text-white/70 hover:text-white/90"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {accent && (
        <div className="ml-auto w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
      )}
    </Link>
  )
}

export function Sidebar() {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/"
  
  const menuItems = [
    { to: "/", icon: <Home className="w-5 h-5" />, label: "Home" },
    { to: "/projects", icon: <Folder className="w-5 h-5" />, label: "Projects" },
    { to: "/tickets", icon: <Ticket className="w-5 h-5" />, label: "Tasks" },
    { to: "/automation-impact", icon: <Zap className="w-5 h-5" />, label: "Automation Impact" },
    { to: "/request", icon: <Bot className="w-5 h-5" />, label: "Request Automation", accent: true }
  ]

  // Helper function to determine if a menu item is active
  const isActive = (itemPath: string) => {
    if (itemPath === "/") {
      return currentPath === "/" || currentPath === ""
    }
    return currentPath.startsWith(itemPath)
  }

  return (
    <aside className="w-64 sidebar-glass fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={isActive(item.to)}
            accent={item.accent}
          />
        ))}
      </nav>
      
      {/* Decorative gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ocean-900/20 to-transparent pointer-events-none" />
    </aside>
  )
}
