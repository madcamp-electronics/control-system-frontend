'use client'

import { cn } from '@/lib/utils'
import type { SystemStats } from '@/lib/types'
import { 
  LayoutGrid, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  WifiOff,
  Bell
} from 'lucide-react'

interface StatsCardsProps {
  stats: SystemStats
}

interface StatCardProps {
  label: string
  value: number
  unit: string
  subLabel?: string
  subValue?: string
  icon: React.ReactNode
  iconBg: string
  trend?: {
    value: number
    positive?: boolean
  }
}

function StatCard({ label, value, unit, subLabel, subValue, icon, iconBg, trend }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 bg-card rounded-xl border border-border">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-foreground tracking-tight">
            {value.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        {(subLabel || subValue) && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {subLabel} {subValue && <span className="text-foreground">{subValue}</span>}
          </p>
        )}
      </div>
      {trend && (
        <div className={cn(
          "text-xs font-medium",
          trend.positive ? "text-emerald-400" : "text-amber-400"
        )}>
          {trend.positive ? '+' : ''}{trend.value}
        </div>
      )}
    </div>
  )
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      <StatCard
        label="전체 빗물받이"
        value={stats.totalDevices}
        unit="개"
        subLabel="전체 시설"
        icon={<LayoutGrid className="h-5 w-5 text-primary" />}
        iconBg="bg-primary/10"
      />
      <StatCard
        label="정상"
        value={stats.normalCount}
        unit="개"
        subValue={`${((stats.normalCount / stats.totalDevices) * 100).toFixed(1)}%`}
        icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
        iconBg="bg-emerald-400/10"
      />
      <StatCard
        label="점검요망"
        value={stats.warningCount}
        unit="개"
        subValue={`${((stats.warningCount / stats.totalDevices) * 100).toFixed(1)}%`}
        icon={<AlertTriangle className="h-5 w-5 text-amber-400" />}
        iconBg="bg-amber-400/10"
      />
      <StatCard
        label="침수위험"
        value={stats.dangerCount}
        unit="개"
        subValue={`${((stats.dangerCount / stats.totalDevices) * 100).toFixed(1)}%`}
        icon={<AlertCircle className="h-5 w-5 text-rose-400" />}
        iconBg="bg-rose-400/10"
      />
      <StatCard
        label="오프라인"
        value={stats.offlineCount}
        unit="개"
        subValue={`${((stats.offlineCount / stats.totalDevices) * 100).toFixed(1)}%`}
        icon={<WifiOff className="h-5 w-5 text-slate-400" />}
        iconBg="bg-slate-400/10"
      />
      <StatCard
        label="오늘 신규 알림"
        value={stats.todayAlerts}
        unit="건"
        subLabel="전일 대비"
        icon={<Bell className="h-5 w-5 text-chart-2" />}
        iconBg="bg-chart-2/10"
        trend={{ value: stats.alertChange, positive: false }}
      />
    </div>
  )
}
