'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { DrainDevice, DrainStatus } from '@/lib/types'
import { Settings2, ZoomIn, ZoomOut, Locate, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MapViewProps {
  devices: DrainDevice[]
  selectedDevice: DrainDevice | null
  onSelectDevice: (device: DrainDevice) => void
  region: string
}

function getStatusColor(status: DrainStatus): string {
  switch (status) {
    case 'normal':
      return 'bg-emerald-500'
    case 'warning':
      return 'bg-amber-500'
    case 'danger':
      return 'bg-rose-500'
    case 'offline':
      return 'bg-slate-500'
    default:
      return 'bg-slate-500'
  }
}

function getStatusRingColor(status: DrainStatus): string {
  switch (status) {
    case 'normal':
      return 'ring-emerald-500/30'
    case 'warning':
      return 'ring-amber-500/30'
    case 'danger':
      return 'ring-rose-500/30'
    case 'offline':
      return 'ring-slate-500/30'
    default:
      return 'ring-slate-500/30'
  }
}

// Convert lat/lng to map position (simplified for demo)
function latLngToPosition(lat: number, lng: number): { x: number; y: number } {
  // Gangnam area bounds (approximate)
  const minLat = 37.475
  const maxLat = 37.535
  const minLng = 127.005
  const maxLng = 127.075
  
  const x = ((lng - minLng) / (maxLng - minLng)) * 100
  const y = ((maxLat - lat) / (maxLat - minLat)) * 100
  
  return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
}

export function MapView({ devices, selectedDevice, onSelectDevice, region }: MapViewProps) {
  const devicePositions = useMemo(() => {
    return devices.map(device => ({
      ...device,
      position: latLngToPosition(device.lat, device.lng)
    }))
  }, [devices])

  return (
    <div className="relative flex-1 bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{region}</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Map Area - Using a stylized grid background */}
      <div 
        className="absolute inset-0 bg-secondary/50"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      >
        {/* Street overlay simulation */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {/* Minor roads */}
          <line x1="0%" y1="25%" x2="100%" y2="25%" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/20" />
          <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/20" />
          <line x1="0%" y1="75%" x2="100%" y2="75%" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/20" />
          <line x1="20%" y1="0%" x2="20%" y2="100%" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/20" />
          <line x1="40%" y1="0%" x2="40%" y2="100%" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/20" />
          <line x1="60%" y1="0%" x2="60%" y2="100%" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/20" />
          <line x1="80%" y1="0%" x2="80%" y2="100%" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/20" />
          
          {/* Major roads */}
          <line x1="0%" y1="35%" x2="100%" y2="35%" stroke="currentColor" strokeWidth="3" className="text-primary/20" />
          <line x1="0%" y1="65%" x2="100%" y2="65%" stroke="currentColor" strokeWidth="3" className="text-primary/20" />
          <line x1="30%" y1="0%" x2="30%" y2="100%" stroke="currentColor" strokeWidth="3" className="text-primary/20" />
          <line x1="70%" y1="0%" x2="70%" y2="100%" stroke="currentColor" strokeWidth="3" className="text-primary/20" />
          
          {/* Main arterial roads */}
          <line x1="5%" y1="45%" x2="95%" y2="45%" stroke="currentColor" strokeWidth="4" className="text-primary/30" />
          <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="currentColor" strokeWidth="4" className="text-primary/30" />
        </svg>

        {/* Neighborhood Labels */}
        <div className="absolute top-[15%] left-[20%] text-xs text-muted-foreground/60">신사동</div>
        <div className="absolute top-[20%] left-[45%] text-xs text-muted-foreground/60">청담동</div>
        <div className="absolute top-[25%] left-[75%] text-xs text-muted-foreground/60">삼성동</div>
        <div className="absolute top-[45%] left-[15%] text-xs text-muted-foreground/60">논현동</div>
        <div className="absolute top-[50%] left-[35%] text-xs text-muted-foreground/60">역삼동</div>
        <div className="absolute top-[55%] left-[65%] text-xs text-muted-foreground/60">대치동</div>
        <div className="absolute top-[75%] left-[25%] text-xs text-muted-foreground/60">개포동</div>
        <div className="absolute top-[70%] left-[55%] text-xs text-muted-foreground/60">도곡동</div>

        {/* Device Markers */}
        {devicePositions.map((device) => (
          <button
            key={device.id}
            onClick={() => onSelectDevice(device)}
            className={cn(
              "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200",
              selectedDevice?.id === device.id ? "z-20 scale-125" : "z-10 hover:scale-110"
            )}
            style={{
              left: `${device.position.x}%`,
              top: `${device.position.y}%`
            }}
          >
            <div className="relative">
              {/* Pulse animation for danger status */}
              {device.status === 'danger' && (
                <span className={cn(
                  "absolute inset-0 rounded-full pulse-ring",
                  getStatusColor(device.status)
                )} />
              )}
              <div className={cn(
                "w-4 h-4 rounded-full ring-4 shadow-lg",
                getStatusColor(device.status),
                getStatusRingColor(device.status),
                selectedDevice?.id === device.id && "ring-8"
              )} />
            </div>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-16 left-4 z-10 p-3 bg-card/90 backdrop-blur-sm rounded-lg border border-border">
        <p className="text-xs font-medium text-muted-foreground mb-2">범례</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-foreground">정상</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-foreground">점검요망</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-foreground">침수위험</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-foreground">오프라인</span>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-16 right-4 z-10 flex flex-col gap-2">
        <Button variant="secondary" size="icon" className="h-8 w-8 bg-card/90 backdrop-blur-sm">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="h-8 w-8 bg-card/90 backdrop-blur-sm">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="h-8 w-8 bg-card/90 backdrop-blur-sm">
          <Locate className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="h-8 w-8 bg-card/90 backdrop-blur-sm">
          <Layers className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
