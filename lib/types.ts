export type DrainStatus = 'normal' | 'warning' | 'danger' | 'offline'

export interface DrainDevice {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  status: DrainStatus
  waterLevel: number // cm
  waterLevelChange: number // cm per 5 min
  debrisLevel: number // percentage
  floodRisk: number // percentage
  inflowRate: number // mm
  pumpStatus: 'active' | 'inactive' | 'error'
  connectionStatus: 'connected' | 'disconnected'
  lastUpdated: string
  imageUrl?: string
}

export interface Alert {
  id: string
  deviceId: string
  deviceName: string
  type: 'danger' | 'warning' | 'info'
  message: string
  waterLevel?: number
  debrisLevel?: number
  timestamp: string
}

export interface WeatherData {
  temperature: number
  condition: 'clear' | 'cloudy' | 'rain' | 'heavy_rain' | 'storm'
  rainfall: number // mm/h
  accumulatedRainfall: number // mm
  humidity: number
}

export interface WaterLevelHistory {
  time: string
  level: number
  dangerLevel: number
}

export interface RainfallHistory {
  time: string
  rainfall: number
  accumulated: number
}

export interface WorkLog {
  id: string
  date: string
  type: '점검' | '청소' | '수리' | '긴급'
  deviceId: string
  worker: string
  result: '완료' | '진행중' | '대기'
}

export interface SystemStats {
  totalDevices: number
  normalCount: number
  warningCount: number
  dangerCount: number
  offlineCount: number
  todayAlerts: number
  alertChange: number
}
