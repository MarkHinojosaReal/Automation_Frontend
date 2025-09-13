import React from "react"
import { Link } from "gatsby"
import { 
  Home, 
  Ticket, 
  Folder,
  Bot,
  Zap,
  Play,
  BookOpen,
  BarChart3
} from "lucide-react"

interface SidebarItemProps {
  to: string
  icon: React.ReactNode
  label: string
  isActive?: boolean
  accent?: boolean
  onClick?: () => void
}

function SidebarItem({ to, icon, label, isActive = false, accent = false, onClick }: SidebarItemProps) {
  return (
    <Link
      to={to}
      className={`menu-item flex items-center space-x-3 px-4 py-3 mx-2 transition-all duration-300 relative z-20 ${
        isActive
          ? `menu-item active ${accent ? 'accent' : ''}`
          : accent
          ? "bg-accent-500 hover:bg-accent-600 text-white rounded-lg shadow-lg hover:shadow-xl font-medium"
          : "text-white/70 hover:text-white/90"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  )
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/"
  
  const menuItems = [
    { to: "/", icon: <Home className="w-5 h-5" />, label: "Home" },
    { to: "/projects", icon: <Folder className="w-5 h-5" />, label: "Projects" },
    { to: "/tasks", icon: <Ticket className="w-5 h-5" />, label: "Tasks" },
    { to: "/metrics", icon: <BarChart3 className="w-5 h-5" />, label: "Metrics" },
    { to: "/tools", icon: <Play className="w-5 h-5" />, label: "Tools" },
    { to: "/request", icon: <Bot className="w-5 h-5" />, label: "New Request", accent: true }
  ]

  // Helper function to determine if a menu item is active
  const isActive = (itemPath: string) => {
    if (itemPath === "/") {
      return currentPath === "/" || currentPath === ""
    }
    return currentPath.startsWith(itemPath)
  }

  const handleItemClick = () => {
    // Close mobile sidebar when item is clicked
    if (onClose) {
      onClose()
    }
  }

  return (
    <aside className={`w-64 sidebar-glass fixed left-0 top-0 bottom-0 overflow-y-auto transition-transform duration-300 z-50 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0`}>
      {/* Logo Section - Hidden on mobile (shown in header) */}
      <div className="p-4 pt-6 pb-6 justify-center hidden lg:flex">
        <div className="w-12 h-12 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">ATOP</span>
        </div>
      </div>
      
      {/* Mobile logo/header spacing */}
      <div className="h-4 lg:hidden"></div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={isActive(item.to)}
            accent={item.accent}
            onClick={handleItemClick}
          />
        ))}
      </nav>
      
      {/* Decorative gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ocean-900/20 to-transparent pointer-events-none" />
    </aside>
  )
}
