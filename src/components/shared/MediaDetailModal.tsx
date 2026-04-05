/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import { X, Star, Tag, Trash2, Save, FolderPlus, Folder, Check, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { RatingInput } from "@/components/shared/RatingInput"
import type { Colecao } from "@/types/colecao"

export type DetailModalData<TStatus extends string> = {
    id: string
    titulo: string
    coverUrl: string
    categoria: string
    nota: number | null
    status: TStatus
}

export type StatusOption<TStatus extends string> = {
    value: TStatus
    label: string
    color: string
}

type Props<TStatus extends string> = {
    data: DetailModalData<TStatus> | null
    statusOptions: StatusOption<TStatus>[]
    fallbackIcon?: React.ReactNode
    // Coleções
    colecoes?: Colecao[]
    onAddToColecao?: (colecaoId: string) => Promise<void>
    onRemoveFromColecao?: (colecaoId: string) => Promise<void>
    onCreateColecao?: () => void
    onClose: () => void
    onDelete: (id: string) => void
    onUpdate: (id: string, updates: { nota: number | null; status: TStatus }) => Promise<void>
}

export function MediaDetailModal<TStatus extends string>({
    data,
    statusOptions,
    fallbackIcon = "🎮",
    colecoes = [],
    onAddToColecao,
    onRemoveFromColecao,
    onCreateColecao,
    onClose,
    onDelete,
    onUpdate
}: Props<TStatus>) {
    const [notaInput, setNotaInput] = useState<number | null>(data?.nota ?? null)
    const [statusInput, setStatusInput] = useState<TStatus | "">(data?.status ?? "")
    const [savingNota, setSavingNota] = useState(false)
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
    const [colecaoLoading, setColecaoLoading] = useState<string | null>(null)
    const [showColecoes, setShowColecoes] = useState(false)
    const [buscaColecao, setBuscaColecao] = useState("")

    if (!data) return null

    const handleSave = async () => {
        if (statusInput === "") return
        if (notaInput !== data.nota || statusInput !== data.status) {
            setSavingNota(true)
            await onUpdate(data.id, { nota: notaInput, status: statusInput })
            setSavingNota(false)
        }
        onClose()
    }

    const handleColecaoToggle = async (colecao: Colecao) => {
        const isIn = colecao.itemIds.includes(data.id)
        setColecaoLoading(colecao.id)
        try {
            if (isIn) {
                await onRemoveFromColecao?.(colecao.id)
            } else {
                await onAddToColecao?.(colecao.id)
            }
        } finally {
            setColecaoLoading(null)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xl rounded-2xl border border-border bg-card-background shadow-2xl flex flex-col overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 custom-scrollbar"
            >
                {/* Header Cover */}
                <div className="relative h-64 sm:h-80 w-full bg-foreground/5">
                    {data.coverUrl ? (
                        <img
                            src={data.coverUrl}
                            alt={data.titulo}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl opacity-20">{fallbackIcon}</span>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-card-background via-card-background/40 to-transparent" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white/80 hover:bg-black/60 hover:text-white backdrop-blur-md transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 px-6 pb-2 pt-6 flex flex-col gap-1.5">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-md">
                            {data.titulo}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium border border-white/20 bg-black/40 text-white/90 backdrop-blur-md">
                                <Tag className="w-3 h-3" />
                                {data.categoria}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pt-2 pb-6 space-y-6">
                    <div className="flex flex-col gap-3">
                        <label className="text-sm text-muted font-medium flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" /> Minha Nota
                        </label>

                        <RatingInput
                            value={notaInput}
                            onChange={setNotaInput}
                        />

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 w-full">
                            {statusOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setStatusInput(opt.value)}
                                    className={cn(
                                        "px-2 py-2.5 rounded-xl text-[13px] transition-colors border outline-none w-full flex items-center justify-center",
                                        statusInput === opt.value
                                            ? opt.color
                                            : "bg-transparent text-muted border-border hover:bg-white/5 hover:text-foreground font-normal"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Seção de Coleções */}
                    {(colecoes.length > 0 || onCreateColecao) && (
                        <div className="flex flex-col gap-2.5">
                            <button
                                onClick={() => setShowColecoes(o => !o)}
                                className="flex items-center gap-2 text-sm text-muted font-medium hover:text-foreground transition-colors w-fit"
                            >
                                <FolderPlus className="w-4 h-4" />
                                Adicionar a uma coleção
                                <span className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded-full border transition-all",
                                    showColecoes
                                        ? "bg-primary/10 text-primary border-primary/30"
                                        : "bg-foreground/5 border-border"
                                )}>
                                    {colecoes.filter(c => c.itemIds.includes(data.id)).length}/{colecoes.length}
                                </span>
                            </button>

                            {showColecoes && (
                                <div className="rounded-xl border border-border bg-background overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                                    {/* Campo de busca */}
                                    <div className="p-2 border-b border-border">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
                                            <input
                                                value={buscaColecao}
                                                onChange={e => setBuscaColecao(e.target.value)}
                                                placeholder="Buscar coleção..."
                                                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-foreground/5 border border-border text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Lista com scroll */}
                                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                        {(() => {
                                            const filtered = colecoes
                                                .filter(c => c.nome.toLowerCase().includes(buscaColecao.toLowerCase()))
                                                // Coleções que já contêm o item aparecem primeiro
                                                .sort((a, b) => {
                                                    const aIn = a.itemIds.includes(data.id) ? 0 : 1
                                                    const bIn = b.itemIds.includes(data.id) ? 0 : 1
                                                    return aIn - bIn
                                                })

                                            if (filtered.length === 0) {
                                                return (
                                                    <div className="py-6 text-center text-xs text-muted">
                                                        Nenhuma coleção encontrada
                                                    </div>
                                                )
                                            }

                                            return filtered.map(colecao => {
                                                const isIn = colecao.itemIds.includes(data.id)
                                                const isLoading = colecaoLoading === colecao.id
                                                return (
                                                    <button
                                                        key={colecao.id}
                                                        onClick={() => handleColecaoToggle(colecao)}
                                                        disabled={isLoading}
                                                        className={cn(
                                                            "flex items-center gap-3 w-full px-4 py-3 transition-colors text-left border-b border-border/50 last:border-b-0",
                                                            isIn
                                                                ? "bg-primary/5"
                                                                : "hover:bg-foreground/5"
                                                        )}
                                                    >
                                                        <Folder className={cn("w-4 h-4 shrink-0", isIn ? "text-primary" : "text-muted")} />
                                                        <span className={cn(
                                                            "flex-1 text-sm",
                                                            isIn ? "text-foreground font-medium" : "text-muted"
                                                        )}>
                                                            {colecao.nome}
                                                        </span>
                                                        <span className="text-xs text-muted/60 shrink-0">
                                                            {colecao.itemIds.length} itens
                                                        </span>
                                                        {isLoading ? (
                                                            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                                                        ) : (
                                                            <div className={cn(
                                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                                                isIn ? "bg-primary border-primary" : "border-border"
                                                            )}>
                                                                {isIn && <Check className="w-3 h-3 text-white" />}
                                                            </div>
                                                        )}
                                                    </button>
                                                )
                                            })
                                        })()}
                                    </div>

                                    {onCreateColecao && (
                                        <button
                                            onClick={onCreateColecao}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-left text-primary hover:bg-primary/5 transition-colors border-t border-border"
                                        >
                                            <Plus className="w-4 h-4 shrink-0" />
                                            <span className="text-sm font-medium">Nova coleção</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pt-2 flex gap-3">
                        <button
                            onClick={() => {
                                if (isConfirmingDelete) {
                                    onDelete(data.id)
                                } else {
                                    setIsConfirmingDelete(true)
                                }
                            }}
                            onMouseLeave={() => setIsConfirmingDelete(false)}
                            className={cn(
                                "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 flex-1",
                                isConfirmingDelete
                                    ? "bg-red-500/10 text-red-500 border-red-500/40 hover:bg-red-500/20 scale-[0.99] font-medium"
                                    : "border-red-500/30 text-red-500 hover:bg-red-500/10"
                            )}
                        >
                            <Trash2 className={cn("shrink-0 transition-transform duration-300", isConfirmingDelete ? "w-4 h-4 scale-110" : "w-4 h-4")} />
                            <span className="text-sm font-medium">
                                {isConfirmingDelete ? "Tem certeza?" : "Remover da coleção"}
                            </span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={savingNota}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 transition-colors flex-1 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 shrink-0" />
                            <span className="text-sm font-medium">
                                {savingNota ? "Salvando..." : "Salvar"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
