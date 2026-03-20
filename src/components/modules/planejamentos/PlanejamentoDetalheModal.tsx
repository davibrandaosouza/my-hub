"use client"

import { useState } from "react"
import { Pencil, Trash2, Calendar, Tag, AlertCircle } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { cn } from "@/lib/utils"
import type { Planejamento, PlanejamentoStatus } from "@/types/planejamento"

type Props = {
    planejamento: Planejamento | null
    open: boolean
    onClose: () => void
    onEdit: (p: Planejamento) => void
    onDelete: (id: string) => void
    onChangeStatus: (id: string, status: PlanejamentoStatus) => void
}

const PRIORIDADE_STYLES = {
    alta: "bg-red-500/20 text-red-400",
    media: "bg-yellow-500/20 text-yellow-400",
    baixa: "bg-emerald-500/20 text-emerald-400",
}

const PRIORIDADE_LABELS = {
    alta: "Alta",
    media: "Média",
    baixa: "Baixa",
}

export function PlanejamentoDetalheModal({ planejamento, open, onClose, onEdit, onDelete }: Props) {
    const [confirmDelete, setConfirmDelete] = useState(false)

    if (!planejamento) return null

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split("-")
        return `${day}/${month}/${year}`
    }

    const handleDelete = () => {
        if (!confirmDelete) {
            setConfirmDelete(true)
            return
        }
        onDelete(planejamento.id)
        onClose()
    }

    const handleClose = () => {
        setConfirmDelete(false)
        onClose()
    }

    return (
        <Modal open={open} onClose={handleClose} title={planejamento.titulo}>
            <div className="space-y-5">

                {/* BADGES */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium",
                        PRIORIDADE_STYLES[planejamento.prioridade]
                    )}>
                        {PRIORIDADE_LABELS[planejamento.prioridade]}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
                        <Tag className="w-3 h-3" />
                        {planejamento.categoria}
                    </span>
                    {planejamento.data && (
                        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-white/5 text-muted border border-border">
                            <Calendar className="w-3 h-3" />
                            {formatDate(planejamento.data)}
                        </span>
                    )}
                </div>

                {/* DESCRIÇÃO */}
                {planejamento.descricao && (
                    <div className="space-y-1.5">
                        <span className="text-xs font-medium text-muted uppercase tracking-wider">
                            Descrição
                        </span>
                        <div className="rounded-lg border border-border bg-background px-4 py-3">
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                {planejamento.descricao}
                            </p>
                        </div>
                    </div>
                )}

                {/* AÇÕES */}
                <div className="flex items-center justify-between pt-1">
                    <button
                        onClick={handleDelete}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                            confirmDelete
                                ? "bg-red-500/20 border border-red-500/30 text-red-400"
                                : "text-muted hover:text-red-400 hover:bg-red-500/10"
                        )}
                    >
                        {confirmDelete ? (
                            <>
                                <AlertCircle className="w-4 h-4" />
                                Confirmar exclusão
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Deletar
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            onEdit(planejamento)
                            handleClose()
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:opacity-80 transition-opacity"
                    >
                        <Pencil className="w-4 h-4" />
                        Editar
                    </button>
                </div>

            </div>
        </Modal>
    )
}