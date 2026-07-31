'use client'

import { Megaphone, Circle } from 'lucide-react'

export function NoticeBar() {
  return (
    <footer className="flex h-8 shrink-0 items-center justify-between border-t border-border bg-card px-4 text-[10px] 2xl:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex shrink-0 items-center gap-1.5 font-medium text-amber-300">
          <Megaphone className="h-3 w-3" />
          운영 공지
        </span>
        <span className="h-3 w-px bg-border" />
        <p className="truncate text-muted-foreground">
          강우 예보에 따른 비상근무 체계 가동
          <span className="mx-2 text-border-strong">·</span>
          정기 장비점검 05/12 02:00–04:00
        </p>
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-3 text-muted-foreground">
        <span className="hidden items-center gap-1.5 xl:flex">
          <Circle className="h-1.5 w-1.5 fill-emerald-400 text-emerald-400" />
          전체 시스템 정상
        </span>
        <span className="font-mono text-[9px] tabular-nums">BUILD 2.1.0</span>
      </div>
    </footer>
  )
}
