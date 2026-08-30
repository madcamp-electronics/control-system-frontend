'use client'

import { FormEvent, useState } from 'react'
import {
  CirclePlus,
  Battery,
  Clock3,
  ImageIcon,
  LoaderCircle,
  MapPin,
  Pencil,
  RefreshCw,
  Save,
  ShieldCheck,
  Waves,
  Wifi,
} from 'lucide-react'
import {
  API_BASE_URL,
  ApiError,
  createDrain,
  getDrainDetail,
  getLatestSensorReading,
  updateDrain,
} from '@/lib/api'
import type { DrainDetailDto, DrainDevice, LatestSensorReadingDto } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface DrainManagementProps {
  devices: DrainDevice[]
  accessToken: string
  isAdmin: boolean
  onChanged: () => Promise<void>
}

type EditorMode = 'create' | 'edit' | null

export function DrainManagement({
  devices,
  accessToken,
  isAdmin,
  onChanged,
}: DrainManagementProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<DrainDetailDto | null>(null)
  const [latestReading, setLatestReading] = useState<LatestSensorReadingDto | null>(null)
  const [editorMode, setEditorMode] = useState<EditorMode>(null)
  const [loading, setLoading] = useState(false)
  const [sensorLoading, setSensorLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sensorError, setSensorError] = useState<string | null>(null)

  async function loadDetail(drainId: number) {
    setLoading(true)
    setError(null)
    setSensorError(null)
    setLatestReading(null)

    const [detailResult, sensorResult] = await Promise.allSettled([
      getDrainDetail(drainId, accessToken),
      getLatestSensorReading(drainId, accessToken),
    ])

    if (detailResult.status === 'fulfilled') {
      setDetail(detailResult.value)
    } else {
      setError(toErrorMessage(detailResult.reason))
    }

    if (sensorResult.status === 'fulfilled') {
      setLatestReading(sensorResult.value)
    } else {
      setSensorError(sensorResult.reason instanceof ApiError && sensorResult.reason.status === 404
        ? '아직 수신된 센서 측정값이 없습니다.'
        : toErrorMessage(sensorResult.reason))
    }
    setLoading(false)
  }

  async function refreshLatestReading() {
    if (selectedId == null) return
    setSensorLoading(true)
    setSensorError(null)
    try {
      setLatestReading(await getLatestSensorReading(selectedId, accessToken))
    } catch (caught) {
      setSensorError(caught instanceof ApiError && caught.status === 404
        ? '아직 수신된 센서 측정값이 없습니다.'
        : toErrorMessage(caught))
    } finally {
      setSensorLoading(false)
    }
  }

  function selectDrain(drainId: number) {
    setSelectedId(drainId)
    setDetail(null)
    setLatestReading(null)
    setEditorMode(null)
    void loadDetail(drainId)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isAdmin || !editorMode) return

    const values = new FormData(event.currentTarget)
    setSaving(true)
    setError(null)

    try {
      let savedId: number
      if (editorMode === 'create') {
        const created = await createDrain({
          address: textValue(values, 'address'),
          latitude: numberValue(values, 'latitude'),
          longitude: numberValue(values, 'longitude'),
          totalDepth: numberValue(values, 'totalDepth'),
          trashLevelThreshold: numberValue(values, 'trashLevelThreshold'),
          coverDistanceThreshold: numberValue(values, 'coverDistanceThreshold'),
        }, accessToken)
        savedId = created.drainId
      } else if (detail) {
        await updateDrain(detail.drainId, {
          address: textValue(values, 'address'),
          trashLevelThreshold: numberValue(values, 'trashLevelThreshold'),
          coverDistanceThreshold: numberValue(values, 'coverDistanceThreshold'),
        }, accessToken)
        savedId = detail.drainId
      } else {
        return
      }

      setSelectedId(savedId)
      setDetail(null)
      setEditorMode(null)
      await onChanged()
      await loadDetail(savedId)
    } catch (caught) {
      setError(toErrorMessage(caught))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="grid min-h-0 grid-cols-1 gap-3 md:grid-cols-[minmax(280px,0.8fr)_minmax(420px,1.2fr)]">
      <div className="ops-panel h-[320px] min-h-0 md:h-full">
        <header className="ops-panel__header min-h-12 px-4">
          <div>
            <h2 className="text-[13px] font-semibold text-foreground">등록 시설</h2>
            <p className="mt-0.5 text-[9px] text-muted-foreground">시설을 선택하면 상세 정보를 조회합니다.</p>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => {
                setSelectedId(null)
                setDetail(null)
                setLatestReading(null)
                setEditorMode('create')
                setError(null)
              }}
            >
              <CirclePlus className="h-3.5 w-3.5" />
              신규 등록
            </Button>
          )}
        </header>

        <div className="min-h-0 flex-1 divide-y divide-border/75 overflow-auto">
          {devices.map((device) => (
            <button
              key={device.id}
              type="button"
              onClick={() => selectDrain(device.id)}
              className={cn(
                'grid h-16 w-full grid-cols-[minmax(0,1fr)_80px] items-center gap-3 px-4 text-left transition-colors hover:bg-secondary/35',
                selectedId === device.id && editorMode !== 'create' && 'bg-primary/8'
              )}
            >
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold text-foreground">빗물받이 #{device.id}</span>
                <span className="mt-1 flex items-center gap-1 truncate text-[9px] text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" /> {device.address}
                </span>
              </span>
              <span className="text-right font-mono text-[10px] text-muted-foreground">
                {device.waterLevel == null ? '미수신' : `${device.waterLevel.toFixed(1)} cm`}
              </span>
            </button>
          ))}
          {devices.length === 0 && (
            <div className="grid h-40 place-items-center text-xs text-muted-foreground">등록된 시설이 없습니다.</div>
          )}
        </div>
      </div>

      <div className="ops-panel h-auto min-h-[420px] overflow-auto p-4 sm:p-5 md:h-full md:min-h-0">
        {error && (
          <p role="alert" className="mb-4 rounded-md border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {error}
          </p>
        )}

        {loading ? (
          <div className="grid h-full place-items-center text-muted-foreground">
            <LoaderCircle className="h-6 w-6 animate-spin" />
          </div>
        ) : editorMode ? (
          <DrainEditor
            key={`${editorMode}-${detail?.drainId ?? 'new'}`}
            mode={editorMode}
            detail={detail}
            saving={saving}
            onSubmit={handleSubmit}
            onCancel={() => setEditorMode(null)}
          />
        ) : detail ? (
          <DrainDetail
            detail={detail}
            latestReading={latestReading}
            sensorLoading={sensorLoading}
            sensorError={sensorError}
            isAdmin={isAdmin}
            onEdit={() => setEditorMode('edit')}
            onRefreshSensor={() => void refreshLatestReading()}
          />
        ) : (
          <div className="grid h-full min-h-64 place-items-center text-center">
            <div>
              <Waves className="mx-auto h-7 w-7 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium text-foreground">시설을 선택하세요</p>
              <p className="mt-1 text-xs text-muted-foreground">관리자와 작업자 모두 상세 정보를 볼 수 있습니다.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function DrainDetail({
  detail,
  latestReading,
  sensorLoading,
  sensorError,
  isAdmin,
  onEdit,
  onRefreshSensor,
}: {
  detail: DrainDetailDto
  latestReading: LatestSensorReadingDto | null
  sensorLoading: boolean
  sensorError: string | null
  isAdmin: boolean
  onEdit: () => void
  onRefreshSensor: () => void
}) {
  return (
    <div>
      <header className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="font-mono text-[10px] text-primary">DRAIN #{detail.drainId}</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">빗물받이 상세 정보</h2>
          <p className="mt-1 text-xs text-muted-foreground">{detail.address}</p>
        </div>
        {isAdmin && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" /> 수정
          </Button>
        )}
      </header>

      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailItem label="상태" value={statusLabel(detail.status)} />
        <DetailItem label="전체 높이" value={`${detail.totalDepth} cm`} />
        <DetailItem label="위도" value={String(detail.latitude)} />
        <DetailItem label="경도" value={String(detail.longitude)} />
        <DetailItem label="수위·이물질 임계값" value={`${detail.trashLevelThreshold} cm`} />
        <DetailItem label="덮개 거리 임계값" value={`${detail.coverDistanceThreshold} cm`} />
      </dl>

      <section className="mt-6 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">최신 센서값</h3>
            <p className="mt-1 text-[10px] text-muted-foreground">이 시설에서 마지막으로 수신한 측정값입니다.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={onRefreshSensor}
            disabled={sensorLoading}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', sensorLoading && 'animate-spin')} />
            센서값 새로고침
          </Button>
        </div>

        {latestReading ? (
          <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SensorItem icon={<Waves />} label="현재 수위" value={`${latestReading.waterLevel.toFixed(1)} cm`} />
            <SensorItem icon={<Battery />} label="배터리" value={`${latestReading.batteryLevel.toFixed(0)}%`} />
            <SensorItem icon={<Wifi />} label="신호 세기" value={`${latestReading.signalStrength} dBm`} />
            <SensorItem
              icon={<Waves />}
              label="덮개 거리"
              value={latestReading.coverDistance == null ? '-' : `${latestReading.coverDistance.toFixed(1)} cm`}
            />
            <SensorItem icon={<Clock3 />} label="측정 시각" value={formatDateTime(latestReading.measuredAt)} />
            <SensorItem icon={<Clock3 />} label="수신 시각" value={formatDateTime(latestReading.receivedAt)} />
          </dl>
        ) : (
          <p className="mt-3 rounded-md bg-secondary/25 px-3 py-4 text-xs text-muted-foreground">
            {sensorError ?? '센서값을 불러오는 중입니다.'}
          </p>
        )}
      </section>

      {detail.latestDevicePhotoUrl && (
        <a
          href={absoluteAssetUrl(detail.latestDevicePhotoUrl)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-secondary/30 text-xs font-medium text-primary hover:bg-secondary"
        >
          <ImageIcon className="h-4 w-4" /> 최근 센서 사진 보기
        </a>
      )}

      <section className="mt-6 border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-foreground">최근 완료 작업 사진</h3>
        {detail.workPhotos.length > 0 ? detail.workPhotos.map((photo) => (
          <div key={photo.alertId} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PhotoLink label="작업 전 사진" url={photo.beforePhotoUrl} />
            <PhotoLink label="작업 후 사진" url={photo.afterPhotoUrl} />
          </div>
        )) : (
          <p className="mt-3 rounded-md bg-secondary/25 px-3 py-4 text-xs text-muted-foreground">등록된 완료 작업 사진이 없습니다.</p>
        )}
      </section>
    </div>
  )
}

function DrainEditor({
  mode,
  detail,
  saving,
  onSubmit,
  onCancel,
}: {
  mode: Exclude<EditorMode, null>
  detail: DrainDetailDto | null
  saving: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}) {
  return (
    <form onSubmit={onSubmit}>
      <header className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[10px] font-semibold">관리자 전용</span>
        </div>
        <h2 className="mt-2 text-lg font-semibold text-foreground">
          {mode === 'create' ? '빗물받이 신규 등록' : `빗물받이 #${detail?.drainId} 수정`}
        </h2>
      </header>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField className="sm:col-span-2" label="주소" name="address" defaultValue={detail?.address} />
        {mode === 'create' && (
          <>
            <FormField label="위도" name="latitude" type="number" step="any" />
            <FormField label="경도" name="longitude" type="number" step="any" />
            <FormField label="전체 높이(cm)" name="totalDepth" type="number" step="0.1" min="0.1" />
          </>
        )}
        <FormField
          label="수위·이물질 임계값(cm)"
          name="trashLevelThreshold"
          type="number"
          step="0.1"
          min="0"
          defaultValue={detail?.trashLevelThreshold}
        />
        <FormField
          label="덮개 거리 임계값(cm)"
          name="coverDistanceThreshold"
          type="number"
          step="0.1"
          min="0"
          defaultValue={detail?.coverDistanceThreshold ?? 30}
        />
      </div>

      {mode === 'edit' && (
        <p className="mt-4 rounded-md bg-secondary/25 px-3 py-2 text-[10px] text-muted-foreground">
          현재 백엔드 수정 API는 주소와 두 임계값만 변경할 수 있습니다.
        </p>
      )}

      <footer className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>취소</Button>
        <Button type="submit" className="gap-1.5" disabled={saving}>
          {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mode === 'create' ? '등록' : '저장'}
        </Button>
      </footer>
    </form>
  )
}

function FormField({
  label,
  name,
  className,
  ...inputProps
}: React.ComponentProps<typeof Input> & { label: string; name: string }) {
  return (
    <div className={className}>
      <Label htmlFor={name} className="mb-2 text-xs">{label}</Label>
      <Input id={name} name={name} required {...inputProps} />
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/20 px-3 py-3">
      <dt className="text-[10px] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xs font-medium text-foreground">{value}</dd>
    </div>
  )
}

function SensorItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/30 px-3 py-3">
      <dt className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span className="[&>svg]:h-3 [&>svg]:w-3">{icon}</span> {label}
      </dt>
      <dd className="mt-1.5 font-mono text-[11px] font-medium text-foreground">{value}</dd>
    </div>
  )
}

function PhotoLink({ label, url }: { label: string; url: string | null }) {
  return url ? (
    <a href={absoluteAssetUrl(url)} target="_blank" rel="noreferrer" className="rounded-md border border-border px-3 py-3 text-center text-xs text-primary hover:bg-secondary">
      {label}
    </a>
  ) : null
}

function absoluteAssetUrl(path: string) {
  return /^https?:\/\//.test(path) ? path : `${API_BASE_URL}${path}`
}

function formatDateTime(value: string) {
  return value.replace('T', ' ').slice(0, 19)
}

function statusLabel(status: DrainDetailDto['status']) {
  return {
    NORMAL: '정상',
    NEED_INSPECTION: '점검 필요',
    FLOOD_RISK: '침수 위험',
    UNDER_MAINTENANCE: '정비 중',
  }[status]
}

function textValue(values: FormData, key: string) {
  return String(values.get(key) ?? '').trim()
}

function numberValue(values: FormData, key: string) {
  return Number(values.get(key))
}

function toErrorMessage(caught: unknown) {
  if (caught instanceof ApiError) return caught.message
  if (caught instanceof TypeError) return '백엔드 서버에 연결할 수 없습니다.'
  return '요청을 처리하지 못했습니다.'
}
