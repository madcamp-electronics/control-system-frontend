'use client'

import { FormEvent, useState } from 'react'
import { Droplets, LoaderCircle } from 'lucide-react'
import { ApiError, API_BASE_URL, login, signup } from '@/lib/api'
import type { AuthSession } from '@/lib/types'

interface AuthScreenProps {
  onAuthenticated: (session: AuthSession) => void
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const values = new FormData(event.currentTarget)
    const username = String(values.get('username') || '').trim()
    const password = String(values.get('password') || '')

    try {
      if (mode === 'signup') {
        await signup({
          username,
          password,
          name: String(values.get('name') || '').trim(),
          phoneNumber: String(values.get('phoneNumber') || '').trim(),
          role: String(values.get('role')) as 'ROLE_ADMIN' | 'ROLE_WORKER',
        })
      }

      const session = await login(username, password)
      onAuthenticated(session)
    } catch (caught) {
      if (caught instanceof TypeError) {
        setError(`백엔드(${API_BASE_URL})에 연결할 수 없습니다.`)
      } else {
        setError(caught instanceof ApiError ? caught.message : '요청을 처리하지 못했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-background p-5">
      <section className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <header className="border-b border-border px-7 py-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-primary/20 bg-primary/10">
              <Droplets className="h-5 w-5 text-primary" />
            </span>
            <div>
              <h1 className="text-base font-semibold text-foreground">스마트 빗물받이 관제</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">센서 관제 시스템에 로그인하세요.</p>
            </div>
          </div>
        </header>

        <div className="px-7 py-6">
          <div className="mb-5 grid grid-cols-2 rounded-md bg-secondary p-1 text-xs">
            {(['login', 'signup'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => { setMode(item); setError(null) }}
                className={`rounded px-3 py-2 transition-colors ${
                  mode === item ? 'bg-card font-semibold text-foreground shadow' : 'text-muted-foreground'
                }`}
              >
                {item === 'login' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <AuthField label="이름" name="name" autoComplete="name" />
                <AuthField label="전화번호" name="phoneNumber" autoComplete="tel" />
                <label className="block text-xs font-medium text-foreground">
                  권한
                  <select
                    name="role"
                    defaultValue="ROLE_WORKER"
                    className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="ROLE_WORKER">현장 작업자</option>
                    <option value="ROLE_ADMIN">관리자</option>
                  </select>
                </label>
              </>
            )}
            <AuthField label="아이디" name="username" autoComplete="username" />
            <AuthField
              label="비밀번호"
              name="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={8}
            />

            {error && (
              <p role="alert" className="rounded-md border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {mode === 'login' ? '로그인' : '가입하고 로그인'}
            </button>
          </form>

          <p className="mt-5 text-center font-mono text-[10px] text-muted-foreground">
            API · {API_BASE_URL}
          </p>
        </div>
      </section>
    </main>
  )
}

interface AuthFieldProps {
  label: string
  name: string
  type?: string
  autoComplete: string
  minLength?: number
}

function AuthField({ label, name, type = 'text', autoComplete, minLength }: AuthFieldProps) {
  return (
    <label className="block text-xs font-medium text-foreground">
      {label}
      <input
        required
        name={name}
        type={type}
        autoComplete={autoComplete}
        minLength={minLength}
        className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
      />
    </label>
  )
}
