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
  Area,
  ComposedChart,
  Bar
} from 'recharts'
import type { WaterLevelHistory, RainfallHistory } from '@/lib/types'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface WaterLevelChartProps {
  data: WaterLevelHistory[]
  deviceId?: string
}

interface RainfallChartProps {
  data: RainfallHistory[]
}

export function WaterLevelChart({ data, deviceId }: WaterLevelChartProps) {
  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          수위 변화 추이
          {deviceId && <span className="ml-2 text-xs text-muted-foreground font-mono">({deviceId})</span>}
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-chart-1" />
            <span className="text-muted-foreground">수위 (cm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500 opacity-50" style={{ borderStyle: 'dashed', borderWidth: '1px', borderColor: 'rgb(244 63 94)' }} />
            <span className="text-muted-foreground">위험수위 (20cm)</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              domain={[0, 25]}
              unit="cm"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <ReferenceLine 
              y={20} 
              stroke="rgb(244 63 94)" 
              strokeDasharray="5 5" 
              strokeOpacity={0.7}
              label={{ 
                value: '위험수위', 
                position: 'right', 
                fill: 'rgb(244 63 94)', 
                fontSize: 10 
              }}
            />
            <Line
              type="monotone"
              dataKey="level"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function RainfallChart({ data }: RainfallChartProps) {
  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">강우량 / 시설 데이터</h3>
        <Tabs defaultValue="rainfall" className="h-7">
          <TabsList className="h-7 p-0.5">
            <TabsTrigger value="rainfall" className="h-6 text-xs px-2">강우량</TabsTrigger>
            <TabsTrigger value="level" className="h-6 text-xs px-2">수위(평균)</TabsTrigger>
            <TabsTrigger value="blockage" className="h-6 text-xs px-2">막힘(평균)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 p-4 pt-2">
        <div className="flex items-center gap-4 text-xs mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-chart-2" />
            <span className="text-muted-foreground">강우량 (mm/h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-chart-3" />
            <span className="text-muted-foreground">누적 강우량 (mm)</span>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height="90%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              domain={[0, 'auto']}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar 
              yAxisId="left"
              dataKey="rainfall" 
              fill="hsl(var(--chart-2))" 
              opacity={0.8}
              radius={[2, 2, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="accumulated"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 0, r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
