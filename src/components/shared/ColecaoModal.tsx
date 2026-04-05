"use client"

import { useEffect, useRef, useState } from "react"
import { X, Folder, Plus, Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Colecao } from "@/types/colecao"

// Item genérico que pode entrar na coleção (qualquer tipo de mídia)
export type ColecaoItem = {
    id: string
    titulo: string
    imagemUrl: string
    nota: number | null
}

type CreateMode = {
    mode: "create"
    tipo: Colecao["tipo"]
}

type EditMode = {
    mode: "edit"
    colecao: Colecao
}

type Props = {
    open: boolean
    config: CreateMode | EditMode
    availableItems: ColecaoItem[]
    onClose: () => void
    onCreate: (nome: string) => Promise<void>
    onUpdate: (id: string, nome: string, itemIds: string[], capaUrl: string | null) => Promise<void>
}

export function ColecaoModal({ open, config, availableItems, onClose, onCreate, onUpdate }: Props) {
    const [nome, setNome] = useState("")
    const [busca, setBusca] = useState("")
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [saving, setSaving] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (open) {
            if (config.mode === "edit") {
                setNome(config.colecao.nome)
                setSelectedIds(new Set(config.colecao.itemIds))
            } else {
                setNome("")
                setSelectedIds(new Set())
            }
            setBusca("")
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [open, config])

    if (!open) return null

    const filteredItems = availableItems.filter(item =>
        item.titulo.toLowerCase().includes(busca.toLowerCase())
    )

    const toggleItem = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handleSave = async () => {
        if (!nome.trim()) return
        setSaving(true)
        try {
            if (config.mode === "create") {
                await onCreate(nome.trim())
            } else {
                const ids = Array.from(selectedIds)
                // capaUrl = imagem do primeiro item selecionado
                const firstItem = availableItems.find(i => i.id === ids[0])
                const capaUrl = firstItem?.imagemUrl || config.colecao.capaUrl || null
                await onUpdate(config.colecao.id, nome.trim(), ids, capaUrl)
            }
            onClose()
        } finally {
            setSaving(false)
        }
    }

    const isEdit = config.mode === "edit"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card-background shadow-2xl shadow-black/50 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <Folder className="w-4 h-4 text-primary" />
                        </div>
                        <h2 className="text-base font-semibold text-foreground">
                            {isEdit ? "Editar Coleção" : "Nova Coleção"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                    {/* Nome da coleção */}
                    <div>
                        <label className="text-xs font-medium text-muted mb-1.5 block">Nome da coleção</label>
                        <input
                            ref={inputRef}
                            value={nome}
                            onChange={e => setNome(e.target.value)}
                            placeholder="Ex: Prince of Persia, Marvel, Studio Ghibli..."
                            className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                            onKeyDown={e => { if (e.key === "Enter" && !isEdit) handleSave() }}
                        />
                    </div>

                    {/* Seleção de itens (apenas no modo edição) */}
                    {isEdit && (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted block">
                                Itens da coleção
                                <span className="ml-1.5 text-primary font-semibold">({selectedIds.size})</span>
                            </label>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
                                <input
                                    value={busca}
                                    onChange={e => setBusca(e.target.value)}
                                    placeholder="Buscar itens..."
                                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="rounded-lg border border-border bg-background overflow-hidden max-h-52 overflow-y-auto custom-scrollbar">
                                {filteredItems.length === 0 ? (
                                    <div className="py-8 text-center text-sm text-muted">
                                        Nenhum item encontrado
                                    </div>
                                ) : (
                                    filteredItems.map(item => {
                                        const isSelected = selectedIds.has(item.id)
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => toggleItem(item.id)}
                                                className={cn(
                                                    "flex items-center gap-3 w-full px-3 py-2.5 transition-colors text-left border-b border-border/50 last:border-b-0",
                                                    isSelected
                                                        ? "bg-primary/10"
                                                        : "hover:bg-foreground/5"
                                                )}
                                            >
                                                {item.imagemUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={item.imagemUrl}
                                                        alt={item.titulo}
                                                        className="w-8 h-8 rounded object-cover shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded bg-foreground/5 flex items-center justify-center shrink-0 text-sm">
                                                        📁
                                                    </div>
                                                )}
                                                <span className="flex-1 text-sm text-foreground truncate">
                                                    {item.titulo}
                                                </span>
                                                <div className={cn(
                                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                                    isSelected
                                                        ? "bg-primary border-primary"
                                                        : "border-border"
                                                )}>
                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {!isEdit && (
                        <p className="text-xs text-muted">
                            Após criar a coleção, você poderá adicionar itens através do modal de detalhes de cada item.
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-5 pb-5 pt-3 border-t border-border">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!nome.trim() || saving}
                        className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                {isEdit ? "Salvar" : "Criar coleção"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
