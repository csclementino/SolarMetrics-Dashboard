import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Sun, CheckCircle, Radio } from "lucide-react"

export default function Dashboard() {
  const kpis = [
    {
      title: "Total de Clientes",
      value: "1,248",
      icon: Users,
      description: "+12% em relação ao mês passado",
    },
    {
      title: "Sistemas Cadastrados",
      value: "3,102",
      icon: Sun,
      description: "+8% em relação ao mês passado",
    },
    {
      title: "Sistemas Ativos",
      value: "2,980",
      icon: CheckCircle,
      description: "96% operacionais",
    },
    {
      title: "Sensores Lumia Disp.",
      value: "450",
      icon: Radio,
      description: "No estoque para provisionamento",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Dashboard Overview</h1>
        <p className="text-text-secondary mt-2">Visão geral do sistema de gerenciamento SolarMetrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-text-secondary">{kpi.title}</p>
                <p className="text-2xl font-bold text-text-primary">{kpi.value}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-action-primary/10 flex items-center justify-center">
                <kpi.icon className="h-6 w-6 text-action-primary" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-text-muted">{kpi.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Area for analytics or charts if needed in future */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 p-6 flex flex-col items-center justify-center h-80">
          <p className="text-text-muted">Área reservada para gráfico de adesão de clientes</p>
        </Card>
        <Card className="col-span-3 p-6 flex flex-col items-center justify-center h-80">
          <p className="text-text-muted">Status do Broker IoT</p>
        </Card>
      </div>
    </div>
  )
}
