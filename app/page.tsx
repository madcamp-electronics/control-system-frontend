'use client'

import { useCallback, useEffect, useState } from 'react'
import { BarChart3, Bell, LoaderCircle, Settings, Wrench } from 'lucide-react'
import { AuthScreen } from '@/components/auth/auth-screen'
import { AlertList } from '@/components/dashboard/alert-list'
import { AlertWorkflow } from '@/components/dashboard/alert-workflow'
import { WaterLevelChart } from '@/components/dashboard/charts'
import { DispatchRoute } from '@/components/dashboard/dispatch-route'
import { DrainManagement } from '@/components/dashboard/drain-management'
import { Header } from '@/components/dashboard/header'
import { MapView } from '@/components/dashboard/map-view'
import { NoticeBar } from '@/components/dashboard/notice-bar'
import { Sidebar } from '@/components/dashboard/sidebar'
import { StatsCards } from '@/components/dashboard/stats-cards'
import {
  API_BASE_URL,
  ApiError,
  getAlerts,
  getDrains,
  getLatestSensorReadings,
  getSensorHistory,
  getWorkers,
} from '@/lib/api'
import type {
  Alert,
  AlertListDto,
  AuthSession,
  BackendDrainStatus,
  DrainDevice,
  DrainStatus,
  SystemStats,
  WaterLevelHistory,
  WorkerDto,
} from '@/lib/types'

const SESSION_KEY = 'smart-drain-session'

const EMPTY_STATS: SystemStats = {
  totalDevices: 0,
  normalCount: 0,
  warningCount: 0,
  dangerCount: 0,
  offlineCount: 0,
  activeAlerts: 0,
}

