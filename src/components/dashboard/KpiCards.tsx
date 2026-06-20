"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Users, Sun, CheckCircle, Radio } from "lucide-react"
import { getDashKpis } from "@/actions/metrics"

type DashKpisResponse = {
  totalClientes: number;
  totalSistemas: number;
  totalSistemasAtivos: number;
  totalDispDisponiveis: number;
}

export function KpiCards() {
  const [data, setData] = useState<DashKpisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true;

    const fetchKpis = async () => {
      const result = await getDashKpis()
      if (!mounted) return;

      if (result && result.__error) {
        setError(result.__error)
      } else if (result) {
        setError(null)
        setData(result as DashKpisResponse)
      }
    }

    fetchKpis()
    const interval = setInterval(fetchKpis, 5000)

    return () => {
      mounted = false;
      clearInterval(interval)
    }
  }, [])

  const fallbackData = {
    totalClientes: 0,
    totalSistemas: 0,
    totalSistemasAtivos: 0,
    totalDispDisponiveis: 0,
  }

  const kpiData = data || fallbackData

  const percentageAtivos = kpiData.totalSistemas > 0 
    ? Math.round((kpiData.totalSistemasAtivos / kpiData.totalSistemas) * 100) 
    : 0

  const kpis = [
    {
      title: "Total de Clientes",
      value: data ? kpiData.totalClientes.toString() : "...",
      icon: Users,
      description: "Cadastrados no sistema",
    },
    {
      title: "Sistemas Cadastrados",
      value: data ? kpiData.totalSistemas.toString() : "...",
      icon: Sun,
      description: "Plantas solares registradas",
    },
    {
      title: "Sistemas Ativos",
      value: data ? kpiData.totalSistemasAtivos.toString() : "...",
      icon: CheckCircle,
      description: data ? `${percentageAtivos}% operacionais` : "Calculando...",
    },
    {
      title: "Sensores Lumia Disp.",
      value: data ? kpiData.totalDispDisponiveis.toString() : "...",
      icon: Radio,
      description: "No estoque para provisionamento",
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="p-6 relative overflow-hidden shadow-card">
          <div className="flex items-center justify-between">
            <div className="space-y-1 relative z-10">
              <p className="text-sm font-medium text-text-secondary">{kpi.title}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-text-primary">{kpi.value}</p>
                {error && kpi.title === "Total de Clientes" && (
                  <span className="text-xs text-error font-normal animate-pulse">Falha na conexão</span>
                )}
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-action-primary/10 flex items-center justify-center relative z-10">
              <kpi.icon className="h-6 w-6 text-action-primary" />
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-xs text-text-muted">{kpi.description}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
