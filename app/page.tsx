'use client'

import { useState, useCallback } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { MapView } from '@/components/dashboard/map-view'
import { AlertList } from '@/components/dashboard/alert-list'
import { DeviceDetail } from '@/components/dashboard/device-detail'
import { WaterLevelChart, RainfallChart } from '@/components/dashboard/charts'
import { WorkLogTable } from '@/components/dashboard/work-log-table'
import { DispatchRoute } from '@/components/dashboard/dispatch-route'
import { NoticeBar } from '@/components/dashboard/notice-bar'
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
  const [selectedDevice, setSelectedDevice] = useState<DrainDevice | null>(mockDevices[0])
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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header 
          weather={mockWeather} 
          lastUpdated={lastUpdated} 
          onRefresh={handleRefresh} 
        />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-4 space-y-4">
          {/* Stats Cards */}
          <StatsCards stats={mockSystemStats} />

          {/* Main Grid - Map, Alerts, Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ height: 'calc(100vh - 380px)', minHeight: '350px' }}>
            {/* Map View - Takes 7 columns on large screens */}
            <div className="lg:col-span-7 min-h-[300px]">
              <MapView
                devices={mockDevices}
                selectedDevice={selectedDevice}
                onSelectDevice={handleSelectDevice}
                region="서울특별시 강남구"
              />
            </div>

            {/* Right Panels - Takes 5 columns on large screens */}
            <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {/* Alert List */}
              <div className="min-h-[200px] lg:flex-1 lg:min-h-0">
                <AlertList alerts={mockAlerts} onSelectAlert={handleSelectAlert} />
              </div>
              
              {/* Device Detail */}
              <div className="min-h-[200px] lg:flex-1 lg:min-h-0">
                <DeviceDetail device={selectedDevice} />
              </div>
            </div>
          </div>

          {/* Bottom Grid - Charts and Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-auto xl:h-56">
            {/* Water Level Chart */}
            <div className="h-56 xl:h-full">
              <WaterLevelChart 
                data={mockWaterLevelHistory} 
                deviceId={selectedDevice?.id}
              />
            </div>

            {/* Rainfall Chart */}
            <div className="h-56 xl:h-full">
              <RainfallChart data={mockRainfallHistory} />
            </div>

            {/* Dispatch Route */}
            <div className="h-56 xl:h-full">
              <DispatchRoute devices={mockDevices} />
            </div>

            {/* Work Log Table */}
            <div className="h-56 xl:h-full">
              <WorkLogTable logs={mockWorkLogs} />
            </div>
          </div>
        </main>

        {/* Notice Bar */}
        <NoticeBar />
      </div>
    </div>
  )
}
