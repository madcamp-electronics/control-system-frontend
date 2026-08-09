'use client'

import { Battery, MapPin, RadioTower, Waves } from 'lucide-react'
import type { DrainDevice } from '@/lib/types'

interface DispatchRouteProps {
  devices: DrainDevice[]
  onSelectDevice?: (device: DrainDevice) => void
}

export function DispatchRoute({ devices, onSelectDevice }: DispatchRouteProps) {
  const orderedDevices = [...devices].sort((a, b) => {
    if (a.connectionStatus !== b.connectionStatus) {
      return a.connectionStatus === 'disconnected' ? -1 : 1
    }
    return (b.waterLevel ?? -1) - (a.waterLevel ?? -1)
  })

  return (
    <section className="ops-panel">
      <header className="ops-panel__header min-h-12 px-4">
        <div className="flex items-center gap-2.5">
          <RadioTower className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-[13px] font-semibold text-foreground">센서 상태</h2>
            <p className="text-[9px] text-muted-foreground">미수신 센서 우선, 수위 내림차순</p>
          </div>
        </div>
        <span className="font-mono text-[9px] text-muted-foreground">{devices.length}개 시설</span>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        {orderedDevices.length === 0 ? (
          <div className="grid h-full place-items-center text-xs text-muted-foreground">등록된 빗물받이가 없습니다.</div>
        ) : (
          <ul className="divide-y divide-border/75">
            {orderedDevices.map((device) => (
              <li key={device.id}>
                <button
                  type="button"
                  onClick={() => onSelectDevice?.(device)}
                  className="grid h-16 w-full grid-cols-[minmax(0,1fr)_90px_80px] items-center gap-3 px-4 text-left transition-colors hover:bg-secondary/35"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-medium text-foreground">
                      빗물받이 #{device.id}
                    </span>
                    <span className="mt-1 flex items-center gap-1 truncate text-[9px] text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {device.address}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="flex items-center justify-end gap-1 text-[9px] text-muted-foreground">
                      <Waves className="h-3 w-3" /> 수위
                    </span>
                    <strong className="font-mono text-[11px] text-foreground">
                      {device.waterLevel == null ? '-' : `${device.waterLevel.toFixed(1)} cm`}
                    </strong>
                  </span>
                  <span className="text-right">
                    <span className="flex items-center justify-end gap-1 text-[9px] text-muted-foreground">
                      <Battery className="h-3 w-3" /> 배터리
                    </span>
                    <strong className="font-mono text-[11px] text-foreground">
                      {device.batteryLevel == null ? '-' : `${device.batteryLevel.toFixed(0)}%`}
                    </strong>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