export default function DashboardPage() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [activeNav, setActiveNav] = useState('dashboard')
  const [devices, setDevices] = useState<DrainDevice[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [workers, setWorkers] = useState<WorkerDto[]>([])
  const [stats, setStats] = useState<SystemStats>(EMPTY_STATS)
  const [selectedDevice, setSelectedDevice] = useState<DrainDevice | null>(null)
  const [history, setHistory] = useState<WaterLevelHistory[]>([])
  const [historyDrainId, setHistoryDrainId] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = localStorage.getItem(SESSION_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as AuthSession
          if (typeof parsed.userId === 'number') {
            setSession(parsed)
          } else {
            localStorage.removeItem(SESSION_KEY)
          }
        }
      } catch {
        localStorage.removeItem(SESSION_KEY)
      } finally {
        setSessionChecked(true)
      }
    })
  }, [])

  const loadDashboard = useCallback(async () => {
    if (!session) return
    setLoading(true)
    setError(null)

    try {
      const [drainDtos, latestDtos, alertDtos, workerDtos] = await Promise.all([
        getDrains(session.accessToken),
        getLatestSensorReadings(session.accessToken),
        getAlerts(session.accessToken),
        session.role === 'ROLE_ADMIN' ? getWorkers(session.accessToken) : Promise.resolve([]),
      ])

      const latestByDrainId = new Map(latestDtos.map((reading) => [reading.drainId, reading]))
      const nextDevices: DrainDevice[] = drainDtos.map((drain) => {
        const latest = latestByDrainId.get(drain.drainId)
        return {
          id: drain.drainId,
          name: `빗물받이 #${drain.drainId}`,
          address: drain.address,
          lat: drain.latitude,
          lng: drain.longitude,
          status: latest ? mapDrainStatus(drain.status) : 'offline',
          backendStatus: drain.status,
          totalDepth: drain.totalDepth,
          waterLevel: latest?.waterLevel ?? null,
          batteryLevel: latest?.batteryLevel ?? null,
          signalStrength: latest?.signalStrength ?? null,
          connectionStatus: latest ? 'connected' : 'disconnected',
          lastUpdated: latest?.receivedAt ?? null,
          imageUrl: drain.latestDevicePhotoUrl
            ? `${API_BASE_URL}${drain.latestDevicePhotoUrl}`
            : null,
        }
      })

      const activeAlertDtos = alertDtos.filter((alert) => alert.status !== 'RESOLVED')
      const nextAlerts = activeAlertDtos.map(toAlert)

      setDevices(nextDevices)
      setAlerts(nextAlerts)
      setWorkers(workerDtos)
      setStats({
        totalDevices: nextDevices.length,
        normalCount: nextDevices.filter((device) => device.status === 'normal').length,
        warningCount: nextDevices.filter((device) => device.status === 'warning').length,
        dangerCount: nextDevices.filter((device) => device.status === 'danger').length,
        offlineCount: nextDevices.filter((device) => device.status === 'offline').length,
        activeAlerts: nextAlerts.length,
      })
      setSelectedDevice((current) =>
        current ? nextDevices.find((device) => device.id === current.id) ?? null : null
      )
      setLastUpdated(formatDisplayDate(new Date()))
    } catch (caught) {
      if (caught instanceof TypeError) {
        setError(`백엔드(${API_BASE_URL})에 연결할 수 없습니다.`)
      } else {
        setError(caught instanceof ApiError ? caught.message : '관제 데이터를 불러오지 못했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    queueMicrotask(() => void loadDashboard())
  }, [loadDashboard])

  useEffect(() => {
    if (!session || !selectedDevice || activeNav !== 'analytics') {
      return
    }

    const end = new Date()
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
    let cancelled = false

    getSensorHistory(
      selectedDevice.id,
      formatLocalDateTime(start),
      formatLocalDateTime(end),
      session.accessToken,
    )
      .then((readings) => {
        if (cancelled) return
        setHistory(
          [...readings].reverse().map((reading) => ({
            time: formatHistoryTime(reading.measuredAt),
            level: reading.waterLevel,
            dangerLevel: selectedDevice.totalDepth,
          }))
        )
        setHistoryDrainId(selectedDevice.id)
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : '센서 이력을 불러오지 못했습니다.')
        }
      })

    return () => { cancelled = true }
  }, [activeNav, selectedDevice, session])

  const handleAuthenticated = useCallback((nextSession: AuthSession) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setDevices([])
    setAlerts([])
    setWorkers([])
    setSelectedDevice(null)
  }, [])

  const handleSelectAlert = useCallback((deviceId: number) => {
    const device = devices.find((item) => item.id === deviceId)
    if (device) {
      setSelectedDevice(device)
      setActiveNav('dashboard')
    }
  }, [devices])

  if (!sessionChecked) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background text-muted-foreground">
        <LoaderCircle className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />
  }

  const renderDashboard = () => (
    <main className="grid min-h-0 flex-1 grid-rows-[76px_minmax(0,1fr)] gap-2.5 overflow-hidden p-2.5 2xl:grid-rows-[82px_minmax(0,1fr)] 2xl:gap-3 2xl:p-3">
      <section aria-label="시설 현황 요약" className="min-h-0">
        <StatsCards stats={stats} />
      </section>
      <section aria-label="센서 통합 관제" className="grid min-h-0 grid-cols-12 gap-2.5 2xl:gap-3">
        <div className="col-span-9 min-h-0">
          <MapView
            devices={devices}
            selectedDevice={selectedDevice}
            onSelectDevice={setSelectedDevice}
            onCloseDevice={() => setSelectedDevice(null)}
            region="빗물받이 센서 위치"
          />
        </div>
        <div className="col-span-3 min-h-0">
          <AlertList alerts={alerts} onSelectAlert={handleSelectAlert} />
        </div>
      </section>
    </main>
  )

  const renderAnalytics = () => (
    <main className="grid min-h-0 flex-1 grid-rows-[48px_minmax(0,1fr)] gap-3 overflow-hidden p-3">
      <WorkspaceHeading
        icon={<BarChart3 />}
        title="센서 수위 이력"
        description="선택한 빗물받이의 최근 24시간 초음파 계산 수위를 표시합니다."
        meta={selectedDevice ? `ID ${selectedDevice.id}` : '지도에서 시설을 선택하세요'}
      />
      {selectedDevice ? (
        <section className="grid min-h-0 grid-cols-12 gap-3" aria-label="센서 수위 분석">
          <div className="col-span-8 min-h-0">
            <WaterLevelChart
              data={historyDrainId === selectedDevice.id ? history : []}
              deviceId={selectedDevice.id}
            />
          </div>
          <div className="col-span-4 min-h-0">
            <DispatchRoute devices={[selectedDevice]} onSelectDevice={setSelectedDevice} />
          </div>
        </section>
      ) : <EmptyWorkspace message="대시보드 지도에서 빗물받이를 먼저 선택하세요." />}
    </main>
  )

  const renderEquipment = () => (
    <main className="grid min-h-0 flex-1 grid-rows-[48px_minmax(0,1fr)] gap-3 overflow-hidden p-3">
      <WorkspaceHeading
        icon={<Wrench />}
        title="빗물받이 시설 관리"
        description={session.role === 'ROLE_ADMIN'
          ? '시설 상세 정보를 확인하고 신규 등록 또는 임계값을 수정합니다.'
          : '시설 상세 정보와 임계값, 최근 작업 사진을 확인합니다.'}
        meta={`${devices.length}개 시설`}
      />
      <DrainManagement
        devices={devices}
        accessToken={session.accessToken}
        isAdmin={session.role === 'ROLE_ADMIN'}
        onChanged={loadDashboard}
      />
    </main>
  )

  const renderWorkspace = () => {
    switch (activeNav) {
      case 'alerts':
        return (
          <main className="grid min-h-0 flex-1 grid-rows-[48px_minmax(0,1fr)] gap-3 overflow-hidden p-3">
            <WorkspaceHeading
              icon={<Bell />}
              title="이상 알림 작업 처리"
              description={session.role === 'ROLE_WORKER'
                ? '알림을 접수하고 작업 전·후 사진을 등록한 뒤 완료 처리합니다.'
                : '작업자가 처리 중인 미해결 알림을 조회합니다.'}
              meta={`${alerts.length}건`}
            />
            <AlertWorkflow
              alerts={alerts}
              accessToken={session.accessToken}
              currentUserId={session.userId}
              isWorker={session.role === 'ROLE_WORKER'}
              workers={workers}
              onChanged={loadDashboard}
            />
          </main>
        )
      case 'analytics': return renderAnalytics()
      case 'equipment': return renderEquipment()
      case 'settings':
        return renderSinglePanel('시스템 설정', '관제 정책 설정은 이후 단계에서 연결합니다.', <Settings />, (
          <EmptyWorkspace message="현재 단계에서는 센서 조회와 인증 연결에 집중합니다." />
        ))
      default: return renderDashboard()
    }
  }

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} alertCount={alerts.length} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <Header
          lastUpdated={lastUpdated}
          onRefresh={() => void loadDashboard()}
          userName={session.name}
          userRole={session.role === 'ROLE_ADMIN' ? '관리자' : '현장 작업자'}
          loading={loading}
          onLogout={handleLogout}
        />
        {error && (
          <div role="alert" className="absolute left-1/2 top-[68px] z-50 -translate-x-1/2 rounded-md border border-rose-500/30 bg-card px-4 py-2 text-xs text-rose-300 shadow-xl">
            {error}
          </div>
        )}
        {renderWorkspace()}
        <NoticeBar />
      </div>
    </div>
  )
}

