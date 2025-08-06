import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  CheckSquare,
  Settings,
  SidebarClose,
  SidebarOpen,
  ReceiptIndianRupee as Receipt
} from 'lucide-react'

interface SidebarProps {
  onLinkClick?: () => void;
  className?: string;
  isCollapsed: boolean;
  toggleCollapsed: () => void;
}

const navigationItems = [
  { id: 'tasks', to: '/task-management', label: 'Tasks', icon: CheckSquare },
  { id: 'expense', to: '/expense-management', label: 'Expense', icon: Receipt },
]

const Sidebar: React.FC<SidebarProps> = ({
  onLinkClick,
  className = '',
  isCollapsed,
  toggleCollapsed
}) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
    if (onLinkClick) {
      onLinkClick()
    }
  }

  return (
    <div 
      className={`flex flex-col h-full bg-card border-r border-border transition-all duration-300 ${className} ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="flex items-center justify-between h-16 border-b border-border px-4">
        {!isCollapsed && (
          <h1 className="text-lg font-bold">K<span className="text-primary">AI</span>ZEN</h1>
        )}
        {isCollapsed && (
          <div className="flex flex-col items-center justify-center w-full">
            <h1 className="text-md font-bold text-primary">KAI</h1>
            <span className="text-md font-bold">ZEN</span>
          </div>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="flex justify-between items-center p-2 border-b border-border">
          <button 
            onClick={toggleCollapsed}
            className="flex items-center px-3 py-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-sm w-full"
          >
            <SidebarClose className="w-4 h-4 mr-2" />
            Collapse Sidebar
          </button>
        </div>
      )}

      {isCollapsed && (
        <div className="flex justify-center p-2 border-b border-border">
          <button 
            onClick={toggleCollapsed}
            className="flex items-center justify-center p-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors w-10 h-10"
            aria-label="Expand sidebar"
            title="Expand Sidebar"
          >
            <SidebarOpen className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <nav className="flex-1 p-2 space-y-1">
        {navigationItems.map((item) => {
          const IconComponent = item.icon
          return (
            <NavLink
              key={item.id}
              to={item.to}
              onClick={onLinkClick}
              className={({ isActive }) =>
                `flex items-center ${
                  isCollapsed ? 'justify-center px-2' : 'px-4'
                } py-2 rounded transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`
              }
              title={isCollapsed ? item.label : ''}
            >
              <IconComponent className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && item.label}
            </NavLink>
          )
        })}
      </nav>
      
      <div className="p-2 border-t border-border">

        <button
          onClick={handleLogout}
          className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'w-full px-4'} py-2 rounded transition-colors hover:bg-accent hover:text-accent-foreground`}
          title={isCollapsed ? "Logout" : ""}
        >
          <Settings className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'Settings'}
        </button>
      </div>
    </div>
  )
}

export default Sidebar