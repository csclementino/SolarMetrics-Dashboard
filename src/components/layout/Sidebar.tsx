"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Zap, Sun, Radio, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/logo"
const configGroup = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Sistemas Solares", href: "/sistemas", icon: Sun },
  { name: "Provisionamento de Sensor", href: "/provisionamento", icon: Zap },
]

const adminGroup = [
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Sensores", href: "/sensores", icon: Radio },
]

export function Sidebar() {
  const pathname = usePathname()

  const renderLinks = (items: typeof configGroup) => (
    <div className="space-y-3">
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group text-base font-medium",
              isActive
                ? "bg-action-primary text-[#1A1A1A] shadow-sm shadow-action-primary/10"
                : "text-text-muted hover:bg-surface-section hover:text-text-primary dark:hover:bg-surface-elevated"
            )}
          >
            <item.icon
              className={cn(
                "mr-4 flex-shrink-0 h-6 w-6 transition-colors duration-200",
                isActive ? "text-[#1A1A1A]" : "text-text-muted group-hover:text-text-primary"
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        )
      })}
    </div>
  )

  return (
    <aside className="w-72 flex-shrink-0 bg-surface-card dark:bg-surface-section border-r border-surface-section h-screen sticky top-0 flex flex-col transition-colors duration-200">
      <div className="h-20 flex items-center px-8 border-b border-surface-section">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto py-10 px-6 flex flex-col">
        <div className="space-y-10">
          <div>
            <h3 className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider mb-5">
              Configuração
            </h3>
            {renderLinks(configGroup)}
          </div>
          
          <div>
            <h3 className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider mb-5">
              Gestão e Administrativo
            </h3>
            {renderLinks(adminGroup)}
          </div>
        </div>
      </nav>
    </aside>
  )
}