function mapDrainStatus(status: BackendDrainStatus): DrainStatus {
  switch (status) {
    case 'NORMAL': return 'normal'
    case 'NEED_INSPECTION':
    case 'UNDER_MAINTENANCE': return 'warning'
    case 'FLOOD_RISK': return 'danger'
  }
}

function toAlert(alert: AlertListDto): Alert {
  const type = alert.riskLevel === 'FLOOD_RISK'
    ? 'danger'
    : alert.riskLevel === 'SENSOR_ERROR' ? 'info' : 'warning'
  const message = alert.riskLevel === 'SENSOR_ERROR'
    ? '배터리 또는 통신 상태를 확인하세요.'
    : alert.riskLevel === 'FLOOD_RISK' ? '높은 수위가 감지되었습니다.' : '센서 임계값을 확인하세요.'

  return {
    id: alert.alertId,
    deviceId: alert.drainId,
    workerId: alert.workerId,
    deviceName: `빗물받이 #${alert.drainId}`,
    address: alert.address,
    type,
    riskLevel: alert.riskLevel,
    status: alert.status,
    beforePhotoUrl: alert.beforePhotoUrl,
    afterPhotoUrl: alert.afterPhotoUrl,
    message,
    timestamp: formatHistoryTime(alert.createdAt),
  }
}

function formatLocalDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function formatDisplayDate(date: Date) {
  return date.toLocaleString('ko-KR', { hour12: false })
}

function formatHistoryTime(value: string) {
  return value.replace('T', ' ').slice(5, 16)
}

function renderSinglePanel(
  title: string,
  description: string,
  icon: React.ReactNode,
  content: React.ReactNode,
) {
  return (
    <main className="grid min-h-0 flex-1 grid-rows-[48px_minmax(0,1fr)] gap-3 overflow-hidden p-3">
      <WorkspaceHeading icon={icon} title={title} description={description} />
      <section className="min-h-0">{content}</section>
    </main>
  )
}

interface WorkspaceHeadingProps {
  icon: React.ReactNode
  title: string
  description: string
  meta?: string
}

function WorkspaceHeading({ icon, title, description, meta }: WorkspaceHeadingProps) {
  return (
    <header className="flex min-w-0 items-center justify-between border-b border-border px-1">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-primary/15 bg-primary/8 text-primary [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        <div className="min-w-0">
          <h1 className="text-[14px] font-semibold text-foreground">{title}</h1>
          <p className="truncate text-[10px] text-muted-foreground">{description}</p>
        </div>
      </div>
      {meta && <span className="ml-4 shrink-0 rounded-md border border-border bg-card px-2.5 py-1 font-mono text-[9px] text-muted-foreground">{meta}</span>}
    </header>
  )
}

function EmptyWorkspace({ message }: { message: string }) {
  return (
    <div className="ops-panel grid place-items-center">
      <div className="text-center">
        <Settings className="mx-auto h-6 w-6 text-muted-foreground/50" />
        <p className="mt-3 text-[12px] font-medium text-foreground">준비 중</p>
        <p className="mt-1 text-[10px] text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
