"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Skeleton } from "@/components/ui/skeleton"
import { KanbanCard } from "./KanbanCard"
import type { Planejamento } from "@/types/planejamento"

type Props = {
    id: string
    label: string
    cards: Planejamento[]
    loading: boolean
    onCardClick: (p: Planejamento) => void
}

export function KanbanColumn({ id, label, cards, loading, onCardClick }: Props) {
    const { setNodeRef, isOver } = useDroppable({ id })

    return (
        <div
            ref={setNodeRef}
            className={`rounded-xl border transition-colors p-4 min-h-[200px] ${isOver
                ? "border-primary/50 bg-primary/5"
                : "border-border bg-card-background"
                }`}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">{label}</h3>
                <span className="text-xs font-medium text-muted bg-white/5 px-2 py-0.5 rounded-full">
                    {loading ? "—" : cards.length}
                </span>
            </div>

            <SortableContext
                items={cards.map(c => c.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3">
                    {loading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-xl" />
                        ))
                    ) : cards.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-6 text-center min-h-[104px] flex flex-col justify-center">
                            <p className="text-xs text-muted">Nenhum plano</p>
                        </div>
                    ) : (
                        cards.map((p) => (
                            <KanbanCard
                                key={p.id}
                                planejamento={p}
                                onClick={onCardClick}
                            />
                        ))
                    )}
                </div>
            </SortableContext>
        </div>
    )
}