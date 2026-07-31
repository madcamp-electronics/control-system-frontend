'use client'

import { useState, useCallback } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { MapView } from '@/components/dashboard/map-view'
import { AlertList } from '@/components/dashboard/alert-list'
import { WaterLevelChart, RainfallChart } from '@/components/dashboard/charts'
import { WorkLogTable } from '@/components/dashboard/work-log-table'
import { DispatchRoute } from '@/components/dashboard/dispatch-route'
import { NoticeBar } from '@/components/dashboard/notice-bar'
import {
  BarChart3,
  Bell,
  Settings,
  Wrench,
} from 'lucide-react'
import {
  mockDevices,
  mockAlerts,
  mockWeather,
  mockWaterLevelHistory,
  mockRainfallHistory,
  mockWorkLogs,
  mockSystemStats
} from '@/lib/mock-data'
import type { DrainDevice } from '@/lib/types'

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [selectedDevice, setSelectedDevice] = useState<DrainDevice | null>(null)
  const [lastUpdated, setLastUpdated] = useState('2026-05-10 10:24:30')

  const handleRefresh = useCallback(() => {
    setLastUpdated(new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\. /g, '-').replace('.', ''))
  }, [])

  const handleSelectDevice = useCallback((device: DrainDevice) => {
    setSelectedDevice(device)
  }, [])

  const handleSelectAlert = useCallback((deviceId: string) => {
    const device = mockDevices.find(d => d.id === deviceId)
    if (device) {
      setSelectedDevice(device)
    }
  }, [])

  const handleCloseDevice = useCallback(() => {
    setSelectedDevice(null)
  }, [])

  const renderDashboard = () => (
    <main className="grid min-h-0 flex-1 grid-rows-[76px_minmax(0,1fr)] gap-2.5 overflow-hidden p-2.5 2xl:grid-rows-[82px_minmax(0,1fr)] 2xl:gap-3 2xl:p-3">
      <section aria-label="시설 현황 요약" className="min-h-0">
        <StatsCards stats={mockSystemStats} />
      </section>

      <section
        aria-label="실시간 통합 관제"
        className="grid min-h-0 grid-cols-12 gap-2.5 2xl:gap-3"
      >
        <div className="col-span-9 min-h-0">
          <MapView
            devices={mockDevices}
            selectedDevice={selectedDevice}
            onSelectDevice={handleSelectDevice}
            onCloseDevice={handleCloseDevice}
            region="서울특별시 강남구"
          />
        </div>

        <div className="col-span-3 min-h-0">
          <AlertList alerts={mockAlerts} onSelectAlert={handleSelectAlert} />
        </div>
      </section>
    </main>
  )

  const renderAnalytics = () => (
    <main className="grid min-h-0 flex-1 grid-rows-[48px_minmax(0,1fr)] gap-3 overflow-hidden p-3">
      <WorkspaceHeading
        icon={<BarChart3 />}
        title="데이터 분석"
        description="센서 수위와 강우 데이터를 비교하여 배수 이상 징후를 분석합니다."
        meta={selectedDevice?.id ?? '전체 시설 평균'}
      />
      <section className="grid min-h-0 grid-cols-2 gap-3" aria-label="데이터 분석 차트">
        <WaterLevelChart
          data={mockWaterLevelHistory}
          deviceId={selectedDevice?.id}
        />
        <RainfallChart data={mockRainfallHistory} />
      </section>
    </main>
  )

  const renderEquipment = () => (
    <main className="grid min-h-0 flex-1 grid-rows-[48px_minmax(0,1fr)] gap-3 overflow-hidden p-3">
      <WorkspaceHeading
        icon={<Wrench />}
        title="장비 관리"
        description="위험 시설의 출동 우선순위와 현장 작업 처리 현황을 관리합니다."
        meta={`${mockSystemStats.dangerCount + mockSystemStats.warningCount}개 점검 대상`}
      />
      <section className="grid min-h-0 grid-cols-2 gap-3" aria-label="장비 운영 관리">
        <DispatchRoute devices={mockDevices} />
        <WorkLogTable logs={mockWorkLogs} />
      </section>
    </main>
  )

  const renderSinglePanel = (
    title: string,
    description: string,
    icon: React.ReactNode,
    content: React.ReactNode
  ) => (
    <main className="grid min-h-0 flex-1 grid-rows-[48px_minmax(0,1fr)] gap-3 overflow-hidden p-3">
      <WorkspaceHeading icon={icon} title={title} description={description} />
      <section className="min-h-0">{content}</section>
    </main>
  )

  const renderWorkspace = () => {
    switch (activeNav) {
      case 'dashboard':
        return renderDashboard()
      case 'alerts':
        return renderSinglePanel(
          '이상 알림',
          '침수 위험, 적체 및 통신 이상 이벤트를 확인합니다.',
          <Bell />,
          <AlertList alerts={mockAlerts} onSelectAlert={handleSelectAlert} />
        )
      case 'equipment':
        return renderEquipment()
      case 'analytics':
        return renderAnalytics()
      case 'settings':
        return renderSinglePanel(
          '시스템 설정',
          '관제 기준, 알림 임계값 및 사용자 권한을 관리합니다.',
          <Settings />,
          <EmptyWorkspace />
        )
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header 
          weather={mockWeather} 
          lastUpdated={lastUpdated} 
          onRefresh={handleRefresh} 
        />

        {renderWorkspace()}

        <NoticeBar />
      </div>
    </div>
  )
}

interface WorkspaceHeadingProps {
  icon: React.ReactNode
  title: string
  description: string
  meta?: string
}

function WorkspaceHeading({
  icon,
  title,
  description,
  meta,
}: WorkspaceHeadingProps) {
  return (
    <header className="flex min-w-0 items-center justify-between border-b border-border px-1">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-primary/15 bg-primary/8 text-primary [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
        <div className="min-w-0">
          <h1 className="text-[14px] font-semibold tracking-[-0.02em] text-foreground">{title}</h1>
          <p className="truncate text-[10px] text-muted-foreground">{description}</p>
        </div>
      </div>
      {meta && (
        <span className="ml-4 shrink-0 rounded-md border border-border bg-card px-2.5 py-1 font-mono text-[9px] text-muted-foreground">
          {meta}
        </span>
      )}
    </header>
  )
}

function EmptyWorkspace() {
  return (
    <div className="ops-panel grid place-items-center">
      <div className="text-center">
        <Settings className="mx-auto h-6 w-6 text-muted-foreground/50" />
        <p className="mt-3 text-[12px] font-medium text-foreground">설정 화면 준비 중</p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          백엔드 정책 API 연동 후 제공될 예정입니다.
        </p>
      </div>
    </div>
  )
}
