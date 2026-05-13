'use client'

import { cn } from '@/lib/utils'
import type { Alert } from '@/lib/types'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AlertListProps {
  alerts: Alert[]
  onSelectAlert: (deviceId: string) => void
}

function getAlertBadgeStyle(type: Alert['type']) {
  switch (type) {
    case 'danger':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    case 'warning':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    case 'info':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
  }
}

function getAlertLabel(type: Alert['type']) {
  switch (type) {
    case 'danger':
      return '침수위험'
    case 'warning':
      return '점검요망'
    case 'info':
      return '오프라인'
    default:
      return '알림'
  }
}

export function AlertList({ alerts, onSelectAlert }: AlertListProps) {
  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">실시간 알림 목록</h3>
        <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
          전체보기
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {alerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() => onSelectAlert(alert.deviceId)}
              className="flex items-start gap-3 w-full p-3 rounded-lg text-left hover:bg-secondary/50 transition-colors"
            >
              <Badge 
                variant="outline" 
                className={cn("shrink-0 text-[10px] font-semibold", getAlertBadgeStyle(alert.type))}
              >
                {getAlertLabel(alert.type)}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {alert.deviceName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {alert.message}
                </p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {alert.timestamp}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
