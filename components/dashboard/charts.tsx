'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { WaterLevelHistory } from '@/lib/types'
import { ChartNoAxesCombined } from 'lucide-react'

interface WaterLevelChartProps {
  data: WaterLevelHistory[]
  deviceId?: number
}

const tooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border-strong)',
  borderRadius: '6px',
  color: 'var(--foreground)',
  fontSize: '10px',
  boxShadow: '0 8px 24px rgb(0 0 0 / 25%)',
}

export function WaterLevelChart({ data, deviceId }: WaterLevelChartProps) {
  const currentLevel = data.at(-1)?.level ?? 0
  const totalDepth = data[0]?.dangerLevel ?? 0
  const yAxisMax = Math.max(10, Math.ceil(Math.max(totalDepth, ...data.map((item) => item.level)) * 1.1))

  return (
    <section className="ops-panel">
      <header className="ops-panel__header min-h-12 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <ChartNoAxesCombined className="h-3.5 w-3.5 shrink-0 text-primary" />
          <h2 className="text-[13px] font-semibold tracking-[-0.02em] text-foreground">수위 추이</h2>
          {deviceId && (
            <span className="truncate font-mono text-[8px] text-muted-foreground">{deviceId}</span>
          )}
        </div>
        <div className="flex shrink-0 items-baseline gap-1">
          <strong className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
            {currentLevel.toFixed(1)}
          </strong>
          <span className="text-[8px] text-muted-foreground">cm</span>
        </div>
      </header>

      <div className="min-h-0 flex-1 px-2 pb-1 pt-1.5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 9, left: -28, bottom: 0 }}>
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="2 4"
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 8, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              minTickGap={16}
            />
            <YAxis
              tick={{ fontSize: 8, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              domain={[0, yAxisMax]}
              tickCount={4}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '2px' }}
              formatter={(value) => [`${Number(value).toFixed(1)} cm`, '수위']}
            />
            <ReferenceLine
              y={totalDepth}
              stroke="var(--destructive)"
              strokeDasharray="3 3"
              strokeOpacity={0.8}
            />
            <Line
              type="monotone"
              dataKey="level"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: 'var(--chart-1)', stroke: 'var(--card)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
