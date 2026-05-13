'use client'

import { Search, Bell, RefreshCw, User, Cloud, CloudRain, CloudLightning, Sun } from 'lucide-react'
import type { WeatherData } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  weather: WeatherData
  lastUpdated: string
  onRefresh: () => void
}

function WeatherIcon({ condition }: { condition: WeatherData['condition'] }) {
  switch (condition) {
    case 'clear':
      return <Sun className="h-6 w-6 text-chart-3" />
    case 'cloudy':
      return <Cloud className="h-6 w-6 text-muted-foreground" />
    case 'rain':
      return <CloudRain className="h-6 w-6 text-chart-2" />
    case 'heavy_rain':
      return <CloudRain className="h-6 w-6 text-chart-1" />
    case 'storm':
      return <CloudLightning className="h-6 w-6 text-chart-4" />
    default:
      return <Cloud className="h-6 w-6 text-muted-foreground" />
  }
}

function getWeatherLabel(condition: WeatherData['condition']) {
  switch (condition) {
    case 'clear': return '맑음'
    case 'cloudy': return '흐림'
    case 'rain': return '강우'
    case 'heavy_rain': return '폭우'
    case 'storm': return '뇌우'
    default: return '알수없음'
  }
}

export function Header({ weather, lastUpdated, onRefresh }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-14 px-6 bg-card border-b border-border">
      {/* Weather Info */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <WeatherIcon condition={weather.condition} />
          <div className="flex items-center gap-4 text-sm">
            <span className="text-foreground">서울 강남구</span>
            <span className="text-muted-foreground">{weather.temperature}°C</span>
            <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/30">
              {getWeatherLabel(weather.condition)}
            </Badge>
            <span className="text-muted-foreground">
              <span className="text-foreground font-medium">{weather.rainfall}</span> mm/h
            </span>
            <span className="text-muted-foreground">
              누적 <span className="text-foreground font-medium">{weather.accumulatedRainfall}</span> mm
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>최종 업데이트</span>
          <span className="text-foreground">{lastUpdated}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={onRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Search & User */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="시설명, 주소, ID 검색" 
            className="w-64 pl-9 h-9 bg-secondary border-border"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            12
          </span>
        </Button>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground">관제요원</p>
            <p className="text-xs text-muted-foreground">강남센터</p>
          </div>
        </div>
      </div>
    </header>
  )
}
