export type BackendDrainStatus =
  | 'NORMAL'
  | 'NEED_INSPECTION'
  | 'FLOOD_RISK'
  | 'UNDER_MAINTENANCE'

export type DrainStatus = 'normal' | 'warning' | 'danger' | 'offline'

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface DrainListDto {
  drainId: number
  address: string
  latitude: number
  longitude: number
  status: BackendDrainStatus
  totalDepth: number
  latestDevicePhotoUrl: string | null
}

export interface DrainWorkPhotoDto {
  alertId: number
  status: 'ACTIVE' | 'PROCESSING' | 'RESOLVED'
  beforePhotoUrl: string | null
  afterPhotoUrl: string | null
  createdAt: string
  resolvedAt: string | null
}

export interface DrainDetailDto extends DrainListDto {
  trashLevelThreshold: number
  coverDistanceThreshold: number
  workPhotos: DrainWorkPhotoDto[]
}

export interface DrainCreateInput {
  address: string
  latitude: number
  longitude: number
  totalDepth: number
  trashLevelThreshold: number
  coverDistanceThreshold: number
}

export interface DrainCreateResponseDto {
  drainId: number
  address: string
  registeredAt: string
}

export interface DrainUpdateInput {
  address: string
  trashLevelThreshold: number
  coverDistanceThreshold: number
}

export interface LatestSensorReadingDto {
  drainId: number
  waterLevel: number
  trashLevel: number
  coverDistance: number | null
  batteryLevel: number
  signalStrength: number
  measuredAt: string
  receivedAt: string
}

export interface SensorHistoryDto {
  waterLevel: number
  trashLevel: number
  batteryLevel: number
  measuredAt: string
}

export interface DashboardStatisticsDto {
  totalDrainCount: number
  normalCount: number
  needInspectionCount: number
  floodRiskCount: number
  activeAlertCount: number
  processingAlertCount: number
}

export interface AlertListDto {
  alertId: number
  drainId: number
  workerId: number | null
  address: string | null
  latitude: number | null
  longitude: number | null
  riskLevel: 'NEED_INSPECTION' | 'FLOOD_RISK' | 'SENSOR_ERROR'
  status: 'ACTIVE' | 'PROCESSING' | 'RESOLVED'
  beforePhotoUrl: string | null
  afterPhotoUrl: string | null
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
}

export interface LoginResponseDto {
  userId: number
  accessToken: string
  username: string
  name: string
  role: 'ROLE_ADMIN' | 'ROLE_WORKER'
}

export interface SignupResponseDto {
  userId: number
  username: string
  name: string
  role: 'ROLE_ADMIN' | 'ROLE_WORKER'
  registeredAt: string
}

export interface WorkerDto {
  workerId: number
  name: string
  phoneNumber: string
}

export type AuthSession = LoginResponseDto

export interface DrainDevice {
  id: number
  name: string
  address: string
  lat: number
  lng: number
  status: DrainStatus
  backendStatus: BackendDrainStatus
  totalDepth: number
  waterLevel: number | null
  batteryLevel: number | null
  signalStrength: number | null
  connectionStatus: 'connected' | 'disconnected'
  lastUpdated: string | null
  imageUrl: string | null
}

export interface Alert {
  id: number
  deviceId: number
  workerId: number | null
  deviceName: string
  address: string | null
  type: 'danger' | 'warning' | 'info'
  riskLevel: AlertListDto['riskLevel']
  status: AlertListDto['status']
  beforePhotoUrl: string | null
  afterPhotoUrl: string | null
  message: string
  timestamp: string
}

export interface WaterLevelHistory {
  time: string
  level: number
  dangerLevel: number
}

export interface WorkLog {
  id: string
  date: string
  type: '점검' | '청소' | '수리' | '긴급'
  deviceId: number
  worker: string
  result: '완료' | '진행중' | '대기'
}

export interface SystemStats {
  totalDevices: number
  normalCount: number
  warningCount: number
  dangerCount: number
  offlineCount: number
  activeAlerts: number
}
