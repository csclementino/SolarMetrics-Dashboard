"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart } from "recharts"
import { Users } from "lucide-react"

const data = [
  { month: "Jan", clients: 450 },
  { month: "Fev", clients: 580 },
  { month: "Mar", clients: 720 },
  { month: "Abr", clients: 890 },
  { month: "Mai", clients: 1050 },
  { month: "Jun", clients: 1248 },
]

export function ClientAdoptionChart() {
  return (
    <Card className="col-span-4 h-full flex flex-col shadow-card border-border">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Users className="h-5 w-5 text-action-primary" />
            Adesão de Clientes
          </CardTitle>
          <span className="text-sm font-medium text-success bg-success/10 px-2 py-1 rounded-full">
            +12% este mês
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: '#9E9E9E' }} 
              axisLine={false} 
              tickLine={false} 
              tickMargin={10}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#9E9E9E' }} 
              axisLine={false} 
              tickLine={false} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--surface-card, #FFFFFF)', 
                border: '1px solid var(--border, #EFEFEB)',
                borderRadius: '8px',
                color: 'var(--text-primary, #1A1A1A)'
              }}
              itemStyle={{ color: '#F5A623', fontWeight: 'bold' }}
              labelStyle={{ color: '#4A4A4A', marginBottom: '4px' }}
              cursor={{ fill: 'var(--border)', opacity: 0.2 }}
            />
            <Bar 
              dataKey="clients" 
              name="Clientes"
              fill="#F5A623" 
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
