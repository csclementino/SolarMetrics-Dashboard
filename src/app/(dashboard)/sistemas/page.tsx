"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Eye, Edit, Plus, ArrowRight, Trash2, CheckCircle2, AlertCircle, X, AlertTriangle, Ban, Settings } from "lucide-react"
import { getSistemas, getSistemaById, updateSistema, updateSistemaStatus, deleteSistema, createSistema, getClienteByEmail } from "@/actions/sistemas"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// removed mocks

const mockClientes = [
  { nome: "Empresa SolarTech Ltda", email: "contato@solartech.com" },
  { nome: "João Silva", email: "joao.silva@email.com" },
]

type Painel = {
  modelo: string;
  fabricante: string;
  potencia: string;
  dataFabricacao: string;
  eficiencia: string;
  quantidade: string;
}

type Sistema = {
  id: string;
  nomeInstalacao: string;
  cliente: string;
  email: string;
  endereco: string;
  paineis: string;
  potenciaTotal: string | number;
  status: string;
  data: string;
  sensor: string;
  paineisLista?: Painel[];
}

export default function SistemasPage() {
  const [sistemas, setSistemas] = useState<Sistema[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalError, setModalError] = useState<string | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)

  // Step 1: Cliente
  const [clienteEmail, setClienteEmail] = useState("")
  const [clienteEncontrado, setClienteEncontrado] = useState<{id: string, nome: string, email: string} | null>(null)
  const [clienteBuscado, setClienteBuscado] = useState(false)

  // Step 2: Dados do Sistema
  const [dadosSistema, setDadosSistema] = useState({
    nomeInstalacao: "",
    dataInstalacao: "",
    potenciaTotal: "",
    cep: "",
    logradouro: "",
    bairro: "",
    localidade: "",
    uf: "",
    numero: "",
    complemento: ""
  })
  const [buscandoCep, setBuscandoCep] = useState(false)

  // Step 3: Painéis
  const [paineis, setPaineis] = useState<Painel[]>([])
  const [novoPainel, setNovoPainel] = useState<Painel>({
    modelo: "", fabricante: "", potencia: "", dataFabricacao: "", eficiencia: "", quantidade: ""
  })

  // Details Modal
  const [selectedSistema, setSelectedSistema] = useState<Sistema | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Actions Modal
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false)

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editStep, setEditStep] = useState(1)
  const [editDados, setEditDados] = useState({ nomeInstalacao: "", dataInstalacao: "", potenciaTotal: "" })
  const [editPaineis, setEditPaineis] = useState<Painel[]>([])
  const [novoPainelEdit, setNovoPainelEdit] = useState<Painel>({
    modelo: "", fabricante: "", potencia: "", dataFabricacao: "", eficiencia: "", quantidade: ""
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  const filtered = sistemas.filter(s => 
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (s.id && s.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.nomeInstalacao && s.nomeInstalacao.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  useEffect(() => {
    const fetchSistemas = async () => {
      try {
        const data = await getSistemas()
        const mappedSistemas = data.map((sys: any) => ({
          id: sys.id,
          nomeInstalacao: sys.nomeInstalacao,
          cliente: "Cliente Desconhecido",
          email: "",
          endereco: "Endereço não informado",
          paineis: "N/A",
          potenciaTotal: sys.potenciaTotal,
          status: sys.status === "ATIVO" ? "Ativo" : sys.status === "INATIVO" ? "Inativo" : sys.status,
          data: sys.dataInstalacao,
          sensor: "Não vinculado",
          paineisLista: []
        }))
        setSistemas(mappedSistemas)
      } catch (error) {
        console.error("Erro ao carregar sistemas", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSistemas()
  }, [])

  useEffect(() => {
    if (clienteEmail.includes('@') && clienteEmail.includes('.')) {
      const delayDebounceFn = setTimeout(async () => {
        try {
          const cliente = await getClienteByEmail(clienteEmail)
          setClienteEncontrado({
             id: cliente.id,
             nome: cliente.nome,
             email: cliente.email
          })
        } catch (error) {
          setClienteEncontrado(null)
        }
        setClienteBuscado(true)
      }, 500)
      return () => clearTimeout(delayDebounceFn)
    } else {
      setClienteEncontrado(null)
      setClienteBuscado(false)
    }
  }, [clienteEmail])

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '')
    setDadosSistema(prev => ({ ...prev, cep: e.target.value }))

    if (cep.length === 8) {
      setBuscandoCep(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setDadosSistema(prev => ({
            ...prev,
            logradouro: data.logradouro,
            bairro: data.bairro,
            localidade: data.localidade,
            uf: data.uf,
          }))
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error)
      } finally {
        setBuscandoCep(false)
      }
    }
  }

  const handleAddPainel = () => {
    if (novoPainel.modelo && novoPainel.quantidade) {
      setPaineis([...paineis, novoPainel])
      setNovoPainel({ modelo: "", fabricante: "", potencia: "", dataFabricacao: "", eficiencia: "", quantidade: "" })
    }
  }

  const handleRemovePainel = (index: number) => {
    setPaineis(paineis.filter((_, i) => i !== index))
  }

  const canAdvance = () => {
    if (wizardStep === 1) return !!clienteEncontrado
    if (wizardStep === 2) return dadosSistema.nomeInstalacao && dadosSistema.dataInstalacao && dadosSistema.potenciaTotal && dadosSistema.cep && dadosSistema.numero
    if (wizardStep === 3) return paineis.length > 0
    return true
  }

  const handleCreateSistema = async () => {
    if (!clienteEncontrado) return;
    setModalError(null)
    setIsActionLoading(true)
    try {
      const paineisList = []
      for (const p of paineis) {
        const qty = Number(p.quantidade) || 1;
        for (let i = 0; i < qty; i++) {
           paineisList.push({
             modelo: p.modelo,
             fabricante: p.fabricante,
             potenciaMaxima: Number(p.potencia),
             dataFabricacao: p.dataFabricacao,
             eficiencia: Number(p.eficiencia)
           })
        }
      }

      const requestData = {
        nomeInstalacao: dadosSistema.nomeInstalacao,
        dataInstalacao: dadosSistema.dataInstalacao,
        potenciaTotal: Number(dadosSistema.potenciaTotal),
        status: "ATIVO",
        clienteId: clienteEncontrado.id,
        endereco: {
          numero: String(dadosSistema.numero),
          complemento: String(dadosSistema.complemento),
          cep: String(dadosSistema.cep).replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2')
        },
        paineis: paineisList
      }

      const created = await createSistema(requestData)

      setSistemas(prev => [...prev, {
        id: created.id,
        nomeInstalacao: created.nomeInstalacao,
        cliente: clienteEncontrado.nome,
        email: clienteEncontrado.email,
        endereco: `${dadosSistema.logradouro}, ${dadosSistema.numero} - ${dadosSistema.bairro}, ${dadosSistema.localidade}/${dadosSistema.uf}`,
        paineis: paineis.length > 0 ? `${paineis.reduce((acc, p) => acc + Number(p.quantidade), 0)}x Total` : "Sem painéis",
        potenciaTotal: created.potenciaTotal,
        status: created.status === "ATIVO" ? "Ativo" : created.status === "INATIVO" ? "Inativo" : created.status,
        data: created.dataInstalacao,
        sensor: "Não vinculado",
        paineisLista: paineis
      }])
      
      setIsWizardOpen(false)
      setWizardStep(1)
      setClienteEmail("")
      setClienteEncontrado(null)
      setDadosSistema({ nomeInstalacao: "", dataInstalacao: "", potenciaTotal: "", cep: "", logradouro: "", bairro: "", localidade: "", uf: "", numero: "", complemento: "" })
      setPaineis([])
    } catch (error: any) {
      setModalError(error.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  // Edit Handlers
  const handleOpenDetails = async (sys: Sistema) => {
    setSelectedSistema(sys)
    setIsDetailsOpen(true)
    setModalError(null)
    setIsActionLoading(true)
    try {
      const data = await getSistemaById(sys.id)
      setSelectedSistema({
        ...sys,
        cliente: data.cliente?.nome || "Não informado",
        email: data.cliente?.email || "Não informado",
        endereco: data.endereco ? `${data.endereco.logradouro}, ${data.endereco.numero} - ${data.endereco.bairro}, ${data.endereco.cidade}/${data.endereco.uf}` : "Não informado",
      })
    } catch (error: any) {
      setModalError(error.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setSelectedSistema(null)
    setModalError(null)
  }

  const handleOpenEdit = async (sys: Sistema) => {
    setSelectedSistema(sys)
    setEditDados({ nomeInstalacao: sys.nomeInstalacao, dataInstalacao: sys.data, potenciaTotal: String(sys.potenciaTotal) })
    setEditPaineis(sys.paineisLista || [])
    setEditStep(1)
    setConfirmDelete(false)
    setIsEditModalOpen(true)
    setModalError(null)
    setIsActionLoading(true)
    try {
      const data = await getSistemaById(sys.id)
      setEditDados({
        nomeInstalacao: data.nomeInstalacao,
        dataInstalacao: data.dataInstalacao,
        potenciaTotal: String(data.potenciaTotal)
      })
      if (data.paineis) {
        const grouped = data.paineis.reduce((acc: any, curr: any) => {
           const key = `${curr.modelo}-${curr.fabricante}`
           if (!acc[key]) acc[key] = { ...curr, quantidade: 0, potencia: String(curr.potenciaMaxima) }
           acc[key].quantidade = String(Number(acc[key].quantidade) + 1)
           return acc
        }, {})
        setEditPaineis(Object.values(grouped))
      }
    } catch (error: any) {
      setModalError(error.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleCloseEdit = () => {
    setIsEditModalOpen(false)
    setSelectedSistema(null)
    setConfirmDelete(false)
    setModalError(null)
  }

  const handleOpenActions = (sys: Sistema) => {
    setSelectedSistema(sys)
    setConfirmDelete(false)
    setIsActionsModalOpen(true)
    setModalError(null)
  }

  const handleCloseActions = () => {
    setIsActionsModalOpen(false)
    setSelectedSistema(null)
    setConfirmDelete(false)
    setModalError(null)
  }

  const handleAddPainelEdit = () => {
    if (novoPainelEdit.modelo && novoPainelEdit.quantidade) {
      setEditPaineis([...editPaineis, novoPainelEdit])
      setNovoPainelEdit({ modelo: "", fabricante: "", potencia: "", dataFabricacao: "", eficiencia: "", quantidade: "" })
    }
  }

  const handleRemovePainelEdit = (index: number) => {
    setEditPaineis(editPaineis.filter((_, i) => i !== index))
  }

  const handleSaveEdit = async () => {
    if (!selectedSistema) return;
    setModalError(null)
    setIsActionLoading(true)
    try {
      const paineisList = []
      for (const p of editPaineis) {
        const qty = Number(p.quantidade) || 1;
        for (let i = 0; i < qty; i++) {
           paineisList.push({
             modelo: p.modelo,
             fabricante: p.fabricante,
             potenciaMaxima: Number(p.potencia),
             dataFabricacao: p.dataFabricacao,
             eficiencia: Number(p.eficiencia)
           })
        }
      }

      const requestData = {
        id: selectedSistema.id,
        nomeInstalacao: editDados.nomeInstalacao,
        dataInstalacao: editDados.dataInstalacao,
        potenciaTotal: Number(editDados.potenciaTotal),
        paineis: paineisList
      }

      const updated = await updateSistema(requestData)

      setSistemas(prev => prev.map(s => {
        if (s.id === selectedSistema.id) {
          return {
            ...s,
            nomeInstalacao: updated.nomeInstalacao,
            data: updated.dataInstalacao,
            potenciaTotal: updated.potenciaTotal,
            paineisLista: editPaineis,
            paineis: editPaineis.length > 0 ? `${editPaineis.reduce((acc, p) => acc + Number(p.quantidade), 0)}x Total` : "Sem painéis",
            status: updated.status === "ATIVO" ? "Ativo" : updated.status === "INATIVO" ? "Inativo" : updated.status
          }
        }
        return s;
      }))
      handleCloseEdit();
    } catch (error: any) {
      setModalError(error.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteSistema = async () => {
    if (!selectedSistema) return;
    setModalError(null)
    setIsActionLoading(true)
    try {
      await deleteSistema(selectedSistema.id)
      setSistemas(prev => prev.filter(s => s.id !== selectedSistema.id))
      handleCloseActions();
    } catch (error: any) {
      setModalError(error.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleToggleStatusSistema = async () => {
    if (!selectedSistema) return;
    setModalError(null)
    setIsActionLoading(true)
    try {
      const newStatus = selectedSistema.status === "Ativo" ? "INATIVO" : "ATIVO";
      const updated = await updateSistemaStatus(selectedSistema.id, newStatus)
      const displayStatus = updated.status === "ATIVO" ? "Ativo" : "Inativo"
      
      setSistemas(prev => prev.map(s => {
        if (s.id === selectedSistema.id) {
          return { ...s, status: displayStatus }
        }
        return s;
      }))
      setSelectedSistema({ ...selectedSistema, status: displayStatus })
    } catch (error: any) {
      setModalError(error.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (dateString.includes('/')) return dateString;
    const [year, month, day] = dateString.split('-');
    if (year && month && day) return `${day}/${month}/${year}`;
    return dateString;
  }

  if (isWizardOpen) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Novo Sistema Solar</h1>
          <p className="text-text-secondary mt-2">Siga as etapas para registrar um novo sistema.</p>
        </div>

        {modalError && (
          <div className="p-4 bg-status-error/10 border border-status-error/20 rounded-xl flex items-center gap-3 text-status-error text-sm mb-6">
            <AlertCircle className="h-5 w-5" /> {modalError}
          </div>
        )}

        <div className="flex items-center justify-between mb-8 px-10 relative">
          <div className="absolute left-16 right-16 top-1/2 h-[2px] bg-surface-section -z-10" />
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center bg-surface-page px-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-colors border-4 border-surface-page ${wizardStep >= step ? 'bg-action-primary text-[#1A1A1A]' : 'bg-surface-section text-text-muted'}`}>
                {wizardStep > step ? <CheckCircle2 className="h-5 w-5" /> : step}
              </div>
              <span className={`text-sm font-medium mt-3 hidden sm:block ${wizardStep >= step ? 'text-text-primary' : 'text-text-secondary'}`}>
                {step === 1 ? 'Cliente' : step === 2 ? 'Dados' : step === 3 ? 'Painéis' : 'Resumo'}
              </span>
            </div>
          ))}
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            {wizardStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Vincular Cliente</h3>
                <div className="space-y-2">
                  <label className="text-sm text-text-secondary">E-mail do cliente</label>
                  <Input 
                    placeholder="exemplo@dominio.com" 
                    value={clienteEmail}
                    onChange={(e) => setClienteEmail(e.target.value)}
                  />
                </div>
                {clienteBuscado && clienteEncontrado && (
                  <div className="flex items-center gap-2 text-status-success bg-status-success/10 p-3 rounded-lg border border-status-success/20">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Cliente encontrado: {clienteEncontrado.nome}</span>
                  </div>
                )}
                {clienteBuscado && !clienteEncontrado && clienteEmail.includes('@') && (
                  <div className="flex items-center gap-2 text-status-error bg-status-error/10 p-3 rounded-lg border border-status-error/20">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Cliente não encontrado na base.</span>
                  </div>
                )}
              </div>
            )}
            
            {wizardStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Dados do Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-text-secondary">Nome da Instalação</label>
                    <Input 
                      placeholder="Ex: Residência Principal" 
                      value={dadosSistema.nomeInstalacao}
                      onChange={e => setDadosSistema({...dadosSistema, nomeInstalacao: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-text-secondary">Data da Instalação</label>
                    <Input 
                      type="date"
                      value={dadosSistema.dataInstalacao}
                      onChange={e => setDadosSistema({...dadosSistema, dataInstalacao: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-text-secondary">Potência Total (W)</label>
                    <Input 
                      type="number"
                      placeholder="Ex: 5.5" 
                      value={dadosSistema.potenciaTotal}
                      onChange={e => setDadosSistema({...dadosSistema, potenciaTotal: e.target.value})}
                    />
                  </div>
                </div>

                <div className="border-t border-surface-section pt-4 mt-4">
                  <h4 className="text-md font-medium text-text-primary mb-4">Endereço</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-text-secondary">CEP</label>
                      <Input 
                        placeholder="00000-000" 
                        value={dadosSistema.cep}
                        onChange={handleCepChange}
                        maxLength={9}
                      />
                      {buscandoCep && <span className="text-xs text-text-muted">Buscando...</span>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-text-secondary">Logradouro</label>
                      <Input 
                        readOnly 
                        value={dadosSistema.logradouro} 
                        className="bg-surface-section text-text-muted cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-text-secondary">Número</label>
                      <Input 
                        value={dadosSistema.numero}
                        onChange={e => setDadosSistema({...dadosSistema, numero: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-text-secondary">Complemento</label>
                      <Input 
                        value={dadosSistema.complemento}
                        onChange={e => setDadosSistema({...dadosSistema, complemento: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-text-secondary">Bairro</label>
                      <Input readOnly value={dadosSistema.bairro} className="bg-surface-section text-text-muted cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-text-secondary">Cidade</label>
                      <Input readOnly value={dadosSistema.localidade} className="bg-surface-section text-text-muted cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-text-secondary">UF</label>
                      <Input readOnly value={dadosSistema.uf} className="bg-surface-section text-text-muted cursor-not-allowed" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary">Painéis Solares</h3>
                
                <div className="bg-surface-section p-4 rounded-xl space-y-4 border border-surface-section">
                  <h4 className="text-sm font-medium text-text-primary">Adicionar Novo Painel</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-xs text-text-secondary">Modelo</label>
                       <Input placeholder="Ex: Tiger Neo" value={novoPainel.modelo} onChange={e => setNovoPainel({...novoPainel, modelo: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs text-text-secondary">Fabricante</label>
                       <Input placeholder="Ex: Jinko" value={novoPainel.fabricante} onChange={e => setNovoPainel({...novoPainel, fabricante: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs text-text-secondary">Potência Máxima (W)</label>
                       <Input placeholder="Ex: 550" type="number" value={novoPainel.potencia} onChange={e => setNovoPainel({...novoPainel, potencia: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs text-text-secondary">Data de Fabricação</label>
                       <Input type="date" value={novoPainel.dataFabricacao} onChange={e => setNovoPainel({...novoPainel, dataFabricacao: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs text-text-secondary">Eficiência (%)</label>
                       <Input placeholder="Ex: 21.5" type="number" value={novoPainel.eficiencia} onChange={e => setNovoPainel({...novoPainel, eficiencia: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs text-text-secondary">Quantidade</label>
                       <Input placeholder="Ex: 12" type="number" value={novoPainel.quantidade} onChange={e => setNovoPainel({...novoPainel, quantidade: e.target.value})} />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-2" onClick={handleAddPainel} disabled={!novoPainel.modelo || !novoPainel.quantidade}>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Tipo de Painel
                  </Button>
                </div>

                {paineis.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-text-primary">Painéis Adicionados</h4>
                    {paineis.map((painel, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-surface-page border border-surface-section rounded-lg">
                        <div>
                          <p className="text-sm font-bold text-text-primary">{painel.quantidade}x {painel.modelo}</p>
                          <p className="text-xs text-text-secondary">{painel.fabricante} • {painel.potencia}W • Eficiência: {painel.eficiencia}%</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemovePainel(idx)} className="text-status-error hover:text-status-error hover:bg-status-error/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {paineis.length === 0 && (
                  <p className="text-sm text-status-warning bg-status-warning/10 p-3 rounded-lg border border-status-warning/20">
                    Adicione pelo menos um tipo de painel para continuar.
                  </p>
                )}
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary">Resumo e Confirmação</h3>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div className="p-5 bg-surface-section rounded-xl border border-surface-section">
                      <h4 className="text-xs uppercase tracking-wider text-text-muted font-bold mb-3">Dados do Cliente</h4>
                      <p className="text-sm text-text-primary font-medium">{clienteEncontrado?.nome}</p>
                      <p className="text-sm text-text-secondary">{clienteEncontrado?.email}</p>
                    </div>

                    <div className="p-5 bg-surface-section rounded-xl border border-surface-section">
                      <h4 className="text-xs uppercase tracking-wider text-text-muted font-bold mb-3">Dados do Sistema</h4>
                      <p className="text-sm text-text-primary font-medium">{dadosSistema.nomeInstalacao}</p>
                      <p className="text-sm text-text-secondary">Instalação: {dadosSistema.dataInstalacao}</p>
                      <p className="text-sm text-text-secondary font-medium mt-1">Potência Total: {dadosSistema.potenciaTotal} W</p>
                      <div className="mt-3 text-sm text-text-secondary pt-3 border-t border-surface-page">
                        <p>{dadosSistema.logradouro}, {dadosSistema.numero} {dadosSistema.complemento ? ` - ${dadosSistema.complemento}` : ''}</p>
                        <p>{dadosSistema.bairro} - {dadosSistema.localidade}/{dadosSistema.uf}</p>
                        <p>CEP: {dadosSistema.cep}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-surface-section rounded-xl border border-surface-section">
                    <h4 className="text-xs uppercase tracking-wider text-text-muted font-bold mb-3">Painéis Solares ({paineis.reduce((acc, p) => acc + Number(p.quantidade), 0)} Total)</h4>
                    <div className="space-y-3">
                      {paineis.map((p, idx) => (
                        <div key={idx} className="pb-3 border-b border-surface-page last:border-0 last:pb-0">
                          <p className="text-sm font-bold text-text-primary">{p.quantidade}x {p.modelo}</p>
                          <p className="text-xs text-text-secondary">{p.fabricante} • {p.potencia}W</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-status-warning/15 border border-status-warning/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-status-warning mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-status-warning font-medium">
                    Atenção: Após a criação, vá até a aba de Provisionamento para vincular um sensor IoT a este sistema.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-10 pt-6 border-t border-surface-section">
            <Button variant="ghost" onClick={() => wizardStep === 1 ? setIsWizardOpen(false) : setWizardStep(s => s - 1)}>
              {wizardStep === 1 ? 'Cancelar' : 'Voltar'}
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                if (wizardStep === 4) {
                  handleCreateSistema()
                } else {
                  setWizardStep(s => s + 1)
                }
              }}
              disabled={isActionLoading || !canAdvance()}
            >
              {isActionLoading ? 'Salvando...' : wizardStep === 4 ? 'Concluir' : 'Avançar'}
              {!isActionLoading && wizardStep < 4 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Sistemas Solares</h1>
          <p className="text-text-secondary mt-1">Gerenciamento da base de instalações.</p>
        </div>
        <Button variant="primary" onClick={() => setIsWizardOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Sistema
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input 
              placeholder="Buscar por ID ou e-mail do cliente..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="w-full sm:w-auto h-12 px-6">
            <Filter className="mr-2 h-4 w-4" /> Filtros
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome do Sistema</TableHead>
              <TableHead>Data de Instalação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Potência Total (W)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-text-secondary">
                  Carregando sistemas...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-text-secondary">
                  Nenhum sistema encontrado.
                </TableCell>
              </TableRow>
            ) : filtered.map((sys) => (
              <TableRow key={sys.id}>
                <TableCell className="font-medium text-action-primary">{sys.id}</TableCell>
                <TableCell>{sys.nomeInstalacao}</TableCell>
                <TableCell className="text-text-secondary">{formatDate(sys.data)}</TableCell>
                <TableCell>
                  <Badge variant={sys.status === "Ativo" ? "success" : sys.status === "Inativo" ? "error" : "default"}>
                    {sys.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-text-secondary">{sys.potenciaTotal}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" title="Visualizar" onClick={() => handleOpenDetails(sys)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Editar" onClick={() => handleOpenEdit(sys)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Ações do Sistema" onClick={() => handleOpenActions(sys)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      {/* Details Modal */}
      {isDetailsOpen && selectedSistema && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <Card className="max-w-2xl w-full p-6 shadow-2xl relative bg-surface-card border-surface-section">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4"
              onClick={handleCloseDetails}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-1">Detalhes do Sistema</h3>
                <p className="text-sm text-text-secondary">Informações da instalação e cliente</p>
              </div>

              {modalError && (
                <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-lg flex items-center gap-2 text-status-error text-sm">
                  <AlertCircle className="h-4 w-4" /> {modalError}
                </div>
              )}
              {isActionLoading ? (
                <div className="text-center py-8 text-text-secondary">Carregando detalhes...</div>
              ) : (
              <div className="space-y-4 bg-surface-section/50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-text-muted block mb-1">Nome do Sistema</span>
                    <span className="font-medium text-text-primary">{selectedSistema.nomeInstalacao}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block mb-1">Data de Instalação</span>
                    <span className="font-medium text-text-primary">{formatDate(selectedSistema.data)}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block mb-1">Potência Total</span>
                    <span className="font-medium text-text-primary">{selectedSistema.potenciaTotal} W</span>
                  </div>
                  <div>
                    <span className="text-text-muted block mb-1">Status</span>
                    <div>
                      <Badge variant={selectedSistema.status === "Ativo" ? "success" : selectedSistema.status === "Inativo" ? "error" : "default"}>
                        {selectedSistema.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted block mb-1">Cliente Vinculado</span>
                    <span className="font-medium text-text-primary">{selectedSistema.cliente}</span>
                    <span className="block text-text-secondary text-xs">{selectedSistema.email}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block mb-1">Endereço da Instalação</span>
                    <span className="font-medium text-text-primary">{selectedSistema.endereco}</span>
                  </div>
                </div>
              </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedSistema && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <Card className="max-w-2xl w-full p-6 shadow-2xl relative bg-surface-card border-surface-section max-h-[90vh] overflow-y-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4"
              onClick={handleCloseEdit}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-1">Editar Sistema: {selectedSistema.id}</h3>
                <p className="text-sm text-text-secondary">Altere as informações, painéis ou status do sistema.</p>
              </div>

              {modalError && (
                <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-lg flex items-center gap-2 text-status-error text-sm">
                  <AlertCircle className="h-4 w-4" /> {modalError}
                </div>
              )}
              <div className="flex items-center gap-2 mb-6 border-b border-surface-section pb-4">
                <Button variant={editStep === 1 ? "primary" : "ghost"} onClick={() => setEditStep(1)} size="sm" disabled={isActionLoading}>1. Dados</Button>
                <Button variant={editStep === 2 ? "primary" : "ghost"} onClick={() => setEditStep(2)} size="sm">2. Painéis</Button>
                <Button variant={editStep === 3 ? "primary" : "ghost"} onClick={() => setEditStep(3)} size="sm">3. Confirmação</Button>
              </div>

              {editStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-text-secondary">Nome da Instalação</label>
                    <Input 
                      value={editDados.nomeInstalacao}
                      onChange={e => setEditDados({...editDados, nomeInstalacao: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-text-secondary">Data da Instalação</label>
                      <Input 
                        type="date"
                        value={editDados.dataInstalacao}
                        onChange={e => setEditDados({...editDados, dataInstalacao: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-text-secondary">Potência Total (W)</label>
                      <Input 
                        type="number"
                        value={editDados.potenciaTotal}
                        onChange={e => setEditDados({...editDados, potenciaTotal: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button variant="primary" onClick={() => setEditStep(2)}>Próximo <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </div>
              )}

              {editStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-surface-section p-4 rounded-xl space-y-4 border border-surface-section">
                    <h4 className="text-sm font-medium text-text-primary">Adicionar Painel</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-xs text-text-secondary">Modelo</label>
                         <Input placeholder="Ex: Tiger Neo" value={novoPainelEdit.modelo} onChange={e => setNovoPainelEdit({...novoPainelEdit, modelo: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs text-text-secondary">Fabricante</label>
                         <Input placeholder="Ex: Jinko" value={novoPainelEdit.fabricante} onChange={e => setNovoPainelEdit({...novoPainelEdit, fabricante: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs text-text-secondary">Potência Máxima (W)</label>
                         <Input placeholder="Ex: 550" type="number" value={novoPainelEdit.potencia} onChange={e => setNovoPainelEdit({...novoPainelEdit, potencia: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs text-text-secondary">Data de Fabricação</label>
                         <Input type="date" value={novoPainelEdit.dataFabricacao} onChange={e => setNovoPainelEdit({...novoPainelEdit, dataFabricacao: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs text-text-secondary">Eficiência (%)</label>
                         <Input placeholder="Ex: 21.5" type="number" value={novoPainelEdit.eficiencia} onChange={e => setNovoPainelEdit({...novoPainelEdit, eficiencia: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs text-text-secondary">Quantidade</label>
                         <Input placeholder="Ex: 12" type="number" value={novoPainelEdit.quantidade} onChange={e => setNovoPainelEdit({...novoPainelEdit, quantidade: e.target.value})} />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleAddPainelEdit} disabled={!novoPainelEdit.modelo || !novoPainelEdit.quantidade}>
                      <Plus className="mr-2 h-4 w-4" /> Adicionar
                    </Button>
                  </div>

                  {editPaineis.length > 0 && (
                    <div className="space-y-3">
                      {editPaineis.map((painel, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-surface-page border border-surface-section rounded-lg">
                          <div>
                            <p className="text-sm font-bold text-text-primary">{painel.quantidade}x {painel.modelo}</p>
                            <p className="text-xs text-text-secondary">{painel.fabricante} • {painel.potencia}W</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleRemovePainelEdit(idx)} className="text-status-error hover:text-status-error hover:bg-status-error/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-4 flex justify-between">
                    <Button variant="ghost" onClick={() => setEditStep(1)}>Voltar</Button>
                    <Button variant="primary" onClick={() => setEditStep(3)}>Próximo <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </div>
              )}

              {editStep === 3 && (
                <div className="space-y-6">
                  <div className="p-4 bg-surface-section rounded-xl border border-surface-section space-y-2">
                    <h4 className="text-sm font-bold text-text-primary mb-2">Resumo das Alterações</h4>
                    <p className="text-sm text-text-secondary"><span className="text-text-primary font-medium">Nome:</span> {editDados.nomeInstalacao}</p>
                    <p className="text-sm text-text-secondary"><span className="text-text-primary font-medium">Data:</span> {formatDate(editDados.dataInstalacao)}</p>
                    <p className="text-sm text-text-secondary"><span className="text-text-primary font-medium">Potência:</span> {editDados.potenciaTotal} W</p>
                    <p className="text-sm text-text-secondary"><span className="text-text-primary font-medium">Painéis:</span> {editPaineis.reduce((acc, p) => acc + Number(p.quantidade), 0)} unidades no total</p>
                  </div>

                  <div className="pt-6 flex justify-between border-t border-surface-section">
                    <Button variant="ghost" onClick={() => setEditStep(2)} disabled={isActionLoading}>Voltar</Button>
                    <Button variant="primary" onClick={handleSaveEdit} disabled={isActionLoading}>
                      {isActionLoading ? 'Salvando...' : 'Confirmar Edição'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Actions Modal */}
      {isActionsModalOpen && selectedSistema && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <Card className="max-w-md w-full p-6 shadow-2xl relative bg-surface-card border-surface-section">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4"
              onClick={handleCloseActions}
            >
              <X className="h-5 w-5" />
            </Button>

            {!confirmDelete ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-1">Ações do Sistema</h3>
                  <p className="text-sm text-text-secondary">Gerencie o status ou exclua a instalação.</p>
                </div>
                {modalError && (
                  <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-lg flex items-center gap-2 text-status-error text-sm">
                    <AlertCircle className="h-4 w-4" /> {modalError}
                  </div>
                )}

                <div className="space-y-4 bg-surface-section/50 p-4 rounded-lg">
                  <div className="text-sm">
                    <span className="text-text-muted block mb-1">Sistema Selecionado</span>
                    <span className="font-medium text-text-primary block">{selectedSistema.nomeInstalacao}</span>
                    <span className="text-text-secondary block">ID: {selectedSistema.id}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-text-muted block mb-1">Status Atual</span>
                    <Badge variant={selectedSistema.status === "Ativo" ? "success" : selectedSistema.status === "Inativo" ? "error" : "default"}>
                      {selectedSistema.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-surface-section">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleToggleStatusSistema}
                    disabled={isActionLoading}
                  >
                    <Ban className="mr-2 h-4 w-4" /> 
                    {selectedSistema.status === "Inativo" ? "Reativar Sistema" : "Inativar Sistema"}
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-status-error hover:text-status-error hover:bg-status-error/10 border-status-error/20"
                    onClick={() => setConfirmDelete(true)}
                    disabled={isActionLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir Sistema
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-status-warning/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-status-warning" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">Confirmar Exclusão</h3>
                <p className="text-text-secondary">Tem certeza que deseja excluir o sistema {selectedSistema.nomeInstalacao}? Esta ação não pode ser desfeita.</p>
                {modalError && (
                  <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-lg flex items-center gap-2 text-status-error text-sm text-left">
                    <AlertCircle className="h-4 w-4" /> {modalError}
                  </div>
                )}
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(false)} disabled={isActionLoading}>Cancelar</Button>
                  <Button variant="primary" className="flex-1 bg-status-error hover:bg-status-error/90 text-white" onClick={handleDeleteSistema} disabled={isActionLoading}>
                    {isActionLoading ? 'Excluindo...' : 'Excluir'}
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
