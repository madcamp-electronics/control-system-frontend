'use client'

import { cn } from '@/lib/utils'
import type { DrainDevice, DrainStatus } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { 
  Droplets, 
  TrendingUp, 
  AlertTriangle, 
  CloudRain, 
  Activity, 
  Wifi, 
  Camera,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface DeviceDetailProps {
  device: DrainDevice | null
}

function getStatusBadgeStyle(status: DrainStatus) {
  switch (status) {
    case 'normal':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    case 'warning':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    case 'danger':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    case 'offline':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
  }
}

function getStatusLabel(status: DrainStatus) {
  switch (status) {
    case 'normal': return '정상'
    case 'warning': return '점검요망'
    case 'danger': return '침수위험'
    case 'offline': return '오프라인'
    default: return '알수없음'
  }
}

interface MetricRowProps {
  icon: React.ReactNode
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  status?: 'normal' | 'warning' | 'danger'
}

function MetricRow({ icon, label, value, unit, trend, trendValue, status }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-sm font-semibold",
          status === 'danger' && "text-rose-400",
          status === 'warning' && "text-amber-400",
          status === 'normal' && "text-foreground"
        )}>
          {value}
          {unit && <span className="text-muted-foreground font-normal ml-0.5">{unit}</span>}
        </span>
        {trend && trendValue && (
          <span className={cn(
            "flex items-center text-xs",
            trend === 'up' ? "text-rose-400" : trend === 'down' ? "text-emerald-400" : "text-muted-foreground"
          )}>
            {trend === 'up' ? <ArrowUp className="h-3 w-3" /> : trend === 'down' ? <ArrowDown className="h-3 w-3" /> : null}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  )
}

export function DeviceDetail({ device }: DeviceDetailProps) {
  if (!device) {
    return (
      <div className="flex flex-col h-full bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">선택 시설 상세</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground">지도에서 빗물받이를 선택하세요</p>
        </div>
      </div>
    )
  }

  const getRiskStatus = (value: number): 'normal' | 'warning' | 'danger' => {
    if (value >= 70) return 'danger'
    if (value >= 50) return 'warning'
    return 'normal'
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">선택 시설 상세</h3>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {/* Device Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground font-mono">시설 ID</span>
            <span className="text-sm font-semibold text-foreground">{device.id}</span>
            <Badge 
              variant="outline" 
              className={cn("ml-auto text-[10px]", getStatusBadgeStyle(device.status))}
            >
              {getStatusLabel(device.status)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="text-muted-foreground/60">주소</span>{' '}
            <span className="text-foreground">{device.address}</span>
          </p>
        </div>

        {/* Metrics */}
        <div className="space-y-1">
          <MetricRow
            icon={<Droplets className="h-4 w-4" />}
            label="수위"
            value={device.waterLevel}
            unit="cm"
            trend={device.waterLevelChange > 0 ? 'up' : device.waterLevelChange < 0 ? 'down' : 'neutral'}
            trendValue={device.waterLevelChange !== 0 ? `${Math.abs(device.waterLevelChange)}cm` : undefined}
            status={getRiskStatus(device.floodRisk)}
          />
          <MetricRow
            icon={<TrendingUp className="h-4 w-4" />}
            label="수위 변화 (5분)"
            value={device.waterLevelChange > 0 ? `+${device.waterLevelChange}` : device.waterLevelChange}
            unit="cm"
            trend={device.waterLevelChange > 0 ? 'up' : 'neutral'}
          />
          <MetricRow
            icon={<AlertTriangle className="h-4 w-4" />}
            label="침수 위험도"
            value={device.floodRisk}
            unit="%"
            trend="up"
            status={getRiskStatus(device.floodRisk)}
          />
          <MetricRow
            icon={<CloudRain className="h-4 w-4" />}
            label="유입수 유입량 (mm)"
            value={device.inflowRate}
            unit="%"
            trend="up"
          />
          <MetricRow
            icon={<Activity className="h-4 w-4" />}
            label="펌프 상태"
            value={device.pumpStatus === 'active' ? '가동중' : device.pumpStatus === 'inactive' ? '대기' : '오류'}
            status={device.pumpStatus === 'error' ? 'danger' : 'normal'}
          />
          <MetricRow
            icon={<Wifi className="h-4 w-4" />}
            label="통신 상태"
            value={device.connectionStatus === 'connected' ? '정상' : '단절'}
            status={device.connectionStatus === 'disconnected' ? 'danger' : 'normal'}
          />
          <MetricRow
            icon={<Camera className="h-4 w-4" />}
            label="촬영 이미지"
            value={device.lastUpdated}
          />
        </div>

        {/* Camera Preview */}
        {device.connectionStatus === 'connected' && (
          <div className="mt-4 aspect-video rounded-lg bg-secondary/50 border border-border overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">실시간 카메라 피드</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
