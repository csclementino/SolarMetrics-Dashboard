"use client"

import { useTheme } from "next-themes"
import { User, Sun, Moon, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/actions/auth"

interface HeaderProps {
  user: { name: string; email: string } | null;
}

export function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  return (
    <header className="h-20 bg-surface-card dark:bg-surface-section border-b border-surface-section sticky top-0 z-10 flex items-center justify-between px-8 transition-colors duration-200">
      <div className="flex-1">
        {/* Espaço para um breadcrumb ou título dinâmico, se necessário */}
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-text-secondary hover:text-text-primary"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <div className="flex items-center pl-4 border-l border-surface-section space-x-4">
          <div className="flex items-center">
            <div className="flex flex-col text-right mr-3">
              <span className="text-sm font-semibold text-text-primary">{user?.name || "Usuário"}</span>
              <span className="text-xs text-text-muted">{user?.email || "email@solarmetrics.com"}</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-surface-section flex items-center justify-center border border-text-muted/20">
              <User className="h-5 w-5 text-text-secondary" />
            </div>
          </div>
          
          <form action={logoutAction}>
            <Button
              variant="ghost"
              size="icon"
              type="submit"
              className="text-text-secondary hover:text-error"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Sair</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
