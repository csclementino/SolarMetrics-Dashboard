"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Eye, Edit, Trash, X, Sun, AlertCircle } from "lucide-react"
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
import { getClientes, getClienteById, updateCliente, deleteCliente } from "@/actions/clientes"

export type Sistema = {
  id: string;
  nomeInstalacao: string;
  dataInstalacao: string;
  potenciaTotal: number;
  status: string;
}

export type Cliente = {
  id: string;
  nome: string;
  tipoUser: string;
  email: string;
  telefone: string;
  sistemas?: Sistema[];
}

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Modals state
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // Edit form state
  const [editForm, setEditForm] = useState({ nome: "", tipoUser: "", telefone: "" })

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await getClientes()
        setClientes(data || [])
      } catch (error) {
        console.error("Erro ao carregar clientes", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchClientes()
  }, [])

  const filteredClientes = clientes.filter(c => 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenView = async (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsViewModalOpen(true)
    setIsDetailsLoading(true)
    setModalError(null)
    
    try {
      const data = await getClienteById(cliente.id)
      setSelectedCliente(data)
    } catch (error: any) {
      setModalError(error.message)
    } finally {
      setIsDetailsLoading(false)
    }
  }

  const handleOpenEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setEditForm({ nome: cliente.nome, tipoUser: cliente.tipoUser, telefone: cliente.telefone })
    setModalError(null)
    setIsEditModalOpen(true)
  }

  const handleOpenDelete = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setModalError(null)
    setIsDeleteModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedCliente) return
    setIsActionLoading(true)
    setModalError(null)

    const cleanTelefone = editForm.telefone.replace(/\D/g, '')
    if (cleanTelefone.length < 10 || cleanTelefone.length > 11) {
      setModalError("O telefone deve conter 10 ou 11 números, com o DDD.")
      setIsActionLoading(false)
      return
    }

    try {
      const payload = {
        email: selectedCliente.email,
        nome: editForm.nome,
        telefone: cleanTelefone,
        tipoUser: editForm.tipoUser
      }
      const updatedData = await updateCliente(payload)
      setClientes(clientes.map(c => 
        c.id === selectedCliente.id 
          ? { ...c, nome: updatedData.nome, tipoUser: updatedData.tipoUser, telefone: updatedData.telefone } 
          : c
      ))
      setIsEditModalOpen(false)
    } catch (error: any) {
      setModalError(error.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCliente) return
    setIsActionLoading(true)
    setModalError(null)
    try {
      await deleteCliente(selectedCliente.email)
      setClientes(clientes.filter(c => c.id !== selectedCliente.id))
      setIsDeleteModalOpen(false)
    } catch (error: any) {
      setModalError(error.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Clientes</h1>
          <p className="text-text-secondary mt-1">Gerencie os clientes e seus sistemas vinculados.</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input 
              placeholder="Buscar cliente por e-mail ou nome..." 
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
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-text-muted">
                  Carregando clientes...
                </TableCell>
              </TableRow>
            ) : filteredClientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-text-muted">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : filteredClientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium">{cliente.nome}</TableCell>
                <TableCell>{cliente.tipoUser}</TableCell>
                <TableCell className="text-text-secondary">{cliente.telefone}</TableCell>
                <TableCell className="text-text-secondary">{cliente.email}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" title="Visualizar" onClick={() => handleOpenView(cliente)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Editar" onClick={() => handleOpenEdit(cliente)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Excluir" className="text-status-error hover:text-status-error" onClick={() => handleOpenDelete(cliente)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* View Modal */}
      {isViewModalOpen && selectedCliente && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="max-w-2xl w-full shadow-2xl relative bg-surface-card border-surface-section flex flex-col max-h-[90vh]">
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 z-10" onClick={() => setIsViewModalOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
            <div className="p-6 border-b border-surface-section">
              <h2 className="text-xl font-bold text-text-primary">Detalhes do Cliente</h2>
              <p className="text-sm text-text-secondary mt-1">Informações e sistemas vinculados</p>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {modalError && (
                <div className="mb-4 p-4 bg-status-error/10 border border-status-error/20 rounded-xl flex items-center gap-3 text-status-error text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" /> {modalError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-sm text-text-muted">Nome</p>
                  <p className="font-medium">{selectedCliente.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">E-mail</p>
                  <p className="font-medium">{selectedCliente.email}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Tipo</p>
                  <p className="font-medium">{selectedCliente.tipoUser}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Telefone</p>
                  <p className="font-medium">{selectedCliente.telefone}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Sistemas Vinculados</h3>
                {!isDetailsLoading && (
                  <Badge variant="default" className="text-text-muted">
                    {selectedCliente.sistemas?.length || 0} {(selectedCliente.sistemas?.length === 1) ? "sistema" : "sistemas"}
                  </Badge>
                )}
              </div>
              
              {isDetailsLoading ? (
                <div className="text-center p-8 border border-dashed border-surface-section rounded-xl bg-surface-section/10">
                  <p className="text-text-muted">Carregando detalhes do cliente...</p>
                </div>
              ) : selectedCliente.sistemas && selectedCliente.sistemas.length > 0 ? (
                <div className="space-y-3">
                  {selectedCliente.sistemas.map((sis) => (
                    <div key={sis.id} className="flex items-center justify-between p-4 rounded-xl border border-surface-section bg-surface-section/30 hover:bg-surface-section/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg ${sis.status === 'ATIVO' ? 'bg-status-success/10 text-status-success' : 'bg-surface-section text-text-muted'}`}>
                          <Sun className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">{sis.nomeInstalacao}</p>
                          <p className="text-sm font-mono text-text-muted mt-0.5">{sis.id}</p>
                        </div>
                      </div>
                      <Badge variant={sis.status === "ATIVO" ? "success" : "default"}>
                        {sis.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed border-surface-section rounded-xl bg-surface-section/10">
                  <p className="text-text-muted">Nenhum sistema vinculado.</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-surface-section flex justify-end">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Fechar</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedCliente && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="max-w-md w-full shadow-2xl relative bg-surface-card border-surface-section flex flex-col">
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 z-10" onClick={() => setIsEditModalOpen(false)} disabled={isActionLoading}>
              <X className="h-5 w-5" />
            </Button>
            <div className="p-6 border-b border-surface-section">
              <h2 className="text-xl font-bold text-text-primary">Editar Cliente</h2>
              <p className="text-sm text-text-secondary mt-1">Atualize as informações do cliente</p>
            </div>
            <div className="p-6 space-y-4">
              {modalError && (
                <div className="p-4 bg-status-error/10 border border-status-error/20 rounded-xl flex items-center gap-3 text-status-error text-sm mb-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" /> {modalError}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input 
                  value={editForm.nome} 
                  onChange={(e) => setEditForm({...editForm, nome: e.target.value})} 
                  disabled={isActionLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <select
                  className="flex h-10 w-full rounded-md border border-surface-section bg-surface-card px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary disabled:cursor-not-allowed disabled:opacity-50"
                  value={editForm.tipoUser}
                  onChange={(e) => setEditForm({...editForm, tipoUser: e.target.value})}
                  disabled={isActionLoading}
                >
                  <option value="Residencial">Residencial</option>
                  <option value="Comercial">Comercial</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <Input 
                  value={editForm.telefone} 
                  onChange={(e) => setEditForm({...editForm, telefone: e.target.value})} 
                  disabled={isActionLoading}
                />
              </div>
            </div>
            <div className="p-6 border-t border-surface-section flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isActionLoading}>Cancelar</Button>
              <Button variant="primary" onClick={handleSaveEdit} disabled={isActionLoading}>
                {isActionLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedCliente && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="max-w-md w-full shadow-2xl relative bg-surface-card border-surface-section flex flex-col p-6 text-center">
            <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => setIsDeleteModalOpen(false)} disabled={isActionLoading}>
              <X className="h-5 w-5" />
            </Button>
            
            <div className="mx-auto w-12 h-12 rounded-full bg-status-error/10 flex items-center justify-center mb-4 mt-2">
              <Trash className="h-6 w-6 text-status-error" />
            </div>
            
            <h3 className="text-xl font-bold text-text-primary">Remover Cliente</h3>
            
            <div className="mt-4 mb-6 text-text-secondary">
              {modalError && (
                <div className="p-4 bg-status-error/10 border border-status-error/20 rounded-xl flex items-center gap-3 text-status-error text-sm mb-4 text-left">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" /> {modalError}
                </div>
              )}
              <p>Tem certeza que deseja remover o cliente <strong className="text-text-primary">{selectedCliente.nome}</strong>?</p>
              <p className="text-sm text-status-error mt-2 px-2">
                Atenção: Esta ação também removerá permanentemente todos os {selectedCliente.sistemas?.length || 0} sistema(s) vinculado(s) a este cliente.
              </p>
            </div>

            <div className="flex gap-4 pt-4 border-t border-surface-section">
              <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)} disabled={isActionLoading}>Cancelar</Button>
              <Button variant="primary" className="flex-1 bg-status-error hover:bg-status-error/90 text-white border-transparent" onClick={handleDelete} disabled={isActionLoading}>
                {isActionLoading ? "Excluindo..." : "Confirmar Exclusão"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
