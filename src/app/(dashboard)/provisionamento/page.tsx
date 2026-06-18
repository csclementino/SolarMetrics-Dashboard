"use client"

import { useState } from "react"
import { ArrowRight, ArrowLeft, Search, Link as LinkIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { runAction } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getClienteByEmail, getSistemas } from "@/actions/sistemas"
import { getSensores, createSensorSync } from "@/actions/sensores"

export default function ProvisionamentoPage() {
  const [step, setStep] = useState(1)
  const [emailInput, setEmailInput] = useState("")
  const [cliente, setCliente] = useState<any>(null)
  
  const [selectedSistema, setSelectedSistema] = useState<any>(null)
  
  const [sensores, setSensores] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSensor, setSelectedSensor] = useState<any>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleNext = async () => {
    setError(null)
    
    if (step === 1) {
      if (!cliente) {
        if (!emailInput) {
          setError("Por favor, insira o e-mail do cliente.")
          return
        }
        setIsLoading(true)
        try {
          const data = await runAction(getClienteByEmail(emailInput))
          if (data && data.id) {
            setCliente(data)
          } else {
            setError("Cliente não encontrado.")
          }
        } catch (err: any) {
          setError(err.message || "Erro ao buscar cliente.")
        } finally {
          setIsLoading(false)
        }
      } else {
        setStep(2)
      }
    } else if (step === 2) {
      if (!selectedSistema) {
        setError("Por favor, selecione um sistema solar.")
        return
      }
      setStep(3)
      fetchSensores()
    } else if (step === 3) {
      if (!selectedSensor) {
        setError("Por favor, selecione um sensor.")
        return
      }
      setStep(4)
    } else if (step === 4) {
      setIsLoading(true)
      try {
        await runAction(createSensorSync({
          macAddress: selectedSensor.macAddress,
          sistemaId: selectedSistema.id
        }))
        setSuccess(true)
      } catch (err: any) {
        setError(err.message || "Erro ao provisionar o sensor.")
      } finally {
        setIsLoading(false)
      }
    }
  }



  const fetchSensores = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await runAction(getSensores())
      const availableSensors = data ? data.filter((s: any) => s.status === "DISPONIVEL") : []
      setSensores(availableSensors)
    } catch (err: any) {
      setError(err.message || "Erro ao buscar sensores.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setError(null)
    setStep(s => Math.max(1, s - 1))
  }

  const resetForm = () => {
    setStep(1)
    setEmailInput("")
    setCliente(null)
    setSelectedSistema(null)
    setSensores([])
    setSelectedSensor(null)
    setSearchTerm("")
    setSuccess(false)
    setError(null)
  }

  const filteredSensores = sensores.filter(s => 
    s.macAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.modelo && s.modelo.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <Card className="p-10 text-center space-y-6 border-status-success/20 bg-status-success/5">
          <div className="w-20 h-20 bg-status-success/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-status-success" />
          </div>
          <h2 className="text-3xl font-bold text-text-primary">Provisionamento Concluído!</h2>
          <p className="text-text-secondary text-lg">
            O sensor <span className="font-mono font-bold">{selectedSensor?.macAddress}</span> foi vinculado com sucesso ao sistema <span className="font-bold">{selectedSistema?.nomeInstalacao}</span>.
          </p>
          <Button onClick={resetForm} variant="primary" className="mt-4">
            Provisionar Novo Sensor
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Provisionamento de Sensores</h1>
        <p className="text-text-secondary mt-2">Vincule um dispositivo IoT disponível a um sistema solar existente.</p>
      </div>

      <div className="flex items-center justify-between mb-8 px-10 relative">
        <div className="absolute left-16 right-16 top-1/2 h-[2px] bg-surface-section -z-10" />
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex flex-col items-center bg-surface-page px-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 border-surface-page transition-colors ${step >= s ? 'bg-action-primary text-[#1A1A1A]' : 'bg-surface-section text-text-muted'}`}>
              {step > s ? <CheckCircle className="h-5 w-5" /> : s}
            </div>
            <span className="text-sm font-medium mt-3 text-text-secondary hidden sm:block">
              {s === 1 ? 'Cliente' : s === 2 ? 'Sistema' : s === 3 ? 'Sensor' : 'Resumo'}
            </span>
          </div>
        ))}
      </div>

      <Card className="p-8">
        {error && (
          <div className="mb-6 p-4 bg-status-error/10 border border-status-error/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-status-error shrink-0 mt-0.5" />
            <p className="text-status-error text-sm font-medium">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-primary">Identificar Cliente</h2>
            <p className="text-text-secondary text-sm">Insira o e-mail do cliente para buscar os sistemas vinculados.</p>
            <div className="max-w-md">
              <Input 
                placeholder="E-mail (ex: contato@cliente.com)" 
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value)
                  if (cliente) setCliente(null)
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                disabled={isLoading}
              />
            </div>
            {cliente && !isLoading && !error && (
              <div className="p-4 bg-action-primary/10 border border-action-primary/20 rounded-lg mt-4 inline-block">
                <p className="text-sm text-text-secondary">Cliente Encontrado:</p>
                <p className="font-bold text-text-primary">{cliente.nome}</p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-primary">Selecionar Sistema Solar</h2>
            <p className="text-text-secondary text-sm">Selecione um dos sistemas do cliente <span className="font-bold">{cliente?.nome}</span>.</p>
            
            {(!cliente?.sistemas || cliente.sistemas.length === 0) ? (
              <div className="p-6 text-center border-2 border-dashed border-surface-section rounded-xl text-text-muted">
                Nenhum sistema encontrado para este cliente.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {cliente.sistemas.map((sistema: any) => (
                  <div 
                    key={sistema.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedSistema?.id === sistema.id ? 'border-action-primary bg-action-primary/5' : 'border-surface-section hover:border-text-muted'}`}
                    onClick={() => setSelectedSistema(sistema)}
                  >
                    <div className="font-bold text-text-primary mb-1">{sistema.nomeInstalacao}</div>
                    <div className="text-sm text-text-secondary mb-1">ID: {sistema.id.substring(0,8)}...</div>
                    <div className="text-sm text-text-secondary">Potência: {sistema.potenciaTotal} kW</div>
                    <div className="text-xs text-text-muted mt-2">Status: {sistema.status}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-primary">Vincular Sensor</h2>
            <p className="text-text-secondary text-sm">Selecione um sensor disponível no estoque.</p>
            
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input 
                placeholder="Buscar por MAC Address ou Modelo..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
              </div>
            ) : filteredSensores.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-surface-section rounded-xl text-text-muted">
                Nenhum sensor disponível encontrado.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredSensores.map((sensor) => (
                  <div 
                    key={sensor.macAddress}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedSensor?.macAddress === sensor.macAddress ? 'border-action-primary bg-action-primary/5' : 'border-surface-section hover:border-text-muted'}`}
                    onClick={() => setSelectedSensor(sensor)}
                  >
                    <div className="font-mono text-sm font-bold text-text-primary mb-1">{sensor.macAddress}</div>
                    <div className="text-sm text-text-secondary">{sensor.modelo || 'Modelo Desconhecido'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-primary text-center">Confirmar Provisionamento</h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-6">
              <div className="text-center p-6 bg-surface-section rounded-2xl w-full sm:w-1/3 border border-surface-section relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-page px-2 text-xs font-bold text-text-muted uppercase">Sistema</div>
                <div className="font-bold text-lg mb-2 text-text-primary" title={selectedSistema?.nomeInstalacao}>
                  {selectedSistema?.nomeInstalacao}
                </div>
                <div className="text-sm text-text-secondary">ID: {selectedSistema?.id.substring(0,8)}...</div>
              </div>
              
              <LinkIcon className="h-8 w-8 text-action-primary flex-shrink-0 rotate-45 sm:rotate-0" />
              
              <div className="text-center p-6 bg-surface-section rounded-2xl w-full sm:w-1/3 border border-surface-section relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-page px-2 text-xs font-bold text-text-muted uppercase">Sensor</div>
                <div className="font-mono font-bold text-sm mb-2 text-text-primary">{selectedSensor?.macAddress}</div>
                <div className="text-sm text-text-secondary">{selectedSensor?.modelo || 'Sensor IoT'}</div>
              </div>
            </div>
            
            <p className="text-center text-sm text-status-warning bg-status-warning/15 p-4 rounded-lg">
              Ao confirmar, o dispositivo passará a reportar dados diretamente para este sistema.
            </p>
          </div>
        )}

        <div className="flex justify-between mt-10 pt-6 border-t border-surface-section">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            disabled={step === 1 || isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          
          <Button 
            variant="primary" 
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {step === 4 ? 'Confirmar Vínculo' : (!cliente && step === 1) ? 'Buscar Cliente' : 'Avançar'} {step !== 4 && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </Card>
    </div>
  )
}
