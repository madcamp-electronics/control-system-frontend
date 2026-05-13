'use client'

import { cn } from '@/lib/utils'
import type { DrainDevice } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Navigation, Clock, MapPin, Send } from 'lucide-react'

interface DispatchRouteProps {
  devices: DrainDevice[]
}

export function DispatchRoute({ devices }: DispatchRouteProps) {
  // Filter devices that need attention (danger or warning)
  const priorityDevices = devices
    .filter(d => d.status === 'danger' || d.status === 'warning')
    .sort((a, b) => {
      if (a.status === 'danger' && b.status !== 'danger') return -1
      if (a.status !== 'danger' && b.status === 'danger') return 1
      return b.floodRisk - a.floodRisk
    })
    .slice(0, 5)

  // Calculate estimated time and distance (mock calculation)
  const estimatedTime = '6.8'
  const estimatedDistance = '1.7'

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          우선 출동 경로 
          <span className="text-xs text-muted-foreground font-normal ml-1">(선택 시설 기준)</span>
        </h3>
      </div>
      
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {/* Estimated Info */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div className="text-sm">
              <span className="text-muted-foreground">예상 소요 시간</span>
              <span className="ml-2 font-semibold text-foreground">{estimatedTime}분</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <div className="text-sm">
              <span className="text-muted-foreground">거리</span>
              <span className="ml-2 font-semibold text-foreground">{estimatedDistance} km</span>
            </div>
          </div>
        </div>

        {/* Route List */}
        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="space-y-1">
            {priorityDevices.map((device, index) => (
              <div 
                key={device.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors"
              >
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                  device.status === 'danger' 
                    ? "bg-rose-500/20 text-rose-400" 
                    : "bg-amber-500/20 text-amber-400"
                )}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {device.name}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Dispatch Button */}
        <Button className="w-full gap-2" size="lg">
          <Navigation className="h-4 w-4" />
          <span>경로 전송 및 작업지시</span>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
