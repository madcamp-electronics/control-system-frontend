'use client'

import type { SystemStats } from '@/lib/types'
import {
  Database,
  CircleCheck,
  TriangleAlert,
  OctagonAlert,
  WifiOff,
  BellRing,
} from 'lucide-react'

interface StatsCardsProps {
  stats: SystemStats
}

interface StatItem {
  label: string
  value: number
  unit: string
  meta: string
  color: string
  icon: React.ReactNode
}

export function StatsCards({ stats }: StatsCardsProps) {
  const ratio = (value: number) =>
    `${((value / stats.totalDevices) * 100).toFixed(1)}%`

  const items: StatItem[] = [
    {
      label: '전체 시설',
      value: stats.totalDevices,
      unit: '개소',
      meta: '강남구 관제 대상',
      color: 'text-primary',
      icon: <Database />,
    },
    {
      label: '정상 운영',
      value: stats.normalCount,
      unit: '개소',
      meta: ratio(stats.normalCount),
      color: 'text-emerald-400',
      icon: <CircleCheck />,
    },
    {
      label: '점검 필요',
      value: stats.warningCount,
      unit: '개소',
      meta: ratio(stats.warningCount),
      color: 'text-amber-400',
      icon: <TriangleAlert />,
    },
    {
      label: '침수 위험',
      value: stats.dangerCount,
      unit: '개소',
      meta: ratio(stats.dangerCount),
      color: 'text-rose-400',
      icon: <OctagonAlert />,
    },
    {
      label: '통신 이상',
      value: stats.offlineCount,
      unit: '개소',
      meta: ratio(stats.offlineCount),
      color: 'text-slate-400',
      icon: <WifiOff />,
    },
    {
      label: '금일 신규 알림',
      value: stats.todayAlerts,
      unit: '건',
      meta: `전일 대비 +${stats.alertChange}`,
      color: 'text-sky-400',
      icon: <BellRing />,
    },
  ]

  return (
    <div className="grid h-full grid-cols-6 overflow-hidden rounded-lg border border-border bg-card shadow-panel">
      {items.map((item, index) => (
        <article
          key={item.label}
          className="relative flex min-w-0 items-center gap-3 border-r border-border px-3 last:border-r-0 2xl:px-4"
        >
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary/80 ${item.color} [&>svg]:h-4 [&>svg]:w-4`}
          >
            {item.icon}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[10px] font-medium text-muted-foreground">
                {item.label}
              </p>
              {index > 1 && index < 5 && (
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.color.replace('text-', 'bg-')}`} />
              )}
            </div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <strong className="font-mono text-xl font-semibold tracking-[-0.04em] tabular-nums text-foreground 2xl:text-[22px]">
                {item.value.toLocaleString()}
              </strong>
              <span className="text-[10px] text-muted-foreground">{item.unit}</span>
            </div>
            <p className="truncate text-[9px] text-muted-foreground/75">{item.meta}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
