"use client"

import { useState, useEffect } from "react"
import { Plus, Filter } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useToastContext } from "@/app/(hub)/layout"
import { Header } from "@/components/layout/Header"
import { Skeleton } from "@/components/ui/skeleton"
import { PlanejamentoCard } from "@/components/modules/planejamentos/PlanejamentoCard"
import { PlanejamentoModal } from "@/components/modules/planejamentos/PlanejamentoModal"
import { PlanejamentoDetalheModal } from "@/components/modules/planejamentos/PlanejamentoDetalheModal"
import {
    getPlanejamentos,
    createPlanejamento,
    updatePlanejamento,
    updatePlanejamentoStatus,
    deletePlanejamento,
} from "@/lib/firebase/planejamentos"
import type { Planejamento, PlanejamentoStatus } from "@/types/planejamento"
import type { PlanejamentoFormData } from "@/lib/validations/planejamento"
import { cn } from "@/lib/utils"

const COLUNAS: { status: PlanejamentoStatus; label: string }[] = [
    { status: "pendente", label: "Pendentes" },
    { status: "em_progresso", label: "Em Progresso" },
    { status: "concluido", label: "Concluído" },
]

export default function PlanejamentosPage() {
    const { user } = useAuth()
    const toast = useToastContext()

    const [planejamentos, setPlanejamentos] = useState<Planejamento[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Planejamento | null>(null)
    const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todos")
    const [detalheItem, setDetalheItem] = useState<Planejamento | null>(null)
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [dragOverStatus, setDragOverStatus] = useState<PlanejamentoStatus | null>(null)
    const categoriaSugestoes = Array.from(new Set(planejamentos.map(p => p.categoria).filter(Boolean)))

    useEffect(() => {
        if (!user?.uid) return
        getPlanejamentos(user.uid).then((data) => {
            setPlanejamentos(data)
            setLoading(false)
        })
    }, [user?.uid])

    // Categorias únicas para os filtros
    const categorias = ["todos", ...Array.from(new Set(planejamentos.map(p => p.categoria)))]

    // Filtra por categoria
    const filtrados = categoriaFiltro === "todos"
        ? planejamentos
        : planejamentos.filter(p => p.categoria === categoriaFiltro)

    const handleSave = async (data: PlanejamentoFormData) => {
        if (!user?.uid) return

        if (editingItem) {
            const { error } = await updatePlanejamento(editingItem.id, data)
            if (error) {
                toast.error(error)
                return
            }
            setPlanejamentos(prev =>
                prev.map(p => p.id === editingItem.id
                    ? { ...p, ...data, updatedAt: Date.now() }
                    : p
                )
            )
            toast.success("Plano atualizado!")
        } else {
            const { id, error } = await createPlanejamento(user.uid, data)
            if (error || !id) {
                toast.error(error ?? "Erro ao criar plano.")
                return
            }
            const novo: Planejamento = {
                id,
                userId: user.uid,
                ...data,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }
            setPlanejamentos(prev => [novo, ...prev])
            toast.success("Plano criado!")
        }

        setEditingItem(null)
    }

    const handleEdit = (p: Planejamento) => {
        setEditingItem(p)
        setModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        const { error } = await deletePlanejamento(id)
        if (error) {
            toast.error(error)
            return
        }
        setPlanejamentos(prev => prev.filter(p => p.id !== id))
        toast.success("Plano deletado.")
    }

    const handleMoveStatus = async (id: string, status: PlanejamentoStatus) => {
        // Salva status anterior para rollback
        const previous = planejamentos.find(p => p.id === id)?.status

        // Optimistic update — aplica imediatamente na UI
        setPlanejamentos(prev =>
            prev.map(p => p.id === id ? { ...p, status, updatedAt: Date.now() } : p)
        )

        const { error } = await updatePlanejamentoStatus(id, status)
        if (error) {
            // Rollback em caso de falha
            if (previous) {
                setPlanejamentos(prev =>
                    prev.map(p => p.id === id ? { ...p, status: previous } : p)
                )
            }
            toast.error(error)
        }
    }

    return (
        <div>
            <Header title="Planejamentos" />

            <div className="p-6 space-y-6">

                {/* ── FILTROS + BOTÃO NOVO ── */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-4 h-4 text-muted shrink-0" />
                        {loading ? (
                            <div className="flex gap-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-7 w-20 rounded-full" />
                                ))}
                            </div>
                        ) : (
                            categorias.map((cat) => {
                                const count = cat === "todos"
                                    ? filtrados.length
                                    : filtrados.filter(p => p.categoria === cat).length
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoriaFiltro(cat)}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize",
                                            categoriaFiltro === cat
                                                ? "bg-primary text-white"
                                                : "bg-white/5 text-muted hover:text-white"
                                        )}
                                    >
                                        {cat === "todos" ? "Todos" : cat} ({count})
                                    </button>
                                )
                            })
                        )}
                    </div>

                    <button
                        onClick={() => {
                            setEditingItem(null)
                            setModalOpen(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-80 transition-opacity shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Plano
                    </button>
                </div>

                {/* ── KANBAN ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {COLUNAS.map(({ status, label }) => {
                        const cards = filtrados.filter(p => p.status === status)

                        const isOver = dragOverStatus === status

                        return (
                            <div
                                key={status}
                                onDragOver={(e) => {
                                    e.preventDefault()
                                    e.dataTransfer.dropEffect = "move"
                                    setDragOverStatus(status)
                                }}
                                onDragLeave={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                        setDragOverStatus(null)
                                    }
                                }}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    setDragOverStatus(null)
                                    if (draggingId) {
                                        const card = planejamentos.find(p => p.id === draggingId)
                                        if (card && card.status !== status) {
                                            handleMoveStatus(draggingId, status)
                                        }
                                        setDraggingId(null)
                                    }
                                }}
                                className={cn(
                                    "rounded-xl border bg-card-background p-4 transition-colors",
                                    isOver
                                        ? "border-primary/60 bg-primary/5"
                                        : "border-border"
                                )}
                            >

                                {/* Header da coluna */}
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-white">{label}</h3>
                                    <span className="text-xs font-medium text-muted bg-white/5 px-2 py-0.5 rounded-full">
                                        {loading ? "—" : cards.length}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className="space-y-3">
                                    {loading ? (
                                        Array.from({ length: 2 }).map((_, i) => (
                                            <Skeleton key={i} className="h-24 rounded-xl" />
                                        ))
                                    ) : cards.length === 0 ? (
                                        <div className={cn(
                                            "rounded-xl border border-dashed p-6 text-center transition-colors min-h-[86px] flex flex-col justify-center",
                                            isOver ? "border-primary/40" : "border-border"
                                        )}>
                                            <p className="text-xs text-muted">Nenhum plano</p>
                                        </div>
                                    ) : (
                                        cards.map((p) => (
                                            <PlanejamentoCard
                                                key={p.id}
                                                planejamento={p}
                                                onClick={setDetalheItem}
                                                onDragStart={(dragged) => setDraggingId(dragged.id)}
                                            />
                                        ))
                                    )}
                                </div>

                            </div>
                        )
                    })}
                </div>

            </div>

            {/* MODAL */}
            <PlanejamentoDetalheModal
                open={!!detalheItem}
                planejamento={detalheItem}
                onClose={() => setDetalheItem(null)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onChangeStatus={handleMoveStatus}
            />
            <PlanejamentoModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false)
                    setEditingItem(null)
                }}
                onSave={handleSave}
                editingItem={editingItem}
                categoriaSugestoes={categoriaSugestoes}
            />
        </div>
    )
}