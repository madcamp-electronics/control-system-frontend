import type { 
  DrainDevice, 
  Alert, 
  WeatherData, 
  WaterLevelHistory, 
  RainfallHistory, 
  WorkLog,
  SystemStats 
} from './types'

// Seoul Gangnam-gu area coordinates (approximate center)
const GANGNAM_CENTER = { lat: 37.4979, lng: 127.0276 }

export const mockDevices: DrainDevice[] = [
  {
    id: 'SG-0732-0158',
    name: '역삼동 152-1 빗물받이',
    address: '서울특별시 강남구 역삼로 152',
    lat: 37.5010,
    lng: 127.0365,
    status: 'danger',
    waterLevel: 19.2,
    waterLevelChange: 1.8,
    debrisLevel: 85,
    floodRisk: 85,
    inflowRate: 82,
    pumpStatus: 'active',
    connectionStatus: 'connected',
    lastUpdated: '2026-05-10 10:24:18',
    imageUrl: '/drain-camera.jpg'
  },
  {
    id: 'SG-0732-0211',
    name: '도곡동 311 빗물받이',
    address: '서울특별시 강남구 도곡로 311',
    lat: 37.4875,
    lng: 127.0456,
    status: 'danger',
    waterLevel: 17.8,
    waterLevelChange: 1.5,
    debrisLevel: 78,
    floodRisk: 78,
    inflowRate: 75,
    pumpStatus: 'active',
    connectionStatus: 'connected',
    lastUpdated: '2026-05-10 10:22:05'
  },
  {
    id: 'SG-0732-0098',
    name: '논현동 215 빗물받이',
    address: '서울특별시 강남구 논현로 215',
    lat: 37.5123,
    lng: 127.0289,
    status: 'warning',
    waterLevel: 9.5,
    waterLevelChange: 0.5,
    debrisLevel: 62,
    floodRisk: 62,
    inflowRate: 45,
    pumpStatus: 'inactive',
    connectionStatus: 'connected',
    lastUpdated: '2026-05-10 10:18:32'
  },
  {
    id: 'SG-0732-0651',
    name: '삼성동 651 빗물받이',
    address: '서울특별시 강남구 삼성로 651',
    lat: 37.5089,
    lng: 127.0612,
    status: 'danger',
    waterLevel: 16.3,
    waterLevelChange: 1.2,
    debrisLevel: 76,
    floodRisk: 76,
    inflowRate: 68,
    pumpStatus: 'active',
    connectionStatus: 'connected',
    lastUpdated: '2026-05-10 10:17:45'
  },
  {
    id: 'SG-0732-0310',
    name: '개포동 310 빗물받이',
    address: '서울특별시 강남구 개포로 310',
    lat: 37.4789,
    lng: 127.0534,
    status: 'offline',
    waterLevel: 0,
    waterLevelChange: 0,
    debrisLevel: 0,
    floodRisk: 0,
    inflowRate: 0,
    pumpStatus: 'error',
    connectionStatus: 'disconnected',
    lastUpdated: '2026-05-10 08:15:00'
  },
  {
    id: 'SG-0732-0423',
    name: '신사동 423 빗물받이',
    address: '서울특별시 강남구 신사로 423',
    lat: 37.5234,
    lng: 127.0198,
    status: 'normal',
    waterLevel: 3.2,
    waterLevelChange: 0.1,
    debrisLevel: 15,
    floodRisk: 12,
    inflowRate: 18,
    pumpStatus: 'inactive',
    connectionStatus: 'connected',
    lastUpdated: '2026-05-10 10:20:11'
  },
  {
    id: 'SG-0732-0567',
    name: '청담동 567 빗물받이',
    address: '서울특별시 강남구 청담로 567',
    lat: 37.5178,
    lng: 127.0478,
    status: 'normal',
    waterLevel: 4.5,
    waterLevelChange: 0.2,
    debrisLevel: 22,
    floodRisk: 18,
    inflowRate: 25,
    pumpStatus: 'inactive',
    connectionStatus: 'connected',
    lastUpdated: '2026-05-10 10:19:55'
  },
  {
    id: 'SG-0732-0789',
    name: '대치동 789 빗물받이',
    address: '서울특별시 강남구 대치로 789',
    lat: 37.4956,
    lng: 127.0623,
    status: 'warning',
    waterLevel: 11.2,
    waterLevelChange: 0.8,
    debrisLevel: 55,
    floodRisk: 52,
    inflowRate: 48,
    pumpStatus: 'active',
    connectionStatus: 'connected',
    lastUpdated: '2026-05-10 10:21:33'
  },
  {
    id: 'SG-0732-0234',
    name: '압구정동 234 빗물받이',
    address: '서울특별시 강남구 압구정로 234',
    lat: 37.5267,
    lng: 127.0345,
    status: 'normal',
    waterLevel: 2.8,
    waterLevelChange: 0.0,
    debrisLevel: 8,
    floodRisk: 5,
    inflowRate: 12,
    pumpStatus: 'inactive',
    connectionStatus: 'connected',
    lastUpdated: '2026-05-10 10:23:45'
  },
  {
    id: 'SG-0732-0456',
    name: '잠원동 456 빗물받이',
    address: '서울특별시 강남구 잠원로 456',
    lat: 37.5145,
    lng: 127.0123,
    status: 'normal',
    waterLevel: 5.1,
    waterLevelChange: 0.3,
    debrisLevel: 28,
    floodRisk: 22,
    inflowRate: 30,
    pumpStatus: 'inactive',
    connectionStatus: 'connected',
    lastUpdated: '2026-05-10 10:22:18'
  }
]

