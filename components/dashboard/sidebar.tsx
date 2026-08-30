'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Bell,
  Wrench,
  BarChart3,
  Settings,
  Droplets,
  Menu,
  Headphones,
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  badge?: number
}

const baseNavItems: NavItem[] = [
  { id: 'dashboard', label: '대시보드', icon: <LayoutDashboard /> },
  { id: 'alerts', label: '이상알림', icon: <Bell /> },
  { id: 'analytics', label: '데이터분석', icon: <BarChart3 /> },
  { id: 'equipment', label: '장비관리', icon: <Wrench /> },
  { id: 'settings', label: '시스템설정', icon: <Settings /> },
]

interface SidebarProps {
  activeNav: string
  onNavChange: (nav: string) => void
  alertCount?: number
}

export function Sidebar({ activeNav, onNavChange, alertCount = 0 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const navItems = baseNavItems.map((item) =>
    item.id === 'alerts' ? { ...item, badge: alertCount || undefined } : item
  )

  return (
    <aside
      className={cn(
        'relative z-30 flex w-full shrink-0 flex-col border-b border-sidebar-border bg-sidebar md:border-b-0 md:border-r md:transition-[width] md:duration-200 md:ease-out',
        collapsed ? 'md:w-[68px]' : 'md:w-[224px] 2xl:w-[236px]'
      )}
    >
      <div
        className={cn(
          'hidden h-[60px] shrink-0 items-center border-b border-sidebar-border md:flex',
          collapsed ? 'justify-center px-2' : 'gap-2 px-3'
        )}
      >
        {!collapsed && (
          <div className="flex min-w-0 flex-1 items-center gap-3 px-1">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-primary/20 bg-primary/10">
              <Droplets className="h-[18px] w-[18px] text-primary" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold tracking-[-0.01em] text-sidebar-foreground">
                스마트 빗물받이
              </p>
              <p className="mt-0.5 text-[10px] tracking-[0.08em] text-muted-foreground">
                CONTROL CENTER
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          aria-label={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
          title={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
        >
          <Menu className="h-[19px] w-[19px]" />
        </button>
      </div>

      <div className={cn('hidden px-3 pb-2 pt-4 md:block', collapsed && 'px-2')}>
        {!collapsed && (
          <p className="px-2 text-[10px] font-medium tracking-[0.12em] text-muted-foreground/70">
            OPERATIONS
          </p>
        )}
      </div>

      <nav className={cn('grid h-[58px] grid-cols-5 px-1 md:block md:h-auto md:flex-1 md:space-y-1 md:px-3', collapsed && 'md:px-2')}>
        {navItems.map((item) => {
          const active = activeNav === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavChange(item.id)}
              className={cn(
                'group relative flex h-full w-full flex-col items-center justify-center gap-1 rounded-md px-0 text-[9px] font-medium transition-colors md:h-10 md:flex-row md:text-[13px]',
                collapsed ? 'md:justify-center md:px-0' : 'md:justify-start md:gap-3 md:px-3',
                active
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              )}
              aria-label={item.label}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-t-full bg-sidebar-primary md:inset-x-auto md:inset-y-2 md:left-0 md:h-auto md:w-0.5 md:rounded-r-full" />
              )}
              <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{item.icon}</span>
              <span className={cn('md:flex-1 md:text-left', collapsed && 'md:hidden')}>{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    'grid min-w-5 place-items-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold leading-5 text-white',
                    'absolute right-2 top-1 h-4 min-w-4 px-1 text-[9px] leading-4 md:static md:h-auto md:min-w-5 md:px-1.5 md:text-[10px] md:leading-5',
                    collapsed && 'md:absolute md:right-0 md:top-0 md:h-4 md:min-w-4 md:px-1 md:text-[9px] md:leading-4'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className={cn('hidden border-t border-sidebar-border p-3 md:block', collapsed && 'px-2')}>
        <div
          className={cn(
            'flex items-center rounded-md border border-transparent bg-sidebar-accent/35',
            collapsed ? 'h-10 justify-center' : 'gap-3 px-3 py-2.5'
          )}
        >
          <span className="relative">
            <Headphones className="h-[17px] w-[17px] text-muted-foreground" />
            <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-sidebar" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">관제센터 · 24시간 운영</p>
              <p className="mt-0.5 font-mono text-[12px] font-medium text-sidebar-foreground">
                02-1234-5678
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
