'use client'

import {
  Search,
  Bell,
  RefreshCw,
  UserRound,
  Cloud,
  CloudRain,
  CloudLightning,
  Sun,
  ChevronDown,
} from 'lucide-react'
import type { WeatherData } from '@/lib/types'
import { cn } from '@/lib/utils'

interface HeaderProps {
  weather: WeatherData
  lastUpdated: string
  onRefresh: () => void
}

function WeatherIcon({ condition }: { condition: WeatherData['condition'] }) {
  const className = 'h-[19px] w-[19px]'

  switch (condition) {
    case 'clear':
      return <Sun className={cn(className, 'text-amber-400')} />
    case 'cloudy':
      return <Cloud className={cn(className, 'text-slate-400')} />
    case 'rain':
      return <CloudRain className={cn(className, 'text-sky-400')} />
    case 'heavy_rain':
      return <CloudRain className={cn(className, 'text-primary')} />
    case 'storm':
      return <CloudLightning className={cn(className, 'text-rose-400')} />
  }
}

function getWeatherLabel(condition: WeatherData['condition']) {
  switch (condition) {
    case 'clear': return '맑음'
    case 'cloudy': return '흐림'
    case 'rain': return '강우'
    case 'heavy_rain': return '폭우'
    case 'storm': return '뇌우'
  }
}

export function Header({ weather, lastUpdated, onRefresh }: HeaderProps) {
  return (
    <header className="flex h-[60px] shrink-0 items-center border-b border-border bg-card px-4 2xl:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-4 2xl:gap-5">
        <div className="flex shrink-0 items-center gap-2.5">
          <WeatherIcon condition={weather.condition} />
          <div>
            <p className="text-[13px] font-semibold text-foreground">서울특별시 강남구</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">실시간 기상 관측</p>
          </div>
        </div>

        <span className="h-6 w-px bg-border" />

        <div className="flex shrink-0 items-center gap-4 text-[12px]">
          <span className="font-mono text-[14px] font-medium tabular-nums text-foreground">
            {weather.temperature.toFixed(1)}°C
          </span>
          <span className="rounded border border-sky-400/25 bg-sky-400/8 px-2 py-0.5 text-[10px] font-medium text-sky-300">
            {getWeatherLabel(weather.condition)}
          </span>
          <span className="text-muted-foreground">
            시간당{' '}
            <strong className="font-mono font-medium tabular-nums text-foreground">
              {weather.rainfall.toFixed(1)}
            </strong>{' '}
            mm
          </span>
          <span className="hidden text-muted-foreground xl:inline">
            누적{' '}
            <strong className="font-mono font-medium tabular-nums text-foreground">
              {weather.accumulatedRainfall.toFixed(1)}
            </strong>{' '}
            mm
          </span>
        </div>

        <span className="hidden h-6 w-px bg-border 2xl:block" />

        <div className="hidden min-w-0 items-center gap-2 text-[10px] text-muted-foreground 2xl:flex">
          <span className="whitespace-nowrap">최근 동기화</span>
          <time className="whitespace-nowrap font-mono tabular-nums text-foreground/80">
            {lastUpdated}
          </time>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            onClick={onRefresh}
            aria-label="데이터 새로고침"
            title="데이터 새로고침"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="ml-4 flex shrink-0 items-center gap-2">
        <label className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="시설명, 주소, ID 검색"
            className="h-9 w-56 rounded-md border border-border bg-secondary/60 pl-9 pr-3 text-[12px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 hover:border-border-strong focus:border-primary/60 focus:bg-secondary 2xl:w-72"
          />
        </label>

        <button
          type="button"
          className="relative grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="알림 열기"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-none text-white ring-2 ring-card">
            12
          </span>
        </button>

        <span className="mx-1 h-7 w-px bg-border" />

        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-md px-1.5 text-left transition-colors hover:bg-secondary"
          aria-label="사용자 메뉴"
        >
          <span className="grid h-8 w-8 place-items-center rounded-md border border-primary/15 bg-primary/8">
            <UserRound className="h-4 w-4 text-primary" />
          </span>
          <span className="hidden xl:block">
            <span className="block text-[12px] font-medium text-foreground">관제요원</span>
            <span className="block text-[10px] text-muted-foreground">강남 관제센터</span>
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground xl:block" />
        </button>
      </div>
    </header>
  )
}
