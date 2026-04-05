"use client"

import { useState, useMemo } from "react"
import { Search, Plus, MonitorPlay, Flag, PlayCircle, XCircle, Sparkles, Folder } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/layout/Header"
import { Skeleton } from "@/components/ui/skeleton"
import { MediaStatsBar, FilterOption } from "@/components/shared/MediaStatsBar"
import { MediaCard, MediaData } from "@/components/shared/MediaCard"
import { MediaAddModal } from "@/components/shared/MediaAddModal"
import { MediaDetailModal, StatusOption } from "@/components/shared/MediaDetailModal"
import { SortDropdown, SortKey } from "@/components/shared/SortDropdown"
import { ColecaoCard } from "@/components/shared/ColecaoCard"
import { ColecaoModal } from "@/components/shared/ColecaoModal"
import { ColecaoDetailView } from "@/components/shared/ColecaoDetailView"
import { getSeries, addSerie, deleteSerie, updateSerie } from "@/lib/firebase/series"
import { searchSeries } from "@/lib/tmdb"
import { useMediaData } from "@/hooks/useMediaData"
import { useColecoes } from "@/hooks/useColecoes"
import type { Serie, SerieStatus } from "@/types/serie"
import type { Colecao } from "@/types/colecao"

type FilterKey = SerieStatus | "todos" | "colecoes"

const STATUS_STYLES: Record<SerieStatus, string> = {
    assistindo: "bg-blue-600 text-white font-medium border-blue-400 shadow-md",
    concluido: "bg-cyan-600 text-white font-medium border-cyan-400 shadow-md",
    abandonado: "bg-red-600 text-white font-medium border-red-400 shadow-md",
    quero_assistir: "bg-violet-600 text-white font-medium border-violet-400 shadow-md",
}

const STATUS_LABELS: Record<SerieStatus, string> = {
    assistindo: "Assistindo",
    concluido: "Assistida",
    abandonado: "Abandonada",
    quero_assistir: "Quero Assistir",
}

