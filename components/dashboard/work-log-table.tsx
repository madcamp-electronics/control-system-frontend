'use client'

import { cn } from '@/lib/utils'
import type { WorkLog } from '@/lib/types'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface WorkLogTableProps {
  logs: WorkLog[]
}

function getTypeBadgeStyle(type: WorkLog['type']) {
  switch (type) {
    case '긴급':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    case '수리':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    case '청소':
      return 'bg-chart-2/10 text-chart-2 border-chart-2/30'
    case '점검':
      return 'bg-primary/10 text-primary border-primary/30'
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
  }
}

function getResultBadgeStyle(result: WorkLog['result']) {
  switch (result) {
    case '완료':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    case '진행중':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    case '대기':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
  }
}

export function WorkLogTable({ logs }: WorkLogTableProps) {
  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">최근 작업 이력</h3>
        <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
          전체보기
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="min-w-[400px]">
          {/* Header */}
          <div className="grid grid-cols-5 gap-2 px-4 py-2 border-b border-border bg-secondary/30 text-xs font-medium text-muted-foreground">
            <div>작업일시</div>
            <div>작업 유형</div>
            <div>시설 ID</div>
            <div>작업자</div>
            <div>결과</div>
          </div>
          
          {/* Body */}
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="grid grid-cols-5 gap-2 px-4 py-2.5 text-sm hover:bg-secondary/30 transition-colors"
              >
                <div className="text-muted-foreground text-xs">{log.date}</div>
                <div>
                  <Badge variant="outline" className={cn("text-[10px]", getTypeBadgeStyle(log.type))}>
                    {log.type}
                  </Badge>
                </div>
                <div className="font-mono text-xs text-foreground">{log.deviceId}</div>
                <div className="text-foreground">{log.worker}</div>
                <div>
                  <Badge variant="outline" className={cn("text-[10px]", getResultBadgeStyle(log.result))}>
                    {log.result}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
