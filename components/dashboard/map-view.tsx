'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { DrainDevice, DrainStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  ZoomIn,
  ZoomOut,
  Locate,
  Layers,
  X,
  Waves,
  Activity,
  Gauge,
  Trash2,
  Wifi,
  Clock3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MapViewProps {
  devices: DrainDevice[]
  selectedDevice: DrainDevice | null
  onSelectDevice: (device: DrainDevice) => void
  onCloseDevice: () => void
  region: string
}

interface KakaoLatLng {
  readonly __kakaoLatLngBrand?: never
}

interface KakaoMap {
  getLevel(): number
  panTo(position: KakaoLatLng): void
  relayout(): void
  setCenter(position: KakaoLatLng): void
  setLevel(level: number, options?: { animate?: boolean }): void
  setMapTypeId(mapTypeId: string): void
}

interface KakaoCustomOverlay {
  setMap(map: KakaoMap | null): void
}

interface KakaoMapsApi {
  load(callback: () => void): void
  LatLng: new (lat: number, lng: number) => KakaoLatLng
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number }
  ) => KakaoMap
  CustomOverlay: new (options: {
    position: KakaoLatLng
    content: HTMLElement
    xAnchor: number
    yAnchor: number
    zIndex: number
  }) => KakaoCustomOverlay
  MapTypeId: {
    ROADMAP: string
    HYBRID: string
  }
}

declare global {
  interface Window {
    kakao?: {
      maps: KakaoMapsApi
    }
  }
}

const KAKAO_MAP_SCRIPT_ID = 'kakao-map-sdk'
const DEFAULT_CENTER = { lat: 37.4979, lng: 127.0276 }

let kakaoMapsPromise: Promise<KakaoMapsApi> | null = null

