/* eslint-disable @next/next/no-img-element */
"use client"

import { ArrowLeft, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Colecao } from "@/types/colecao"

export type ColecaoItemDetail = {
    id: string
    titulo: string
    imagemUrl: string
    categoria: string
    statusLabel: string
    statusCor: string
    nota: number | null
    anoLancamento: number | null
}

type Props = {
    colecao: Colecao
    items: ColecaoItemDetail[]
    fallbackIcon?: string
    onBack: () => void
    onItemClick: (id: string) => void
    onAddItems: () => void
}

export function ColecaoDetailView({ colecao, items, fallbackIcon = "📁", onBack, onItemClick, onAddItems }: Props) {
    // Ordenar por anoLancamento (mais antigo primeiro → cronológico)
    const sortedItems = [...items].sort((a, b) => {
        const yrA = a.anoLancamento ?? Infinity
        const yrB = b.anoLancamento ?? Infinity
        return yrA - yrB
    })

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header da coleção */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-xl border border-border text-muted hover:text-foreground hover:bg-foreground/5 transition-colors shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                        <h2 className="text-xl font-bold text-foreground truncate">{colecao.nome}</h2>
                        <p className="text-xs text-muted">
                            {items.length} {items.length === 1 ? "item" : "itens"} · ordenados por lançamento
                        </p>
                    </div>
                </div>

                <button
                    onClick={onAddItems}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Editar itens</span>
                </button>
            </div>

            {/* Grid de items */}
            {sortedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card-background/50">
                    <span className="text-5xl mb-4 opacity-40">{fallbackIcon}</span>
                    <h3 className="text-base font-bold text-foreground mb-1">Coleção vazia</h3>
                    <p className="text-sm text-muted max-w-xs mb-5">
                        Adicione itens a esta coleção usando o botão acima ou pelo modal de detalhes de cada item.
                    </p>
                    <button
                        onClick={onAddItems}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Adicionar itens
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                    {sortedItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onItemClick(item.id)}
                            className="relative aspect-3/4 rounded-xl overflow-hidden border border-border bg-card-background hover:border-primary/40 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98] transition-all duration-200 group"
                        >
                            {item.imagemUrl ? (
                                <img
                                    src={item.imagemUrl}
                                    alt={item.titulo}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-foreground/5">
                                    <span className="text-4xl opacity-30">{fallbackIcon}</span>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Status badge */}
                            <span className={cn(
                                "absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md border leading-none",
                                item.statusCor
                            )}>
                                {item.statusLabel}
                            </span>

                            {/* Nota */}
                            {item.nota !== null && (
                                <div className="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
                                    <span className="text-yellow-400 text-[9px]">★</span>
                                    <span className="text-white text-[10px] font-bold">{item.nota}</span>
                                </div>
                            )}

                            {/* Título + ano */}
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                                <p className="text-[11px] font-bold text-white leading-tight line-clamp-2 drop-shadow">
                                    {item.titulo}
                                </p>
                                {item.anoLancamento && (
                                    <p className="text-[9px] text-white/60 mt-0.5">{item.anoLancamento}</p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
