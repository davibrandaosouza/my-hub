"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Calendar, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Planejamento } from "@/types/planejamento"

type Props = {
    planejamento: Planejamento
    onClick: (p: Planejamento) => void
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

export function KanbanCard({ planejamento, onClick }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: planejamento.id,
        data: {
            type: "Planejamento",
            planejamento,
        },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split("-")
        return `${day}/${month}/${year}`
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(planejamento)}
            className={cn(
                "rounded-xl border border-border bg-background p-4 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-grab active:cursor-grabbing group select-none",
                isDragging && "opacity-40 scale-95 z-50",
            )}
        >
            {/* LINHA 1 — título + prioridade */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-sm font-medium text-white leading-snug flex-1">
                    {planejamento.titulo}
                </p>
                <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium shrink-0",
                    PRIORIDADE_STYLES[planejamento.prioridade]
                )}>
                    {PRIORIDADE_LABELS[planejamento.prioridade]}
                </span>
            </div>

            {/* LINHA 2 — data + categoria */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-muted">
                    {planejamento.data ? (
                        <>
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">{formatDate(planejamento.data)}</span>
                        </>
                    ) : (
                        <span className="text-xs text-muted/40">Sem data</span>
                    )}
                </div>
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
                    <Tag className="w-3 h-3" />
                    {planejamento.categoria}
                </span>
            </div>
        </div>
    )
}
