"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, MonitorPlay, Flag, PlayCircle, XCircle, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useToastContext } from "@/app/(hub)/layout"
import { Header } from "@/components/layout/Header"
import { Skeleton } from "@/components/ui/skeleton"
import { MediaStatsBar, FilterOption } from "@/components/shared/MediaStatsBar"
import { MediaCard, MediaData } from "@/components/shared/MediaCard"
import { MediaAddModal } from "@/components/shared/MediaAddModal"
import { MediaDetailModal, StatusOption } from "@/components/shared/MediaDetailModal"
import { getSeries, addSerie, deleteSerie, updateSerie } from "@/lib/firebase/series"
import { searchSeries } from "@/lib/tmdb"
import type { Serie, SerieStatus } from "@/types/serie"

type FilterKey = SerieStatus | "todos"

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

const FILTERS: FilterOption<FilterKey>[] = [
    { key: "todos", label: "Todas", icon: MonitorPlay },
    { key: "concluido", label: "Assistidas", icon: Flag },
    { key: "assistindo", label: "Assistindo", icon: PlayCircle },
    { key: "abandonado", label: "Abandonadas", icon: XCircle },
    { key: "quero_assistir", label: "Quero Assistir", icon: Sparkles },
]

const STATUS_OPTIONS: StatusOption<SerieStatus>[] = [
    { value: "assistindo", label: "Assistindo", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { value: "concluido", label: "Assistida", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    { value: "abandonado", label: "Abandonada", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    { value: "quero_assistir", label: "Quero Assistir", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
]

export default function SeriesPage() {
    const { user } = useAuth()
    const toast = useToastContext()

    const [series, setSeries] = useState<Serie[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedSerie, setSelectedSerie] = useState<Serie | null>(null)
    const [filtro, setFiltro] = useState<FilterKey>("todos")
    const [busca, setBusca] = useState("")

    useEffect(() => {
        if (!user?.uid) return
        getSeries(user.uid).then((data) => {
            setSeries(data)
            setLoading(false)
        })
    }, [user?.uid])

    const counts = useMemo<Record<FilterKey, number>>(() => ({
        todos: series.length,
        concluido: series.filter(s => s.status === "concluido").length,
        assistindo: series.filter(s => s.status === "assistindo").length,
        abandonado: series.filter(s => s.status === "abandonado").length,
        quero_assistir: series.filter(s => s.status === "quero_assistir").length,
    }), [series])

    const filtrados = useMemo(() => {
        let list = filtro === "todos" ? series : series.filter(s => s.status === filtro)
        if (busca.trim()) {
            const q = busca.toLowerCase()
            list = list.filter(s =>
                s.titulo.toLowerCase().includes(q) ||
                s.categoria.toLowerCase().includes(q)
            )
        }
        return list.sort((a, b) => {
            const notaA = a.nota ?? -1
            const notaB = b.nota ?? -1
            if (notaA !== notaB) return notaB - notaA
            return b.createdAt - a.createdAt
        })
    }, [series, filtro, busca])

    const handleAdd = async (data: {
        apiId: string
        titulo: string
        coverUrl: string
        categoria: string
        status: SerieStatus
        nota: number | null
    }) => {
        if (!user) return
        const serieData = {
             apiId: data.apiId,
             titulo: data.titulo,
             capaUrl: data.coverUrl,
             categoria: data.categoria,
             status: data.status,
             nota: data.nota,
        }
        const res = await addSerie(user.uid, serieData)
        if (res.error || !res.id) return

        const novo: Serie = {
            ...serieData,
            id: res.id,
            userId: user.uid,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }
        setSeries(prev => [novo, ...prev])
        setModalOpen(false)
        toast.success("Série adicionada com sucesso!")
    }

    const handleUpdate = async (id: string, updates: Partial<Serie>) => {
        const res = await updateSerie(id, updates)
        if (res.error) {
            toast.error("Erro ao tentar atualizar")
            return
        }

        setSeries(prev => prev.map(s =>
            s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
        ))

        if (selectedSerie && selectedSerie.id === id) {
            setSelectedSerie(prev => prev ? { ...prev, ...updates } : null)
        }
    }

    const handleDelete = async (id: string) => {
        if (!user) return
        const res = await deleteSerie(id)
        if (res.error) return

        setSeries(prev => prev.filter(s => s.id !== id))
        setSelectedSerie(null)
        toast.success("Removida da coleção")
    }

    return (
        <div className="flex-1 flex flex-col h-dvh bg-background">
            <Header title="Séries" />

            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 custom-scrollbar relative">
                <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8">
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-[90px] rounded-xl bg-white/5" />
                            ))}
                        </div>
                    ) : (
                        <MediaStatsBar<FilterKey>
                            counts={counts}
                            active={filtro}
                            onChange={setFiltro}
                            options={FILTERS}
                        />
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                            <input
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                placeholder="Buscar nas suas séries..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card-background border border-border text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
                            />
                        </div>

                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">Adicionar Série</span>
                            <span className="sm:hidden">Adicionar</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                            {[...Array(10)].map((_, i) => (
                                <Skeleton key={i} className="aspect-3/4 rounded-xl bg-white/5" />
                            ))}
                        </div>
                    ) : filtrados.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                            {filtrados.map(serie => {
                                const mediaData: MediaData = {
                                    id: serie.id,
                                    titulo: serie.titulo,
                                    imagemUrl: serie.capaUrl,
                                    categoria: serie.categoria,
                                    statusLabel: STATUS_LABELS[serie.status] || serie.status,
                                    statusCor: STATUS_STYLES[serie.status] || "",
                                    nota: serie.nota,
                                }
                                return (
                                    <MediaCard
                                        key={serie.id}
                                        data={mediaData}
                                        onClick={() => setSelectedSerie(serie)}
                                        fallbackIcon="📺"
                                    />
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card-background/50">
                            <span className="text-6xl mb-4 opacity-50">📺</span>
                            <h3 className="text-lg font-bold text-white mb-2">
                                {busca ? "Nenhuma série encontrada" : "Sua coleção está vazia"}
                            </h3>
                            <p className="text-sm text-muted max-w-sm mb-6">
                                {busca
                                    ? "Não encontramos nenhuma série com esse nome ou categoria na sua lista."
                                    : "Adicione as séries que você está assistindo, já assistiu ou quer assistir!"}
                            </p>
                            {!busca && (
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Encontrar Séries
                                </button>
                            )}
                        </div>
                    )}
                </main>
            </div>

            <MediaAddModal<SerieStatus>
                open={modalOpen}
                title="Adicionar Série"
                searchPlaceholder="Nome da série..."
                statusOptions={STATUS_OPTIONS}
                defaultStatus="quero_assistir"
                fallbackIcon="📺"
                onClose={() => setModalOpen(false)}
                onSearch={async (q) => {
                    const res = await searchSeries(q)
                    return res.map(s => ({
                        apiId: s.apiId,
                        titulo: s.titulo,
                        coverUrl: s.capaUrl,
                        categoria: s.categoria
                    }))
                }}
                onSave={handleAdd}
            />

            <MediaDetailModal<SerieStatus>
                key={selectedSerie?.id ?? "modal"}
                data={selectedSerie ? {
                    id: selectedSerie.id,
                    titulo: selectedSerie.titulo,
                    coverUrl: selectedSerie.capaUrl,
                    categoria: selectedSerie.categoria,
                    nota: selectedSerie.nota,
                    status: selectedSerie.status,
                } : null}
                statusOptions={STATUS_OPTIONS}
                fallbackIcon="📺"
                onClose={() => setSelectedSerie(null)}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
            />
        </div>
    )
}
