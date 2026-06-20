import { BrokerIoTChart } from "@/components/dashboard/BrokerIoTChart"
import { ClientAdoptionChart } from "@/components/dashboard/ClientAdoptionChart"
import { KpiCards } from "@/components/dashboard/KpiCards"

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Dashboard Overview</h1>
        <p className="text-text-secondary mt-2">Visão geral do sistema de gerenciamento SolarMetrics.</p>
      </div>

      <KpiCards />

      {/* Area for analytics or charts if needed in future */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <ClientAdoptionChart />
        <BrokerIoTChart />
      </div>
    </div>
  )
}
