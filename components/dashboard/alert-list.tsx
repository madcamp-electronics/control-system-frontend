'use client'

import { cn } from '@/lib/utils'
import type { Alert } from '@/lib/types'
import { ArrowUpRight, Radio } from 'lucide-react'

interface AlertListProps {
  alerts: Alert[]
  onSelectAlert: (deviceId: number) => void
}

function getAlertStyle(type: Alert['type']) {
  switch (type) {
    case 'danger':
      return {
        label: '위험',
        badge: 'border-rose-500/30 bg-rose-500/8 text-rose-300',
        dot: 'bg-rose-400',
      }
    case 'warning':
      return {
        label: '주의',
        badge: 'border-amber-500/30 bg-amber-500/8 text-amber-300',
        dot: 'bg-amber-400',
      }
    case 'info':
      return {
        label: '통신',
        badge: 'border-slate-500/30 bg-slate-500/8 text-slate-300',
        dot: 'bg-slate-400',
      }
  }
}

export function AlertList({ alerts, onSelectAlert }: AlertListProps) {
  return (
    <section className="ops-panel">
      <header className="ops-panel__header">
        <div className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-rose-400" />
          <h2 className="ops-panel__title">실시간 이벤트</h2>
          <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
            {alerts.length}
          </span>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-[10px] font-medium text-primary transition-colors hover:text-primary/75"
        >
          전체 이벤트
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </header>

      <div className="min-h-0 flex-1 divide-y divide-border/80 overflow-hidden">
        {alerts.map((alert) => {
          const style = getAlertStyle(alert.type)

          return (
            <button
              key={alert.id}
              type="button"
              onClick={() => onSelectAlert(alert.deviceId)}
              className="group grid h-14 w-full grid-cols-[42px_minmax(0,1fr)_38px] items-center gap-2 px-3 text-left transition-colors hover:bg-secondary/55"
            >
              <span
                className={cn(
                  'inline-flex w-fit items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-semibold',
                  style.badge
                )}
              >
                <span className={cn('h-1 w-1 rounded-full', style.dot)} />
                {style.label}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-medium text-foreground group-hover:text-white">
                  {alert.deviceName}
                </span>
                <span className="block truncate text-[9px] text-muted-foreground">
                  {alert.message}
                </span>
              </span>
              <time className="text-right font-mono text-[9px] tabular-nums text-muted-foreground">
                {alert.timestamp}
              </time>
            </button>
          )
        })}
      </div>
    </section>
  )
}