function loadKakaoMaps(appKey: string): Promise<KakaoMapsApi> {
  if (window.kakao?.maps?.Map) {
    return Promise.resolve(window.kakao.maps)
  }

  if (kakaoMapsPromise) {
    return kakaoMapsPromise
  }

  const loadingPromise = new Promise<KakaoMapsApi>((resolve, reject) => {
    const finishLoading = () => {
      if (!window.kakao?.maps) {
        reject(new Error('카카오맵 SDK를 찾을 수 없습니다.'))
        return
      }

      window.kakao.maps.load(() => resolve(window.kakao!.maps))
    }

    const existingScript = document.getElementById(
      KAKAO_MAP_SCRIPT_ID
    ) as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', finishLoading, { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('카카오맵 SDK를 불러오지 못했습니다.')),
        { once: true }
      )
      return
    }

    const script = document.createElement('script')
    script.id = KAKAO_MAP_SCRIPT_ID
    script.async = true
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`
    script.addEventListener('load', finishLoading, { once: true })
    script.addEventListener(
      'error',
      () => reject(new Error('카카오맵 SDK를 불러오지 못했습니다.')),
      { once: true }
    )
    document.head.appendChild(script)
  }).catch((error: unknown) => {
    kakaoMapsPromise = null
    throw error
  })

  kakaoMapsPromise = loadingPromise
  return loadingPromise
}

function getStatusLabel(status: DrainStatus): string {
  switch (status) {
    case 'normal':
      return '정상'
    case 'warning':
      return '점검요망'
    case 'danger':
      return '침수위험'
    case 'offline':
      return '오프라인'
  }
}

function getStatusAppearance(status: DrainStatus) {
  switch (status) {
    case 'normal':
      return {
        badge: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
        dot: 'bg-emerald-400',
      }
    case 'warning':
      return {
        badge: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
        dot: 'bg-amber-400',
      }
    case 'danger':
      return {
        badge: 'border-rose-500/25 bg-rose-500/10 text-rose-300',
        dot: 'bg-rose-400',
      }
    case 'offline':
      return {
        badge: 'border-slate-500/25 bg-slate-500/10 text-slate-300',
        dot: 'bg-slate-400',
      }
  }
}

function createDeviceMarker(
  device: DrainDevice,
  selected: boolean,
  onSelect: () => void
): HTMLButtonElement {
  const marker = document.createElement('button')
  marker.type = 'button'
  marker.className = [
    'kakao-device-marker',
    `kakao-device-marker--${device.status}`,
    selected ? 'kakao-device-marker--selected' : '',
  ].filter(Boolean).join(' ')
  marker.title = `${device.name} · ${getStatusLabel(device.status)}`
  marker.setAttribute('aria-label', marker.title)

  const pulse = document.createElement('span')
  pulse.className = 'kakao-device-marker__pulse'

  const dot = document.createElement('span')
  dot.className = 'kakao-device-marker__dot'

  marker.append(pulse, dot)
  marker.addEventListener('click', onSelect)

  return marker
}

export function MapView({
  devices,
  selectedDevice,
  onSelectDevice,
  onCloseDevice,
  region,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<KakaoMap | null>(null)
  const mapsApiRef = useRef<KakaoMapsApi | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isHybrid, setIsHybrid] = useState(false)
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY?.trim()
  const configurationError = appKey
    ? null
    : 'NEXT_PUBLIC_KAKAO_MAP_APP_KEY가 설정되지 않았습니다.'

  useEffect(() => {
    if (!appKey) {
      return
    }

    let cancelled = false

    loadKakaoMaps(appKey)
      .then((maps) => {
        if (cancelled || !containerRef.current) return

        const centerDevice = selectedDevice ?? devices[0]
        const center = centerDevice
          ? new maps.LatLng(centerDevice.lat, centerDevice.lng)
          : new maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)

        mapsApiRef.current = maps
        mapRef.current = new maps.Map(containerRef.current, {
          center,
          level: 6,
        })
        setMapReady(true)
        setMapError(null)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setMapError(
          error instanceof Error
            ? error.message
            : '카카오맵을 초기화하지 못했습니다.'
        )
      })

    return () => {
      cancelled = true
      mapRef.current = null
      mapsApiRef.current = null
    }
  // 지도 인스턴스는 SDK 키가 바뀔 때만 새로 생성합니다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appKey])

  useEffect(() => {
    if (!mapReady || !mapRef.current || !mapsApiRef.current) return

    const map = mapRef.current
    const maps = mapsApiRef.current
    const overlays = devices.map((device) => {
      const selectDevice = () => onSelectDevice(device)
      const marker = createDeviceMarker(
        device,
        selectedDevice?.id === device.id,
        selectDevice
      )
      const overlay = new maps.CustomOverlay({
        position: new maps.LatLng(device.lat, device.lng),
        content: marker,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: selectedDevice?.id === device.id ? 20 : 10,
      })

      overlay.setMap(map)

      return { overlay, marker, selectDevice }
    })

    return () => {
      overlays.forEach(({ overlay, marker, selectDevice }) => {
        marker.removeEventListener('click', selectDevice)
        overlay.setMap(null)
      })
    }
  }, [devices, mapReady, onSelectDevice, selectedDevice?.id])

  useEffect(() => {
    if (!mapReady || !mapRef.current || !mapsApiRef.current || !selectedDevice) {
      return
    }

    mapRef.current.panTo(
      new mapsApiRef.current.LatLng(selectedDevice.lat, selectedDevice.lng)
    )
  }, [mapReady, selectedDevice])

  useEffect(() => {
    if (!mapReady || !containerRef.current || !mapRef.current) return

    const map = mapRef.current
    const observer = new ResizeObserver(() => map.relayout())
    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [mapReady])

  const handleZoomIn = useCallback(() => {
    const map = mapRef.current
    if (map) map.setLevel(Math.max(1, map.getLevel() - 1), { animate: true })
  }, [])

  const handleZoomOut = useCallback(() => {
    const map = mapRef.current
    if (map) map.setLevel(map.getLevel() + 1, { animate: true })
  }, [])

  const handleMoveToSelection = useCallback(() => {
    const map = mapRef.current
    const maps = mapsApiRef.current
    const target = selectedDevice ?? devices[0]
    if (!map || !maps || !target) return

    map.panTo(new maps.LatLng(target.lat, target.lng))
  }, [devices, selectedDevice])

  const handleToggleMapType = useCallback(() => {
    const map = mapRef.current
    const maps = mapsApiRef.current
    if (!map || !maps) return

    const nextHybrid = !isHybrid
    map.setMapTypeId(
      nextHybrid ? maps.MapTypeId.HYBRID : maps.MapTypeId.ROADMAP
    )
    setIsHybrid(nextHybrid)
  }, [isHybrid])

  return (
    <section className="relative h-full min-h-0 overflow-hidden rounded-lg border border-border bg-card shadow-panel">
      <div ref={containerRef} className="absolute inset-0" aria-label={`${region} 빗물받이 관제 지도`} />

      <header className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex h-[38px] items-center justify-between border-b border-border bg-card/92 px-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <h2 className="text-[12px] font-semibold tracking-[-0.01em] text-foreground">{region}</h2>
          <span className="h-3 w-px bg-border" />
          <span className="text-[9px] text-muted-foreground">통합관제지도</span>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgb(52_211_153_/_12%)]" />
          LIVE
        </span>
      </header>

      {(configurationError ?? mapError) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-card p-6">
          <div className="max-w-sm text-center">
            <p className="text-sm font-semibold text-foreground">지도를 표시할 수 없습니다</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {configurationError ?? mapError}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              환경변수와 카카오 디벨로퍼스의 JavaScript SDK 도메인을 확인하세요.
            </p>
          </div>
        </div>
      )}

      {!mapReady && !configurationError && !mapError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card">
          <p className="text-sm text-muted-foreground">지도를 불러오는 중입니다…</p>
        </div>
      )}

      {mapReady && (
        <>
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 rounded-md border border-border bg-card/92 px-2.5 py-1.5 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-[9px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-foreground/85">정상</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px]">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="text-foreground/85">점검</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px]">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              <span className="text-foreground/85">위험</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px]">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span className="text-foreground/85">통신 이상</span>
            </div>
          </div>

          <div className="absolute bottom-3 right-3 z-10 flex flex-col overflow-hidden rounded-md border border-border bg-card/92 shadow-lg backdrop-blur-md">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-none border-b border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              onClick={handleZoomIn}
              aria-label="지도 확대"
              title="지도 확대"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-none border-b border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              onClick={handleZoomOut}
              aria-label="지도 축소"
              title="지도 축소"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-none border-b border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              onClick={handleMoveToSelection}
              aria-label="선택 시설로 이동"
              title="선택 시설로 이동"
            >
              <Locate className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7 rounded-none text-muted-foreground hover:bg-secondary hover:text-foreground',
                isHybrid && 'bg-primary/12 text-primary'
              )}
              onClick={handleToggleMapType}
              aria-label="지도 유형 전환"
              title="일반 지도와 스카이뷰 전환"
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>

          {selectedDevice && (
            <DevicePopup device={selectedDevice} onClose={onCloseDevice} />
          )}
        </>
      )}
    </section>
  )
}

interface DevicePopupProps {
  device: DrainDevice
  onClose: () => void
}

function DevicePopup({ device, onClose }: DevicePopupProps) {
  const status = getStatusAppearance(device.status)

  return (
    <aside
      role="dialog"
      aria-label={`${device.name} 시설 정보`}
      className="absolute right-3 top-[50px] z-20 w-[320px] overflow-hidden rounded-lg border border-border-strong bg-card/96 shadow-[0_18px_48px_rgb(0_0_0_/_35%)] backdrop-blur-xl"
    >
      <header className="flex h-10 items-center justify-between border-b border-border px-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', status.dot)} />
          <span className="truncate font-mono text-[9px] text-muted-foreground">{device.id}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="시설 정보 닫기"
          title="닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="px-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[13px] font-semibold tracking-[-0.02em] text-foreground">
              {device.name}
            </h3>
            <p className="mt-1 truncate text-[9px] text-muted-foreground">{device.address}</p>
          </div>
          <span
            className={cn(
              'inline-flex shrink-0 items-center rounded border px-2 py-1 text-[8px] font-semibold',
              status.badge
            )}
          >
            {getStatusLabel(device.status)}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-md border border-border bg-background/35">
          <PopupMetric
            icon={<Waves />}
            label="현재 수위"
            value={`${device.waterLevel.toFixed(1)} cm`}
            alert={device.floodRisk >= 70}
          />
          <PopupMetric
            icon={<Activity />}
            label="5분 변화"
            value={`${device.waterLevelChange > 0 ? '+' : ''}${device.waterLevelChange.toFixed(1)} cm`}
            alert={device.waterLevelChange >= 1}
          />
          <PopupMetric
            icon={<Gauge />}
            label="위험도"
            value={`${device.floodRisk}%`}
            alert={device.floodRisk >= 70}
          />
          <PopupMetric
            icon={<Trash2 />}
            label="이물질"
            value={`${device.debrisLevel}%`}
            alert={device.debrisLevel >= 70}
          />
          <PopupMetric
            icon={<Wifi />}
            label="통신"
            value={device.connectionStatus === 'connected' ? '정상' : '단절'}
            alert={device.connectionStatus === 'disconnected'}
          />
          <PopupMetric
            icon={<Clock3 />}
            label="최근 수신"
            value={device.lastUpdated.slice(11)}
          />
        </div>
      </div>

      <footer className="flex h-9 items-center justify-between border-t border-border bg-secondary/25 px-3">
        <span className="text-[9px] text-muted-foreground">
          마커를 선택해 시설 정보를 전환할 수 있습니다.
        </span>
        <button
          type="button"
          className="text-[9px] font-semibold text-primary transition-colors hover:text-primary/75"
        >
          상세 이력
        </button>
      </footer>
    </aside>
  )
}

interface PopupMetricProps {
  icon: React.ReactNode
  label: string
  value: string
  alert?: boolean
}

function PopupMetric({ icon, label, value, alert = false }: PopupMetricProps) {
  return (
    <div className="flex min-w-0 items-center gap-2 border-b border-r border-border px-2 py-2.5 [border-right-width:1px] [&:nth-child(3n)]:border-r-0 [&:nth-child(n+4)]:border-b-0">
      <span className="shrink-0 text-muted-foreground [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-[8px] text-muted-foreground">{label}</span>
        <strong
          className={cn(
            'block truncate font-mono text-[10px] font-semibold tabular-nums',
            alert ? 'text-rose-300' : 'text-foreground'
          )}
        >
          {value}
        </strong>
      </span>
    </div>
  )
}
