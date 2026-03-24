/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useRef, useState } from "react"
import { Search, X, Check, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { RatingSlider } from "@/components/shared/RatingSlider"

export type MediaSearchResult = {
    apiId: string
    titulo: string
    coverUrl: string
    categoria: string
}

export type StatusOption<TStatus extends string> = {
    value: TStatus
    label: string
    color: string
}

type Props<TStatus extends string> = {
    open: boolean
    title: string
    searchPlaceholder: string
    statusOptions: StatusOption<TStatus>[]
    defaultStatus: TStatus
    fallbackIcon?: React.ReactNode
    onClose: () => void
    onSearch: (query: string) => Promise<MediaSearchResult[]>
    onSave: (data: {
        apiId: string
        titulo: string
        coverUrl: string
        categoria: string
        status: TStatus
        nota: number | null
    }) => Promise<void>
}

export function MediaAddModal<TStatus extends string>({ 
    open, 
    title,
    searchPlaceholder,
    statusOptions,
    defaultStatus,
    fallbackIcon = "🎮",
    onClose, 
    onSearch,
    onSave 
}: Props<TStatus>) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<MediaSearchResult[]>([])
    const [searching, setSearching] = useState(false)
    const [selected, setSelected] = useState<MediaSearchResult | null>(null)
    const [status, setStatus] = useState<TStatus>(defaultStatus)
    const [nota, setNota] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!selected) {
            if (debounceRef.current) clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(async () => {
                if (query.length < 2) { setResults([]); return }
                setSearching(true)
                const res = await onSearch(query)
                setResults(res)
                setSearching(false)
            }, 400)
        }
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    }, [query, selected, onSearch])

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [open])

    const reset = () => {
        setQuery("")
        setResults([])
        setSelected(null)
        setStatus(defaultStatus)
        setNota(null)
    }

    if (!open) return null

    const handleSelect = (item: MediaSearchResult) => {
        setSelected(item)
        setQuery(item.titulo)
        setResults([])
    }

    const handleSave = async () => {
        if (!selected) return
        setSaving(true)
        await onSave({
            apiId: selected.apiId,
            titulo: selected.titulo,
            coverUrl: selected.coverUrl,
            categoria: selected.categoria,
            status,
            nota,
        })
        setSaving(false)
        reset() // Optional: depends on if the parent handles closing, but standard to reset.
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card-background shadow-2xl shadow-black/50 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
                    <h2 className="text-base font-semibold text-white">{title}</h2>
                    <button
                        onClick={() => { reset(); onClose() }}
                        className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
                    {/* Search */}
                    <div>
                        <label className="text-xs font-medium text-muted mb-1.5 block">Buscar</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value)
                                    if (selected) setSelected(null)
                                }}
                                placeholder={searchPlaceholder}
                                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-background border border-border text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            {searching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Search Results */}
                        {results.length > 0 && (
                            <div className="mt-1.5 rounded-lg border border-border bg-background overflow-hidden max-h-52 overflow-y-auto">
                                {results.map((item, idx) => (
                                    <button
                                        key={item.apiId + idx}
                                        onClick={() => handleSelect(item)}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                                    >
                                        {item.coverUrl ? (
                                            <img
                                                src={item.coverUrl}
                                                alt={item.titulo}
                                                className="w-10 h-10 rounded-md object-cover shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-md bg-white/5 flex items-center justify-center shrink-0 text-base">{fallbackIcon}</div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{item.titulo}</p>
                                            <p className="text-[11px] text-muted">{item.categoria}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Selected Item */}
                        {selected && (
                            <div className="mt-2 flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                                {selected.coverUrl && (
                                    <img src={selected.coverUrl} alt={selected.titulo} className="w-10 h-10 rounded-md object-cover shrink-0" />
                                )}
                                <p className="text-sm text-white flex-1 truncate">{selected.titulo}</p>
                                <Check className="w-4 h-4 text-primary shrink-0" />
                            </div>
                        )}
                    </div>

                    {/* Status selection */}
                    <div>
                        <label className="text-xs font-medium text-muted mb-1.5 block">Status</label>
                        <div className="grid grid-cols-2 gap-2">
                            {statusOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setStatus(opt.value)}
                                    className={cn(
                                        "px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                                        status === opt.value
                                            ? opt.color
                                            : "border-border text-muted hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Minimum Note slider */}
                    <div>
                        <label className="text-xs font-medium text-muted mb-3 flex items-center gap-1.5 w-full">
                            <Star className="w-3.5 h-3.5 text-yellow-400" />
                            <span>Avaliação (Deslize para dar uma nota)</span>
                            <span className="text-muted/50 font-normal ml-1">— opcional</span>
                        </label>
                        <RatingSlider
                            value={nota}
                            onChange={setNota}
                        />
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="flex gap-3 px-5 pb-5 pt-3 border-t border-border mt-auto">
                    <button
                        onClick={() => { reset(); onClose() }}
                        className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!selected || saving}
                        className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {saving ? "Salvando..." : "Adicionar"}
                    </button>
                </div>
            </div>
        </div>
    )
}
