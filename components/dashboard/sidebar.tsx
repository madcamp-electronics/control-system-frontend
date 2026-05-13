'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Map, 
  Bell, 
  ClipboardList, 
  Wrench, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Phone
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  badge?: number
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: '대시보드', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'map', label: '통합관제지도', icon: <Map className="h-5 w-5" /> },
  { id: 'alerts', label: '이상알림', icon: <Bell className="h-5 w-5" />, badge: 12 },
  { id: 'tasks', label: '작업지시', icon: <ClipboardList className="h-5 w-5" /> },
  { id: 'equipment', label: '장비관리', icon: <Wrench className="h-5 w-5" /> },
  { id: 'analytics', label: '데이터분석', icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'settings', label: '시스템설정', icon: <Settings className="h-5 w-5" /> },
]

interface SidebarProps {
  activeNav: string
  onNavChange: (nav: string) => void
}

export function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside 
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Droplets className="h-5 w-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">스마트 빗물받이</span>
            <span className="text-xs text-muted-foreground">통합 관제</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavChange(item.id)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activeNav === item.id
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
            )}
          >
            {item.icon}
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-[11px] font-semibold text-destructive-foreground">
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {collapsed && item.badge && (
              <span className="absolute left-10 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-2 py-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>메뉴 접기</span>
            </>
          )}
        </button>
      </div>

      {/* Contact Info */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <div className="text-xs">
              <p className="text-muted-foreground">관제센터 24시간 운영</p>
              <p className="font-semibold text-foreground">02-1234-5678</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
