'use client'

import { cn } from '@/lib/utils'
import type { DrainDevice } from '@/lib/types'
import {
  Navigation,
  Clock3,
  Route,
  Send,
  MapPin,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'

interface DispatchRouteProps {
  devices: DrainDevice[]
}

export function DispatchRoute({ devices }: DispatchRouteProps) {
  const priorityDevices = devices
    .filter((device) => device.status === 'danger' || device.status === 'warning')
    .sort((a, b) => {
      if (a.status === 'danger' && b.status !== 'danger') return -1
      if (a.status !== 'danger' && b.status === 'danger') return 1
      return b.floodRisk - a.floodRisk
    })

  return (
    <section className="ops-panel">
      <header className="ops-panel__header min-h-12 px-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
            <Navigation className="h-3.5 w-3.5" />
          </span>
          <div>
            <h2 className="text-[13px] font-semibold tracking-[-0.02em] text-foreground">
              우선 출동 경로
            </h2>
            <p className="text-[9px] text-muted-foreground">위험도와 수위 상승률 기반 자동 정렬</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/20 bg-rose-500/8 px-2 py-1 text-[9px] font-medium text-rose-300">
          <ShieldAlert className="h-3 w-3" />
          {priorityDevices.length}개 출동 대상
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="grid grid-cols-2 gap-2">
          <article className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/8 text-primary">
              <Clock3 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[9px] text-muted-foreground">예상 소요 시간</p>
              <p className="mt-0.5 font-mono text-[15px] font-semibold tabular-nums text-foreground">
                6.8 <span className="text-[9px] font-normal text-muted-foreground">분</span>
              </p>
            </div>
          </article>
          <article className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/8 text-primary">
              <Route className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[9px] text-muted-foreground">총 이동 거리</p>
              <p className="mt-0.5 font-mono text-[15px] font-semibold tabular-nums text-foreground">
                1.7 <span className="text-[9px] font-normal text-muted-foreground">km</span>
              </p>
            </div>
          </article>
        </div>

        <div className="mt-4 grid h-7 grid-cols-[36px_minmax(0,1fr)_58px_18px] items-center gap-2 border-b border-border px-2 text-[9px] font-medium text-muted-foreground">
          <span>순위</span>
          <span>대상 시설</span>
          <span className="text-right">위험도</span>
          <span />
        </div>

        <ol className="min-h-0 flex-1 divide-y divide-border/75 overflow-hidden">
          {priorityDevices.map((device, index) => (
            <li key={device.id}>
              <button
                type="button"
                className="group grid h-12 w-full grid-cols-[36px_minmax(0,1fr)_58px_18px] items-center gap-2 px-2 text-left transition-colors hover:bg-secondary/35"
              >
                <span
                  className={cn(
                    'grid h-6 w-6 place-items-center rounded font-mono text-[10px] font-semibold',
                    device.status === 'danger'
                      ? 'bg-rose-500/12 text-rose-300'
                      : 'bg-amber-500/12 text-amber-300'
                  )}
                >
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-medium text-foreground">
                    {device.name}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 truncate text-[8px] text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                    {device.address}
                  </span>
                </span>
                <span
                  className={cn(
                    'text-right font-mono text-[11px] font-semibold tabular-nums',
                    device.status === 'danger' ? 'text-rose-300' : 'text-amber-300'
                  )}
                >
                  {device.floodRisk}%
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </button>
            </li>
          ))}
        </ol>

        <button
          type="button"
          className="mt-3 flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-primary text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          선택 경로로 작업지시 생성
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  )
}