const STATUS_OPTIONS: StatusOption<SerieStatus>[] = [
    { value: "assistindo", label: "Assistindo", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { value: "concluido", label: "Assistida", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    { value: "abandonado", label: "Abandonada", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    { value: "quero_assistir", label: "Quero Assistir", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
]

function applySort(list: Serie[], sort: SortKey): Serie[] {
    return [...list].sort((a, b) => {
        const notaA = a.nota ?? -1
        const notaB = b.nota ?? -1
        if (notaA !== notaB) return notaB - notaA
        switch (sort) {
            case "alpha_asc": return a.titulo.localeCompare(b.titulo, "pt-BR")
            case "alpha_desc": return b.titulo.localeCompare(a.titulo, "pt-BR")
            case "added_asc": return a.createdAt - b.createdAt
            case "added_desc": return b.createdAt - a.createdAt
            case "release_asc": return (a.anoLancamento ?? Infinity) - (b.anoLancamento ?? Infinity)
            case "release_desc": return (b.anoLancamento ?? -Infinity) - (a.anoLancamento ?? -Infinity)
            default: return a.titulo.localeCompare(b.titulo, "pt-BR")
        }
    })
}

export default function SeriesPage() {
    const { user } = useAuth()
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedSerie, setSelectedSerie] = useState<Serie | null>(null)
    const [filtro, setFiltro] = useState<FilterKey>("todos")
    const [busca, setBusca] = useState("")
    const [sortOrder, setSortOrder] = useState<SortKey>("alpha_asc")

    const [colecaoModalOpen, setColecaoModalOpen] = useState(false)
    const [colecaoModalMode, setColecaoModalMode] = useState<{ mode: "create"; tipo: "series" } | { mode: "edit"; colecao: Colecao }>({ mode: "create", tipo: "series" })
    const [selectedColecao, setSelectedColecao] = useState<Colecao | null>(null)

    const { data: series, loading, addItem, updateItem, deleteItem } = useMediaData<Serie>(user?.uid, "series", {
        getAll: getSeries, add: addSerie, update: updateSerie, delete: deleteSerie,
    })

    const { colecoes, createColecao, updateColecao: updateColecaoData, deleteColecao, addItem: addToColecao, removeItem: removeFromColecao } =
        useColecoes(user?.uid, "series")

    const counts = useMemo<Record<FilterKey, number>>(() => ({
        todos: series.length,
        concluido: series.filter(s => s.status === "concluido").length,
        assistindo: series.filter(s => s.status === "assistindo").length,
        abandonado: series.filter(s => s.status === "abandonado").length,
        quero_assistir: series.filter(s => s.status === "quero_assistir").length,
        colecoes: colecoes.length,
    }), [series, colecoes])

    const FILTERS: FilterOption<FilterKey>[] = [
        { key: "todos", label: "Todas", icon: MonitorPlay },
        { key: "concluido", label: "Assistidas", icon: Flag },
        { key: "assistindo", label: "Assistindo", icon: PlayCircle },
        { key: "abandonado", label: "Abandonadas", icon: XCircle },
        { key: "quero_assistir", label: "Quero Assistir", icon: Sparkles },
        { key: "colecoes", label: "Coleções", icon: Folder },
    ]

    const filtrados = useMemo(() => {
        if (filtro === "colecoes") return []
        let list = filtro === "todos" ? series : series.filter(s => s.status === (filtro as SerieStatus))
        if (busca.trim()) {
            const q = busca.toLowerCase()
            list = list.filter(s => s.titulo.toLowerCase().includes(q) || s.categoria.toLowerCase().includes(q))
        }
        return applySort(list, sortOrder)
    }, [series, filtro, busca, sortOrder])

    const handleAdd = async (data: { apiId: string; titulo: string; coverUrl: string; categoria: string; status: SerieStatus; nota: number | null; anoLancamento?: number | null }) => {
        await addItem({ apiId: data.apiId, titulo: data.titulo, capaUrl: data.coverUrl, categoria: data.categoria, status: data.status, nota: data.nota, anoLancamento: data.anoLancamento ?? null })
        setModalOpen(false)
    }

    const handleUpdate = async (id: string, updates: Partial<Serie>) => {
        await updateItem({ id, updates })
        if (selectedSerie?.id === id) setSelectedSerie(prev => prev ? { ...prev, ...updates } : null)
    }

    const handleAddToColecao = async (colecaoId: string) => {
        if (!selectedSerie) return
        const colecao = colecoes.find(c => c.id === colecaoId)
        const capaUrl = colecao?.itemIds.length === 0 ? (selectedSerie.capaUrl || null) : null
        await addToColecao({ colecaoId, itemId: selectedSerie.id, capaUrl })
    }

    const handleRemoveFromColecao = async (colecaoId: string) => {
        if (!selectedSerie) return
        await removeFromColecao({ colecaoId, itemId: selectedSerie.id })
    }

    const colecaoItems = useMemo(() => {
        if (!selectedColecao) return []
        return series.filter(s => selectedColecao.itemIds.includes(s.id)).map(s => ({
            id: s.id, titulo: s.titulo, imagemUrl: s.capaUrl, categoria: s.categoria,
            statusLabel: STATUS_LABELS[s.status], statusCor: STATUS_STYLES[s.status],
            nota: s.nota, anoLancamento: s.anoLancamento ?? null,
        }))
    }, [selectedColecao, series])

    const availableItems = useMemo(() => series.map(s => ({ id: s.id, titulo: s.titulo, imagemUrl: s.capaUrl, nota: s.nota })), [series])

    const isColecaoView = filtro === "colecoes"

    return (
        <div className="flex-1 flex flex-col h-dvh bg-background">
            <Header title="Séries" />
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 custom-scrollbar relative">
                <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8">
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[90px] rounded-xl bg-foreground/5" />)}</div>
                    ) : (
                        <MediaStatsBar<FilterKey> counts={counts} active={filtro} onChange={(f) => { setFiltro(f); if (f !== "colecoes") setSelectedColecao(null) }} options={FILTERS} />
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {!isColecaoView ? (
                            <>
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                                    <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nas suas séries..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-card-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm" />
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <SortDropdown value={sortOrder} onChange={setSortOrder} />
                                    <button onClick={() => setModalOpen(true)} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
                                        <Plus className="w-5 h-5" /><span className="hidden sm:inline">Adicionar Série</span><span className="sm:hidden">Adicionar</span>
                                    </button>
                                </div>
                            </>
                        ) : !selectedColecao ? (
                            <>
                                <div />
                                <button onClick={() => { setColecaoModalMode({ mode: "create", tipo: "series" }); setColecaoModalOpen(true) }} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
                                    <Plus className="w-5 h-5" /><span className="hidden sm:inline">Nova Coleção</span><span className="sm:hidden">Nova</span>
                                </button>
                            </>
                        ) : null}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">{[...Array(10)].map((_, i) => <Skeleton key={i} className="aspect-3/4 rounded-xl bg-foreground/5" />)}</div>
                    ) : isColecaoView ? (
                        selectedColecao ? (
                            <ColecaoDetailView colecao={selectedColecao} items={colecaoItems} fallbackIcon="📺" onBack={() => setSelectedColecao(null)} onItemClick={(id) => { const s = series.find(s => s.id === id); if (s) setSelectedSerie(s) }} onAddItems={() => { setColecaoModalMode({ mode: "edit", colecao: selectedColecao }); setColecaoModalOpen(true) }} />
                        ) : colecoes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card-background/50">
                                <span className="text-6xl mb-4 opacity-50">📁</span>
                                <h3 className="text-lg font-bold text-foreground mb-2">Nenhuma coleção criada</h3>
                                <p className="text-sm text-muted max-w-sm mb-6">Crie coleções para organizar suas séries por franquia, universo ou qualquer critério!</p>
                                <button onClick={() => { setColecaoModalMode({ mode: "create", tipo: "series" }); setColecaoModalOpen(true) }} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors"><Plus className="w-4 h-4" /> Criar primeira coleção</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                                {colecoes.map(colecao => <ColecaoCard key={colecao.id} colecao={colecao} onClick={() => setSelectedColecao(colecao)} onEdit={() => { setColecaoModalMode({ mode: "edit", colecao }); setColecaoModalOpen(true) }} onDelete={() => deleteColecao(colecao.id)} />)}
                            </div>
                        )
                    ) : filtrados.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                            {filtrados.map(serie => {
                                const mediaData: MediaData = { id: serie.id, titulo: serie.titulo, imagemUrl: serie.capaUrl, categoria: serie.categoria, statusLabel: STATUS_LABELS[serie.status] || serie.status, statusCor: STATUS_STYLES[serie.status] || "", nota: serie.nota }
                                return <MediaCard key={serie.id} data={mediaData} onClick={() => setSelectedSerie(serie)} fallbackIcon="📺" />
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card-background/50">
                            <span className="text-6xl mb-4 opacity-50">📺</span>
                            <h3 className="text-lg font-bold text-foreground mb-2">{busca ? "Nenhuma série encontrada" : "Sua coleção está vazia"}</h3>
                            <p className="text-sm text-muted max-w-sm mb-6">{busca ? "Não encontramos nenhuma série com esse nome ou categoria na sua lista." : "Adicione as séries que você está assistindo, já assistiu ou quer assistir!"}</p>
                            {!busca && <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors"><Plus className="w-4 h-4" /> Encontrar Séries</button>}
                        </div>
                    )}
                </main>
            </div>

            <MediaAddModal<SerieStatus>
                open={modalOpen} title="Adicionar Série" searchPlaceholder="Nome da série..." statusOptions={STATUS_OPTIONS} defaultStatus="quero_assistir" fallbackIcon="📺" onClose={() => setModalOpen(false)}
                onSearch={async (q) => { const res = await searchSeries(q); return res.map(s => ({ apiId: s.apiId, titulo: s.titulo, coverUrl: s.capaUrl, categoria: s.categoria, anoLancamento: s.anoLancamento })) }}
                onSave={handleAdd}
            />

            <MediaDetailModal<SerieStatus>
                key={selectedSerie?.id ?? "modal"}
                data={selectedSerie ? { id: selectedSerie.id, titulo: selectedSerie.titulo, coverUrl: selectedSerie.capaUrl, categoria: selectedSerie.categoria, nota: selectedSerie.nota, status: selectedSerie.status } : null}
                statusOptions={STATUS_OPTIONS} fallbackIcon="📺" colecoes={colecoes}
                onAddToColecao={handleAddToColecao} onRemoveFromColecao={handleRemoveFromColecao}
                onCreateColecao={() => { setColecaoModalMode({ mode: "create", tipo: "series" }); setColecaoModalOpen(true) }}
                onClose={() => setSelectedSerie(null)} onDelete={deleteItem} onUpdate={handleUpdate}
            />

            <ColecaoModal
                open={colecaoModalOpen} config={colecaoModalMode} availableItems={availableItems} onClose={() => setColecaoModalOpen(false)}
                onCreate={async (nome) => { await createColecao(nome) }}
                onUpdate={async (id, nome, itemIds, capaUrl) => {
                    await updateColecaoData({ id, data: { nome, itemIds, capaUrl } })
                    if (selectedColecao?.id === id) setSelectedColecao(prev => prev ? { ...prev, nome, itemIds, capaUrl } : null)
                }}
            />
        </div>
    )
}
