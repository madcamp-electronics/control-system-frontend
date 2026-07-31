'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { DrainDevice, DrainStatus } from '@/lib/types'
import { ZoomIn, ZoomOut, Locate, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MapViewProps {
  devices: DrainDevice[]
  selectedDevice: DrainDevice | null
  onSelectDevice: (device: DrainDevice) => void
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
    <div className="relative h-full min-h-[300px] bg-card rounded-xl border border-border overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" aria-label={`${region} 빗물받이 관제 지도`} />

      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-card/90 backdrop-blur-sm border-b border-border pointer-events-none">
        <h3 className="text-sm font-semibold text-foreground">{region}</h3>
        <span className="text-[11px] text-muted-foreground">Kakao Map</span>
      </div>

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
          <div className="absolute bottom-8 left-4 z-10 p-3 bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">범례</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-foreground">정상</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-foreground">점검요망</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-foreground">침수위험</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-slate-500" />
                <span className="text-foreground">오프라인</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 right-4 z-10 flex flex-col gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-card/90 backdrop-blur-sm shadow-lg"
              onClick={handleZoomIn}
              aria-label="지도 확대"
              title="지도 확대"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-card/90 backdrop-blur-sm shadow-lg"
              onClick={handleZoomOut}
              aria-label="지도 축소"
              title="지도 축소"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-card/90 backdrop-blur-sm shadow-lg"
              onClick={handleMoveToSelection}
              aria-label="선택 시설로 이동"
              title="선택 시설로 이동"
            >
              <Locate className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={isHybrid ? 'default' : 'secondary'}
              size="icon"
              className="h-8 w-8 backdrop-blur-sm shadow-lg"
              onClick={handleToggleMapType}
              aria-label="지도 유형 전환"
              title="일반 지도와 스카이뷰 전환"
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
