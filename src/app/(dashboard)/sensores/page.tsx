"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Key, Plus, ArrowRight, Ban, Link2Off, Eye, X, AlertTriangle, Trash2, AlertCircle, Radio } from "lucide-react"
import { runAction } from "@/lib/utils"
import { getSensores, getSensorInfo, updateSensorStatus, deleteSensor, desvincularSensor, createSensor } from "@/actions/sensores"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export type Sensor = {
  macAddress: string;
  modelo: string;
  status: string;
  conexaoBroker?: string;
  sistemaId?: string | null;
}

export default function SensoresPage() {
  const [sensores, setSensores] = useState<Sensor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [deviceSecret, setDeviceSecret] = useState("")

  const [novoSensorMac, setNovoSensorMac] = useState("")
  const [novoSensorModelo, setNovoSensorModelo] = useState("")
  const [wizardError, setWizardError] = useState<string | null>(null)
  const [isWizardLoading, setIsWizardLoading] = useState(false)

  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"desvincular" | "excluir" | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    const fetchSensores = async () => {
      try {
        const data = await runAction(getSensores())
        setSensores(data || [])
      } catch (error) {
        console.error("Erro ao carregar sensores", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSensores()
  }, [])

  const filtered = sensores.filter(s => 
    s.macAddress.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusVariant = (status: string) => {
    if (status === "DISPONIVEL") return "success";
    if (status === "VINCULADO") return "default";
    return "error";
  }

  const formatStatusName = (status: string) => {
    if (status === "DISPONIVEL") return "Disponível";
    if (status === "VINCULADO") return "Vinculado";
    if (status === "INATIVO") return "Inativo";
    return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "";
  }

  const handleGenerateSecret = async () => {
    if (!novoSensorMac || !novoSensorModelo) {
      setWizardError("Preencha todos os campos.");
      return;
    }
    
    setWizardError(null);
    setIsWizardLoading(true);
    try {
      const result = await runAction(createSensor({
        macAddress: novoSensorMac,
        modelo: novoSensorModelo
      }));
      
      setDeviceSecret(result.deviceSecret);
      setSensores(prev => [...prev, {
        macAddress: result.macAddress,
        modelo: result.modelo,
        status: result.status
      }]);
      
      setWizardStep(2);
    } catch (error: any) {
      setWizardError(error.message);
    } finally {
      setIsWizardLoading(false);
    }
  }

  const handleOpenDetails = async (sensor: Sensor) => {
    setSelectedSensor(sensor)
    setConfirmAction(null)
    setIsDetailsOpen(true)
    setModalError(null)
    setIsActionLoading(true)
    try {
      const data = await runAction(getSensorInfo(sensor.macAddress))
      setSelectedSensor({
        ...sensor,
        conexaoBroker: data.conexaoBroker,
        sistemaId: data.sistemaId
      })
    } catch (error: any) {
      setModalError(error.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setSelectedSensor(null)
    setConfirmAction(null)
    setModalError(null)
  }

  const handleDesvincular = async () => {
    if (!selectedSensor || !selectedSensor.sistemaId) return;
    setModalError(null);
    setIsActionLoading(true);
    try {
      await runAction(desvincularSensor(selectedSensor.sistemaId));
      setSensores(prev => prev.map(s => s.macAddress === selectedSensor.macAddress ? { ...s, status: "DISPONIVEL" } : s));
      setSelectedSensor({ ...selectedSensor, status: "DISPONIVEL", sistemaId: null });
      setConfirmAction(null);
    } catch (error: any) {
      setConfirmAction(null);
      setModalError(error.message);
    } finally {
      setIsActionLoading(false);
    }
  }

  const handleExcluir = async () => {
    if (!selectedSensor) return;
    setModalError(null);
    setIsActionLoading(true);
    try {
      await runAction(deleteSensor(selectedSensor.macAddress));
      setSensores(prev => prev.filter(s => s.macAddress !== selectedSensor.macAddress));
      handleCloseDetails();
    } catch (error: any) {
      setConfirmAction(null);
      setModalError(error.message);
    } finally {
      setIsActionLoading(false);
    }
  }

  const handleToggleStatus = async () => {
    if (!selectedSensor) return;
    const newStatus = selectedSensor.status === "INATIVO" ? "DISPONIVEL" : "INATIVO";
    
    if (newStatus === "INATIVO" && (selectedSensor.status === "VINCULADO" || selectedSensor.sistemaId)) {
      setModalError("Não é possível inativar um sensor vinculado a um sistema.");
      return;
    }

    setModalError(null);
    setIsActionLoading(true);
    try {
      const updated = await runAction(updateSensorStatus(selectedSensor.macAddress, newStatus));
      const resultingStatus = updated?.status || newStatus;
      setSensores(prev => prev.map(s => s.macAddress === selectedSensor.macAddress ? { ...s, status: resultingStatus } : s));
      setSelectedSensor({ ...selectedSensor, status: resultingStatus });
    } catch (error: any) {
      setModalError(error.message);
    } finally {
      setIsActionLoading(false);
    }
  }

  if (isWizardOpen) {
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Cadastrar Sensor IoT</h1>
          <p className="text-text-secondary mt-1">Gere um Device Secret para o firmware de um novo dispositivo.</p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            {wizardStep === 1 && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Identificação do Dispositivo</h3>
                  
                  {wizardError && (
                    <div className="p-4 bg-status-error/10 border border-status-error/20 rounded-xl flex items-center gap-3 text-status-error text-sm">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" /> {wizardError}
                    </div>
                  )}

                  <Input 
                    placeholder="MAC Address (Ex: AA:BB:CC:DD:EE:FF)" 
                    value={novoSensorMac}
                    onChange={(e) => setNovoSensorMac(e.target.value)}
                  />
                  <select
                    className="flex h-12 w-full rounded-lg border border-surface-section bg-surface-card px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary disabled:cursor-not-allowed disabled:opacity-50"
                    value={novoSensorModelo}
                    onChange={(e) => setNovoSensorModelo(e.target.value)}
                  >
                    <option value="" disabled>Selecione um modelo</option>
                    <option value="ESP32">ESP32</option>
                    <option value="LORA32">LORA32</option>
                  </select>
                </div>
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-surface-section">
                  <Button variant="ghost" onClick={() => setIsWizardOpen(false)} disabled={isWizardLoading}>Cancelar</Button>
                  <Button variant="primary" onClick={handleGenerateSecret} disabled={isWizardLoading}>
                    {isWizardLoading ? "Gerando..." : "Gerar Device Secret"} {!isWizardLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </>
            )}
            
            {wizardStep === 2 && (
              <>
                <div className="space-y-6 text-center py-6">
                  <div className="mx-auto h-16 w-16 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mb-4">
                    <Key className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary">Sensor Cadastrado!</h3>
                  <p className="text-text-secondary">O dispositivo foi registrado no sistema. Adicione o secret abaixo na firmware do equipamento antes de ligá-lo em campo.</p>
                  
                  <div className="p-4 bg-surface-section rounded-lg border border-text-muted/20 break-all select-all">
                    <code className="text-action-primary font-mono text-lg">{deviceSecret}</code>
                  </div>
                  <p className="text-xs text-status-warning">Atenção: Esta chave é exibida apenas uma vez.</p>
                </div>
                <div className="flex justify-center mt-8 pt-6 border-t border-surface-section">
                  <Button variant="primary" className="w-full sm:w-auto" onClick={() => {
                    setIsWizardOpen(false)
                    setWizardStep(1)
                    setNovoSensorMac("")
                    setNovoSensorModelo("")
                    setWizardError(null)
                  }}>
                    Concluir
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Sensores IoT</h1>
          <p className="text-text-secondary mt-1">Gestão de dispositivos, conectividade e firmware.</p>
        </div>
        <Button variant="primary" onClick={() => setIsWizardOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Cadastrar Sensor
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input 
              placeholder="Buscar por MAC Address..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="w-full sm:w-auto h-12 px-6">
            <Filter className="mr-2 h-4 w-4" /> Filtros
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-text-muted">Carregando sensores...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-text-muted">Nenhum sensor encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((sensor) => (
              <div key={sensor.macAddress} className="flex flex-col p-5 bg-surface-page border border-surface-section rounded-xl hover:border-action-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 rounded-full bg-surface-section flex items-center justify-center flex-shrink-0">
                    <Radio className="h-5 w-5 text-text-secondary" />
                  </div>
                  <Badge variant={getStatusVariant(sensor.status)}>
                    {formatStatusName(sensor.status)}
                  </Badge>
                </div>
                <div className="mb-4">
                  <h3 className="font-mono font-bold text-base text-text-primary">{sensor.macAddress}</h3>
                  <p className="text-sm text-text-secondary mt-1">Modelo: {sensor.modelo}</p>
                </div>
                <div className="mt-auto pt-4 border-t border-surface-section/60">
                  <Button variant="ghost" size="sm" className="w-full text-action-primary hover:text-action-primary hover:bg-action-primary/10" onClick={() => handleOpenDetails(sensor)}>
                    <Eye className="mr-2 h-4 w-4" /> Detalhes do Sensor
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Details Modal */}
      {isDetailsOpen && selectedSensor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 shadow-2xl relative bg-surface-card border-surface-section">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4"
              onClick={handleCloseDetails}
            >
              <X className="h-5 w-5" />
            </Button>

            {!confirmAction ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-1">Detalhes do Sensor</h3>
                  <p className="text-sm text-text-secondary">Informações e ações do dispositivo</p>
                </div>

                {modalError && (
                  <div className="p-4 bg-status-error/10 border border-status-error/20 rounded-xl flex items-center gap-3 text-status-error text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" /> {modalError}
                  </div>
                )}

                <div className="space-y-4 bg-surface-section/50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-muted block mb-1">MAC Address</span>
                      <span className="font-mono font-medium text-text-primary">{selectedSensor.macAddress}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block mb-1">Modelo</span>
                      <span className="font-medium text-text-primary">{selectedSensor.modelo}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block mb-1">Status</span>
                      <div>
                        <Badge variant={getStatusVariant(selectedSensor.status)}>
                          {formatStatusName(selectedSensor.status)}
                        </Badge>
                      </div>
                    </div>
                    {isActionLoading ? (
                      <div className="col-span-2 text-text-muted text-center py-4">
                        Carregando informações adicionais...
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="text-text-muted block mb-1">Conexão (Broker)</span>
                          <div>
                            {selectedSensor.conexaoBroker ? (
                              <Badge variant={selectedSensor.conexaoBroker === "ONLINE" ? "success" : "error"}>
                                {formatStatusName(selectedSensor.conexaoBroker)}
                              </Badge>
                            ) : (
                              <span className="text-text-muted">-</span>
                            )}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-text-muted block mb-1">Sistema Vinculado</span>
                          <span className="font-medium text-text-primary">
                            {selectedSensor.sistemaId ? `Sim (ID: ${selectedSensor.sistemaId})` : "Não"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-surface-section">
                  <h4 className="text-sm font-semibold text-text-primary">Ações Disponíveis</h4>
                  
                  {selectedSensor.status === "VINCULADO" && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-status-warning hover:text-status-warning hover:bg-status-warning/10 border-status-warning/20"
                      onClick={() => setConfirmAction("desvincular")}
                    >
                      <Link2Off className="mr-2 h-4 w-4" /> Desvincular sensor
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleToggleStatus}
                    disabled={isActionLoading}
                  >
                    <Ban className="mr-2 h-4 w-4" /> 
                    {selectedSensor.status !== "INATIVO" ? "Inativar sensor na plataforma" : "Deixar ativo novamente"}
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-status-error hover:text-status-error hover:bg-status-error/10 border-status-error/20"
                    onClick={() => setConfirmAction("excluir")}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir sensor
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-status-warning/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-status-warning" />
                </div>
                
                <h3 className="text-xl font-bold text-text-primary">
                  {confirmAction === "desvincular" ? "Confirmar Desvinculação" : "Confirmar Exclusão"}
                </h3>
                
                <p className="text-text-secondary">
                  {confirmAction === "desvincular" 
                    ? "Tem certeza que deseja desvincular este sensor do sistema atual? Ele continuará na plataforma, mas sem registrar dados de geração."
                    : "Tem certeza que deseja excluir este sensor definitivamente? Esta ação não pode ser desfeita."}
                </p>

                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setConfirmAction(null)}
                    disabled={isActionLoading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="primary" 
                    className={`flex-1 ${confirmAction === "excluir" ? "bg-status-error hover:bg-status-error/90 text-white" : ""}`}
                    onClick={confirmAction === "desvincular" ? handleDesvincular : handleExcluir}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? "Processando..." : "Confirmar"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
