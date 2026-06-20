"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { getMetrics } from "@/actions/metrics"
import { Activity } from "lucide-react"

type MetricDataPoint = {
  time: string;
  connections: number;
}

export function BrokerIoTChart() {
  const [data, setData] = useState<MetricDataPoint[]>([])
  const [maxConnections, setMaxConnections] = useState<number>(0)
  const [currentConnections, setCurrentConnections] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true;
    
    const fetchDaData = async () => {
      const result = await getMetrics()
      if (!mounted) return;

      if (result && result.__error) {
        setError(result.__error)
      } else if (result) {
        setError(null)
        const now = new Date()
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        
        setCurrentConnections(result.liveConnectionsCount || 0)
        setMaxConnections(result.liveConnectionsMax || 0)

        setData((prev) => {
          const newData = [...prev, { time: timeStr, connections: result.liveConnectionsCount || 0 }]
          if (newData.length > 20) {
            return newData.slice(newData.length - 20)
          }
          return newData
        })
      }
    }

    fetchDaData()
    const interval = setInterval(fetchDaData, 3000)

    return () => {
      mounted = false;
      clearInterval(interval)
    }
  }, [])

  const { minDomain, maxDomain } = useMemo(() => {
    if (data.length === 0) return { minDomain: 0, maxDomain: 10 }
    
    const minVal = Math.min(...data.map(d => d.connections))
    const maxVal = Math.max(...data.map(d => d.connections))
    
    const padding = Math.max(1, Math.floor((maxVal - minVal) * 0.2))
    
    return {
      minDomain: Math.max(0, minVal - padding),
      maxDomain: maxVal + padding
    }
  }, [data])

  return (
    <Card className="col-span-3 h-full flex flex-col shadow-card">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Activity className="h-5 w-5 text-action-primary" />
            Dispositivos conectados
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
              </span>
              <span className="text-sm font-medium text-text-secondary">
                {currentConnections} / {maxConnections} max
              </span>
            </div>
          </div>
        </div>
        {error && <p className="text-xs text-error mt-1">{error}</p>}
      </CardHeader>
      <CardContent className="flex-1 min-h-[260px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorConnections" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: '#9E9E9E' }} 
                axisLine={false} 
                tickLine={false} 
                minTickGap={15}
              />
              <YAxis 
                domain={[minDomain, maxDomain]} 
                tick={{ fontSize: 10, fill: '#9E9E9E' }} 
                axisLine={false} 
                tickLine={false} 
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--surface-card, #FFFFFF)', 
                  border: '1px solid var(--border, #EFEFEB)',
                  borderRadius: '8px',
                  color: 'var(--text-primary, #1A1A1A)'
                }}
                itemStyle={{ color: '#F5A623', fontWeight: 'bold' }}
                labelStyle={{ color: '#4A4A4A' }}
              />
              <Area 
                type="monotone" 
                dataKey="connections" 
                stroke="#F5A623" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorConnections)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center">
            {error ? (
              <p className="text-sm text-error">Erro ao carregar dados</p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 border-2 border-action-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-text-muted animate-pulse">Conectando ao broker...</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
