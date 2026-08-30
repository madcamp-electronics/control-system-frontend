import type {
  AlertListDto,
  ApiResponse,
  DashboardStatisticsDto,
  DrainCreateInput,
  DrainCreateResponseDto,
  DrainDetailDto,
  DrainListDto,
  DrainUpdateInput,
  LatestSensorReadingDto,
  LoginResponseDto,
  SensorHistoryDto,
  SignupResponseDto,
  WorkerDto,
} from './types'

// Client-side requests use a same-origin proxy. The actual backend URL is read
// only by the Next.js server from API_BASE_URL in next.config.mjs.
export const API_BASE_URL = '/backend'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  let body: ApiResponse<T> | null = null
  try {
    body = (await response.json()) as ApiResponse<T>
  } catch {
    // 연결 실패나 비 JSON 오류 응답은 아래 공통 오류로 처리합니다.
  }

  if (!response.ok || !body?.success) {
    throw new ApiError(body?.message || `API 요청 실패 (${response.status})`, response.status)
  }

  return body.data
}

export function login(username: string, password: string) {
  return request<LoginResponseDto>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function signup(input: {
  username: string
  password: string
  name: string
  phoneNumber: string
  role: 'ROLE_ADMIN' | 'ROLE_WORKER'
}) {
  return request<SignupResponseDto>('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getDrains(accessToken: string) {
  return request<DrainListDto[]>('/api/v1/drains', {}, accessToken)
}

export function getDrainDetail(drainId: number, accessToken: string) {
  return request<DrainDetailDto>(`/api/v1/drains/${drainId}`, {}, accessToken)
}

export function createDrain(input: DrainCreateInput, accessToken: string) {
  return request<DrainCreateResponseDto>('/api/v1/drains', {
    method: 'POST',
    body: JSON.stringify(input),
  }, accessToken)
}

export function updateDrain(
  drainId: number,
  input: DrainUpdateInput,
  accessToken: string,
) {
  return request<void>(`/api/v1/drains/${drainId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  }, accessToken)
}

export function getLatestSensorReadings(accessToken: string) {
  return request<LatestSensorReadingDto[]>('/api/v1/sensors/latest', {}, accessToken)
}

export function getLatestSensorReading(drainId: number, accessToken: string) {
  return request<LatestSensorReadingDto>(
    `/api/v1/sensors/drains/${drainId}/latest`,
    {},
    accessToken,
  )
}

export function getDashboardStatistics(accessToken: string) {
  return request<DashboardStatisticsDto>('/api/v1/dashboard/statistics', {}, accessToken)
}

export function getAlerts(accessToken: string) {
  return request<AlertListDto[]>('/api/v1/alerts', {}, accessToken)
}

export function acceptAlert(alertId: number, accessToken: string) {
  return request<void>(`/api/v1/alerts/${alertId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'PROCESSING' }),
  }, accessToken)
}

export function getWorkers(accessToken: string) {
  return request<WorkerDto[]>('/api/v1/workers', {}, accessToken)
}

export function assignAlert(alertId: number, workerId: number, accessToken: string) {
  return request<void>(`/api/v1/alerts/${alertId}/assignment`, {
    method: 'PATCH',
    body: JSON.stringify({ workerId }),
  }, accessToken)
}

export function completeAlert(
  alertId: number,
  beforeImageFile: File,
  afterImageFile: File,
  accessToken: string,
) {
  const body = new FormData()
  body.set('beforeImageFile', beforeImageFile)
  body.set('afterImageFile', afterImageFile)
  return request<void>(`/api/v1/alerts/${alertId}/complete`, {
    method: 'POST',
    body,
  }, accessToken)
}

export function getSensorHistory(
  drainId: number,
  startTime: string,
  endTime: string,
  accessToken: string,
) {
  const params = new URLSearchParams({ startTime, endTime })
  return request<SensorHistoryDto[]>(
    `/api/v1/sensors/drains/${drainId}/history?${params}`,
    {},
    accessToken,
  )
}
