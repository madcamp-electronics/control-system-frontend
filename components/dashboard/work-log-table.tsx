'use client'

import { cn } from '@/lib/utils'
import type { WorkLog } from '@/lib/types'
import { ArrowUpRight, ClipboardCheck, CircleCheck, Clock3 } from 'lucide-react'

interface WorkLogTableProps {
  logs: WorkLog[]
}

function getTypeStyle(type: WorkLog['type']) {
  switch (type) {
    case '긴급':
      return 'border-rose-500/20 bg-rose-500/8 text-rose-300'
    case '수리':
      return 'border-amber-500/20 bg-amber-500/8 text-amber-300'
    case '청소':
      return 'border-sky-500/20 bg-sky-500/8 text-sky-300'
    case '점검':
      return 'border-primary/20 bg-primary/8 text-primary'
  }
}

export function WorkLogTable({ logs }: WorkLogTableProps) {
  const completedCount = logs.filter((log) => log.result === '완료').length

  return (
    <section className="ops-panel">
      <header className="ops-panel__header min-h-12 px-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
            <ClipboardCheck className="h-3.5 w-3.5" />
          </span>
          <div>
            <h2 className="text-[13px] font-semibold tracking-[-0.02em] text-foreground">
              최근 작업 이력
            </h2>
            <p className="text-[9px] text-muted-foreground">현장 점검 및 유지보수 처리 현황</p>
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-[9px] font-semibold text-primary hover:text-primary/75"
        >
          전체 이력
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="grid grid-cols-2 gap-2">
          <article className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-2.5">
            <CircleCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[9px] text-muted-foreground">금일 완료</p>
              <p className="font-mono text-[15px] font-semibold tabular-nums text-foreground">
                {completedCount}
                <span className="ml-1 text-[9px] font-normal text-muted-foreground">건</span>
              </p>
            </div>
          </article>
          <article className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-2.5">
            <Clock3 className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-[9px] text-muted-foreground">대기·진행</p>
              <p className="font-mono text-[15px] font-semibold tabular-nums text-foreground">
                {logs.length - completedCount}
                <span className="ml-1 text-[9px] font-normal text-muted-foreground">건</span>
              </p>
            </div>
          </article>
        </div>

        <div className="mt-4 grid h-8 grid-cols-[70px_48px_minmax(0,1fr)_54px_48px] items-center gap-2 border-b border-border bg-secondary/20 px-3 text-[9px] font-medium text-muted-foreground">
          <span>작업 일시</span>
          <span>유형</span>
          <span>시설 ID</span>
          <span>작업자</span>
          <span className="text-right">상태</span>
        </div>

        <div className="min-h-0 flex-1 divide-y divide-border/75 overflow-hidden">
          {logs.map((log) => (
            <div
              key={log.id}
              className="grid h-12 grid-cols-[70px_48px_minmax(0,1fr)_54px_48px] items-center gap-2 px-3 text-[10px] transition-colors hover:bg-secondary/30"
            >
              <time className="font-mono tabular-nums text-muted-foreground">{log.date}</time>
              <span
                className={cn(
                  'w-fit rounded border px-1.5 py-0.5 text-[8px] font-semibold',
                  getTypeStyle(log.type)
                )}
              >
                {log.type}
              </span>
              <span className="truncate font-mono text-[9px] text-foreground/90">{log.deviceId}</span>
              <span className="truncate text-foreground/85">{log.worker}</span>
              <span
                className={cn(
                  'text-right text-[9px] font-semibold',
                  log.result === '완료' && 'text-emerald-300',
                  log.result === '진행중' && 'text-amber-300',
                  log.result === '대기' && 'text-muted-foreground'
                )}
              >
                {log.result}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