export const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    deviceId: 'SG-0732-0158',
    deviceName: '역삼동 152-1 빗물받이',
    type: 'danger',
    message: '수위 19.2cm | 누적 85%',
    waterLevel: 19.2,
    debrisLevel: 85,
    timestamp: '10:24'
  },
  {
    id: 'ALT-002',
    deviceId: 'SG-0732-0211',
    deviceName: '도곡동 311 빗물받이',
    type: 'danger',
    message: '수위 17.8cm | 누적 78%',
    waterLevel: 17.8,
    debrisLevel: 78,
    timestamp: '10:22'
  },
  {
    id: 'ALT-003',
    deviceId: 'SG-0732-0098',
    deviceName: '논현동 215 빗물받이',
    type: 'warning',
    message: '수위 9.5cm | 누적 62%',
    waterLevel: 9.5,
    debrisLevel: 62,
    timestamp: '10:18'
  },
  {
    id: 'ALT-004',
    deviceId: 'SG-0732-0651',
    deviceName: '삼성동 651 빗물받이',
    type: 'danger',
    message: '수위 16.3cm | 누적 76%',
    waterLevel: 16.3,
    debrisLevel: 76,
    timestamp: '10:17'
  },
  {
    id: 'ALT-005',
    deviceId: 'SG-0732-0310',
    deviceName: '개포동 310 빗물받이',
    type: 'info',
    message: '통신 단절',
    timestamp: '10:12'
  }
]

export const mockWeather: WeatherData = {
  temperature: 22.4,
  condition: 'rain',
  rainfall: 12.5,
  accumulatedRainfall: 85.3,
  humidity: 78
}

export const mockWaterLevelHistory: WaterLevelHistory[] = [
  { time: '00:00', level: 3.2, dangerLevel: 20 },
  { time: '02:00', level: 4.1, dangerLevel: 20 },
  { time: '04:00', level: 5.8, dangerLevel: 20 },
  { time: '06:00', level: 8.5, dangerLevel: 20 },
  { time: '08:00', level: 12.3, dangerLevel: 20 },
  { time: '10:00', level: 19.2, dangerLevel: 20 }
]

export const mockRainfallHistory: RainfallHistory[] = [
  { time: '00:00', rainfall: 2.5, accumulated: 10 },
  { time: '02:00', rainfall: 5.8, accumulated: 25 },
  { time: '04:00', rainfall: 8.2, accumulated: 42 },
  { time: '06:00', rainfall: 12.5, accumulated: 58 },
  { time: '08:00', rainfall: 15.3, accumulated: 72 },
  { time: '10:00', rainfall: 12.5, accumulated: 85 }
]

export const mockWorkLogs: WorkLog[] = [
  { id: 'WL-001', date: '05-10 08:45', type: '점검', deviceId: 'SG-0732-0123', worker: '김대성', result: '완료' },
  { id: 'WL-002', date: '05-10 07:30', type: '청소', deviceId: 'SG-0732-0098', worker: '이영우', result: '완료' },
  { id: 'WL-003', date: '05-09 16:20', type: '수리', deviceId: 'SG-0732-0066', worker: '박성준', result: '완료' },
  { id: 'WL-004', date: '05-09 14:05', type: '수리', deviceId: 'SG-0732-0023', worker: '최지훈', result: '완료' },
  { id: 'WL-005', date: '05-09 11:50', type: '점검', deviceId: 'SG-0732-0144', worker: '정지환', result: '완료' }
]

export const mockSystemStats: SystemStats = {
  totalDevices: 2482,
  normalCount: 1892,
  warningCount: 312,
  dangerCount: 48,
  offlineCount: 230,
  todayAlerts: 23,
  alertChange: 3
}

export const GANGNAM_GEO_CENTER = GANGNAM_CENTER
