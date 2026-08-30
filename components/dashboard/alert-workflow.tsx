'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  ClipboardCheck,
  LoaderCircle,
  MapPin,
  Shield,
  UserCheck,
} from 'lucide-react'
import { ApiError, acceptAlert, assignAlert, completeAlert } from '@/lib/api'
import type { Alert, WorkerDto } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface AlertWorkflowProps {
  alerts: Alert[]
  accessToken: string
  currentUserId: number
  isWorker: boolean
  workers: WorkerDto[]
  onChanged: () => Promise<void>
}

type BusyAction = 'accept' | 'assign' | 'complete' | null

export function AlertWorkflow({
  alerts,
  accessToken,
  currentUserId,
  isWorker,
  workers,
  onChanged,
}: AlertWorkflowProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [beforeFile, setBeforeFile] = useState<File | null>(null)
  const [afterFile, setAfterFile] = useState<File | null>(null)
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null)
  const [busy, setBusy] = useState<BusyAction>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const selected = alerts.find((alert) => alert.id === selectedId) ?? null
  const authenticatedUserId = getUserIdFromToken(accessToken) ?? currentUserId

  function selectAlert(alertId: number) {
    setSelectedId(alertId)
    setBeforeFile(null)
    setAfterFile(null)
    setSelectedWorkerId(null)
    setError(null)
    setNotice(null)
  }

  async function runAction(action: Exclude<BusyAction, null>, request: () => Promise<unknown>) {
    setBusy(action)
    setError(null)
    setNotice(null)
    try {
      await request()
      await onChanged()
      setNotice({
        accept: '작업을 접수했습니다.',
        assign: '선택한 작업자에게 알림을 배정했습니다.',
        complete: '사진 두 장을 업로드하고 작업을 완료했습니다.',
      }[action])
      if (action === 'complete') setSelectedId(null)
    } catch (caught) {
      setError(toErrorMessage(caught))
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="grid min-h-0 grid-cols-[minmax(300px,0.85fr)_minmax(440px,1.15fr)] gap-3">
      <div className="ops-panel min-h-0">
        <header className="ops-panel__header min-h-12 px-4">
          <div>
            <h2 className="text-[13px] font-semibold text-foreground">미해결 알림</h2>
            <p className="mt-0.5 text-[9px] text-muted-foreground">처리할 알림을 선택하세요.</p>
          </div>
          <span className="rounded bg-secondary px-2 py-1 font-mono text-[10px] text-muted-foreground">
            {alerts.length}건
          </span>
        </header>

        <div className="min-h-0 flex-1 divide-y divide-border/75 overflow-auto">
          {alerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              onClick={() => selectAlert(alert.id)}
              className={cn(
                'grid min-h-20 w-full grid-cols-[minmax(0,1fr)_72px] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/35',
                selectedId === alert.id && 'bg-primary/8'
              )}
            >
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <strong className="text-[11px] text-foreground">빗물받이 #{alert.deviceId}</strong>
                  <StatusBadge status={alert.status} />
                </span>
                <span className="mt-1.5 flex items-center gap-1 truncate text-[9px] text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" /> {alert.address ?? '주소 정보 없음'}
                </span>
                <span className="mt-1 block text-[9px] text-muted-foreground">{alert.message}</span>
              </span>
              <time className="text-right font-mono text-[9px] text-muted-foreground">{alert.timestamp}</time>
            </button>
          ))}
          {alerts.length === 0 && (
            <div className="grid h-48 place-items-center text-xs text-muted-foreground">처리할 알림이 없습니다.</div>
          )}
        </div>
      </div>

      <div className="ops-panel min-h-0">
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {error && <Message tone="error">{error}</Message>}
          {notice && <Message tone="success">{notice}</Message>}

          {selected ? (
            <div>
            <header className="border-b border-border pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] text-primary">ALERT #{selected.id}</p>
                  <h2 className="mt-1 text-lg font-semibold text-foreground">빗물받이 #{selected.deviceId} 작업 처리</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{selected.address ?? '주소 정보 없음'}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>
            </header>

            <div className="mt-5 rounded-md border border-border bg-secondary/20 px-4 py-3">
              <p className="text-[10px] text-muted-foreground">발생 원인</p>
              <p className="mt-1 text-sm font-medium text-foreground">{riskLabel(selected.riskLevel)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{selected.message}</p>
            </div>

            {!isWorker ? (
              selected.status === 'ACTIVE' ? (
                <div className="mt-5">
                  <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/20 p-4">
                    <UserCheck className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">작업자 수동 배정</p>
                      <p className="mt-1 text-[10px] leading-5 text-muted-foreground">현장 작업자를 선택하면 즉시 작업 중 상태로 변경됩니다.</p>
                    </div>
                  </div>
                  <label className="mt-4 block text-xs font-medium text-foreground">
                    담당 작업자
                    <select
                      value={selectedWorkerId ?? ''}
                      onChange={(event) => setSelectedWorkerId(event.target.value ? Number(event.target.value) : null)}
                      disabled={busy != null}
                      className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="">작업자를 선택하세요</option>
                      {workers.map((worker) => (
                        <option key={worker.workerId} value={worker.workerId}>
                          {worker.name} · {worker.phoneNumber}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button
                    className="mt-3 w-full gap-2"
                    disabled={busy != null || selectedWorkerId == null}
                    onClick={() => selectedWorkerId != null && void runAction(
                      'assign',
                      () => assignAlert(selected.id, selectedWorkerId, accessToken)
                    )}
                  >
                    {busy === 'assign' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                    선택한 작업자에게 배정
                  </Button>
                </div>
              ) : (
                <div className="mt-5 flex items-start gap-3 rounded-md border border-border bg-secondary/20 p-4">
                  <Shield className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">작업자 배정 완료</p>
                    <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                      담당 작업자: {workerName(selected.workerId, workers)}
                    </p>
                    <p className="mt-1 text-[10px] leading-5 text-muted-foreground">사진 등록과 완료 처리는 배정된 작업자 계정에서 진행합니다.</p>
                  </div>
                </div>
              )
            ) : selected.status === 'ACTIVE' ? (
              <div className="mt-5">
                <p className="text-xs leading-5 text-muted-foreground">현장 출동할 작업자가 알림을 접수하면 본인에게 배정되고 작업 중 상태로 변경됩니다.</p>
                <Button
                  className="mt-4 w-full gap-2"
                  disabled={busy != null}
                  onClick={() => void runAction('accept', () => acceptAlert(selected.id, accessToken))}
                >
                  {busy === 'accept' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
                  작업 접수
                </Button>
              </div>
            ) : selected.workerId !== authenticatedUserId ? (
              <div className="mt-5 rounded-md border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                다른 작업자가 처리 중인 알림입니다.
              </div>
            ) : (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-foreground">현장 작업 사진</h3>
                <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                  여기서 선택한 사진은 아직 서버로 전송되지 않습니다. 두 장을 모두 선택한 뒤 ‘작업 완료 처리’를 누르면 함께 업로드됩니다.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <PhotoUploader
                    title="작업 전 사진"
                    file={beforeFile}
                    onFile={setBeforeFile}
                    disabled={busy != null}
                  />
                  <PhotoUploader
                    title="작업 후 사진"
                    file={afterFile}
                    onFile={setAfterFile}
                    disabled={busy != null}
                  />
                </div>

                <Button
                  className="mt-5 w-full gap-2"
                  disabled={busy != null || !beforeFile || !afterFile}
                  onClick={() => beforeFile && afterFile && void runAction(
                    'complete',
                    () => completeAlert(selected.id, beforeFile, afterFile, accessToken)
                  )}
                >
                  {busy === 'complete' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  작업 완료 처리
                </Button>
              </div>
            )}
            </div>
          ) : (
            <div className="grid h-full min-h-64 place-items-center text-center">
              <div>
                <ClipboardCheck className="mx-auto h-7 w-7 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-medium text-foreground">알림을 선택하세요</p>
                <p className="mt-1 text-xs text-muted-foreground">시설 위치와 작업 상태를 확인할 수 있습니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function PhotoUploader({
  title,
  file,
  onFile,
  disabled,
}: {
  title: string
  file: File | null
  onFile: (file: File | null) => void
  disabled: boolean
}) {
  const [fileError, setFileError] = useState<string | null>(null)

  return (
    <div className="rounded-md border border-border bg-secondary/15 p-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">{title}</Label>
        {file && <span className="text-[9px] font-medium text-primary">선택됨 · 전송 대기</span>}
      </div>
      <Input
        type="file"
        accept="image/*"
        className="mt-3 h-9 text-[10px] file:text-[10px]"
        disabled={disabled}
        onChange={(event) => {
          const selectedFile = event.target.files?.[0] ?? null
          if (selectedFile && selectedFile.size > 20 * 1024 * 1024) {
            setFileError('20MB 이하의 사진을 선택하세요.')
            onFile(null)
            event.target.value = ''
            return
          }
          setFileError(null)
          onFile(selectedFile)
        }}
      />
      <p className={cn('mt-1.5 text-[9px]', fileError ? 'text-rose-300' : 'text-muted-foreground')}>
        {fileError ?? (file ? `${file.name} · 작업 완료 전까지 서버에 저장되지 않음` : 'JPEG, PNG 등 이미지 파일 · 최대 20MB')}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: Alert['status'] }) {
  const config = {
    ACTIVE: ['접수 대기', 'border-rose-500/25 bg-rose-500/10 text-rose-300'],
    PROCESSING: ['작업 중', 'border-amber-500/25 bg-amber-500/10 text-amber-300'],
    RESOLVED: ['완료', 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'],
  }[status]
  return <span className={cn('inline-flex shrink-0 rounded border px-2 py-1 text-[8px] font-semibold', config[1])}>{config[0]}</span>
}

function Message({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  return (
    <p className={cn(
      'mb-4 rounded-md border px-3 py-2 text-xs',
      tone === 'error' ? 'border-rose-500/25 bg-rose-500/10 text-rose-300' : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
    )}>
      {children}
    </p>
  )
}

function riskLabel(riskLevel: Alert['riskLevel']) {
  return {
    NEED_INSPECTION: '점검 필요',
    FLOOD_RISK: '침수 위험',
    SENSOR_ERROR: '센서 이상',
  }[riskLevel]
}

function workerName(workerId: number | null, workers: WorkerDto[]) {
  if (workerId == null) return '미배정'
  return workers.find((worker) => worker.workerId === workerId)?.name ?? `작업자 #${workerId}`
}

function getUserIdFromToken(accessToken: string) {
  try {
    const encodedPayload = accessToken.split('.')[1]
    if (!encodedPayload) return null
    const normalized = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const payload = JSON.parse(atob(padded)) as { sub?: string }
    const userId = Number(payload.sub)
    return Number.isSafeInteger(userId) ? userId : null
  } catch {
    return null
  }
}

function toErrorMessage(caught: unknown) {
  if (caught instanceof ApiError) return caught.message
  if (caught instanceof TypeError) return '백엔드 서버에 연결할 수 없습니다.'
  return '요청을 처리하지 못했습니다.'
}
