"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/ui/logo"
import Image from "next/image"
import solarBg from "../../../assets/solar-background.jpg"
import { loginAction } from "@/actions/auth"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined)


  return (
    <div className="flex min-h-screen bg-surface-page text-text-primary">
      {/* Lado Esquerdo - Formulário */}
      <div className="flex w-full flex-col justify-center px-8 md:w-[480px] lg:px-12 bg-surface-card border-r border-surface-section shadow-xl z-10">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="flex items-center gap-2">
            <Logo className="h-10 w-auto" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Bem-vindo</h1>
            <p className="text-sm text-text-secondary">
              Entre com suas credenciais para acessar o painel administrativo.
            </p>
          </div>

          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="p-3 text-sm text-error bg-error/10 border border-error/20 rounded-md">
                {state.error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none text-text-primary">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@solarmetrics.com"
                  required
                  className="bg-surface-page border-surface-section"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none text-text-primary">Senha</label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="bg-surface-page border-surface-section"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-action-primary text-[#1A1A1A] hover:bg-action-hover font-semibold py-6 rounded-full"
              disabled={isPending}
            >
              {isPending ? "Entrando..." : "Entrar no Dashboard"}
            </Button>
          </form>
          
          <div className="text-center text-xs text-text-muted mt-8">
            &copy; 2026 SolarMetrics Inc. Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Lado Direito - Imagem/Decoração */}
      <div className="hidden flex-1 relative md:block bg-surface-section overflow-hidden">
        <Image
          src={solarBg}
          alt="Solar Energy Background"
          fill
          className="object-cover opacity-90"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-page/80 to-surface-page/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-page/50 to-transparent" />
        
        <div className="absolute bottom-12 left-12 right-12 z-10 max-w-2xl space-y-6">
        <h2 className="text-4xl font-bold text-text-primary tracking-tight">
          Gestão Inteligente da Plataforma
        </h2>

        <p className="text-lg text-text-secondary">
          Gerencie clientes, sistemas solares e dispositivos conectados em um único painel administrativo, com informações centralizadas para otimizar operações e tomar decisões estratégicas.
        </p>
        </div>
      </div>
    </div>
  )
}
