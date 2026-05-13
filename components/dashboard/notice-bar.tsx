'use client'

import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'

export function NoticeBar() {
  return (
    <div className="flex items-center justify-between px-6 py-2.5 bg-card border-t border-border">
      <div className="flex items-center gap-4">
        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20">
          <AlertCircle className="h-3 w-3 mr-1" />
          공지사항
        </Badge>
        <p className="text-sm text-muted-foreground">
          강우 예보에 따른 비상근무 체계 가동 안내 (05/10 09:00)
          <span className="mx-3 text-border">|</span>
          장비점검 안내: 05/12(목) 02:00 ~ 04:00 (일부 서비스 제한)
        </p>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">개인정보처리방침</a>
        <span className="text-border">|</span>
        <a href="#" className="hover:text-foreground transition-colors">이용약관</a>
        <span className="ml-4 text-foreground font-mono">v2.1.0</span>
      </div>
    </div>
  )
}
