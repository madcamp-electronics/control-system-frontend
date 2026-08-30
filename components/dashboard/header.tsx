'use client'

import { LogOut, RefreshCw, Server, UserRound } from 'lucide-react'

interface HeaderProps {
  lastUpdated: string
  onRefresh: () => void
  userName: string
  userRole: string
  loading: boolean
  onLogout: () => void
}

export function Header({
  lastUpdated,
  onRefresh,
  userName,
  userRole,
  loading,
  onLogout,
}: HeaderProps) {
  return (
    <header className="flex h-[60px] shrink-0 items-center border-b border-border bg-card px-3 sm:px-4 2xl:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <Server className="h-[19px] w-[19px] text-emerald-400" />
          <div>
            <p className="text-[13px] font-semibold text-foreground">빗물받이 센서 관제</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              백엔드 API 연결
            </p>
          </div>
        </div>

        <span className="hidden h-6 w-px bg-border sm:block" />

        <div className="ml-auto flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground sm:ml-0 sm:gap-2">
          <span className="hidden lg:inline">최근 동기화</span>
          <time className="hidden font-mono tabular-nums text-foreground/80 sm:inline">{lastUpdated || '-'}</time>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            onClick={onRefresh}
            disabled={loading}
            aria-label="데이터 새로고침"
            title="데이터 새로고침"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="ml-1 flex shrink-0 items-center gap-1 sm:ml-4 sm:gap-2">
        <div className="flex h-10 items-center gap-2 px-1.5">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-primary/15 bg-primary/8">
            <UserRound className="h-4 w-4 text-primary" />
          </span>
          <span className="hidden xl:block">
            <span className="block text-[12px] font-medium text-foreground">{userName}</span>
            <span className="block text-[10px] text-muted-foreground">{userRole}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="로그아웃"
          title="로그아웃"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
