"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Tv, Flag, PlayCircle, XCircle, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useToastContext } from "@/app/(hub)/layout"
import { Header } from "@/components/layout/Header"
import { Skeleton } from "@/components/ui/skeleton"
import { MediaStatsBar, FilterOption } from "@/components/shared/MediaStatsBar"
import { MediaCard, MediaData } from "@/components/shared/MediaCard"
import { MediaAddModal } from "@/components/shared/MediaAddModal"
import { MediaDetailModal, StatusOption } from "@/components/shared/MediaDetailModal"
import { getAnimes, addAnime, deleteAnime, updateAnime } from "@/lib/firebase/animes"
import { searchAnimes } from "@/lib/jikan"
import type { Anime, AnimeStatus } from "@/types/anime"

type FilterKey = AnimeStatus | "todos"

const STATUS_STYLES: Record<AnimeStatus, string> = {
    assistindo: "bg-blue-600 text-white font-medium border-blue-400 shadow-md",
    concluido: "bg-cyan-600 text-white font-medium border-cyan-400 shadow-md",
    abandonado: "bg-red-600 text-white font-medium border-red-400 shadow-md",
    quero_assistir: "bg-violet-600 text-white font-medium border-violet-400 shadow-md",
}

const STATUS_LABELS: Record<AnimeStatus, string> = {
    assistindo: "Assistindo",
    concluido: "Concluído",
    abandonado: "Abandonado",
    quero_assistir: "Quero Assistir",
}

const FILTERS: FilterOption<FilterKey>[] = [
    { key: "todos", label: "Todos", icon: Tv },
    { key: "concluido", label: "Concluídos", icon: Flag },
    { key: "assistindo", label: "Assistindo", icon: PlayCircle },
    { key: "abandonado", label: "Abandonados", icon: XCircle },
    { key: "quero_assistir", label: "Quero Assistir", icon: Sparkles },
]

const STATUS_OPTIONS: StatusOption<AnimeStatus>[] = [
    { value: "assistindo", label: "Assistindo", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { value: "concluido", label: "Concluído", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    { value: "abandonado", label: "Abandonado", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    { value: "quero_assistir", label: "Quero Assistir", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
]

export default function AnimesPage() {
    const { user } = useAuth()
    const toast = useToastContext()

    const [animes, setAnimes] = useState<Anime[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
    const [filtro, setFiltro] = useState<FilterKey>("todos")
    const [busca, setBusca] = useState("")

    useEffect(() => {
        if (!user?.uid) return
        getAnimes(user.uid).then((data) => {
            setAnimes(data)
            setLoading(false)
        })
    }, [user?.uid])

    const counts = useMemo<Record<FilterKey, number>>(() => ({
        todos: animes.length,
        concluido: animes.filter(a => a.status === "concluido").length,
        assistindo: animes.filter(a => a.status === "assistindo").length,
        abandonado: animes.filter(a => a.status === "abandonado").length,
        quero_assistir: animes.filter(a => a.status === "quero_assistir").length,
    }), [animes])

    const filtrados = useMemo(() => {
        let list = filtro === "todos" ? animes : animes.filter(a => a.status === filtro)
        if (busca.trim()) {
            const q = busca.toLowerCase()
            list = list.filter(a =>
                a.titulo.toLowerCase().includes(q) ||
                a.categoria.toLowerCase().includes(q)
            )
        }
        return list.sort((a, b) => {
            const notaA = a.nota ?? -1
            const notaB = b.nota ?? -1
            if (notaA !== notaB) return notaB - notaA
            return b.createdAt - a.createdAt
        })
    }, [animes, filtro, busca])

    const handleAdd = async (data: {
        apiId: string
        titulo: string
        coverUrl: string
        categoria: string
        status: AnimeStatus
        nota: number | null
    }) => {
        if (!user) return
        const animeData = {
             apiId: data.apiId,
             titulo: data.titulo,
             capaUrl: data.coverUrl,
             categoria: data.categoria,
             status: data.status,
             nota: data.nota,
        }
        const res = await addAnime(user.uid, animeData)
        if (res.error || !res.id) return

        const novo: Anime = {
            ...animeData,
            id: res.id,
            userId: user.uid,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }
        setAnimes(prev => [novo, ...prev])
        setModalOpen(false)
        toast.success("Anime adicionado com sucesso!")
    }

    const handleUpdate = async (id: string, updates: Partial<Anime>) => {
        const res = await updateAnime(id, updates)
        if (res.error) {
            toast.error("Erro ao tentar atualizar")
            return
        }

        setAnimes(prev => prev.map(a =>
            a.id === id ? { ...a, ...updates, updatedAt: Date.now() } : a
        ))

        if (selectedAnime && selectedAnime.id === id) {
            setSelectedAnime(prev => prev ? { ...prev, ...updates } : null)
        }
    }

    const handleDelete = async (id: string) => {
        if (!user) return
        const res = await deleteAnime(id)
        if (res.error) return

        setAnimes(prev => prev.filter(a => a.id !== id))
        setSelectedAnime(null)
        toast.success("Removido da coleção")
    }

    return (
        <div className="flex-1 flex flex-col h-dvh bg-background">
            <Header title="Animes" />

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
                                placeholder="Buscar nos seus animes..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card-background border border-border text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
                            />
                        </div>

                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">Adicionar Anime</span>
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
                            {filtrados.map(anime => {
                                const mediaData: MediaData = {
                                    id: anime.id,
                                    titulo: anime.titulo,
                                    imagemUrl: anime.capaUrl,
                                    categoria: anime.categoria,
                                    statusLabel: STATUS_LABELS[anime.status] || anime.status,
                                    statusCor: STATUS_STYLES[anime.status] || "",
                                    nota: anime.nota,
                                }
                                return (
                                    <MediaCard
                                        key={anime.id}
                                        data={mediaData}
                                        onClick={() => setSelectedAnime(anime)}
                                        fallbackIcon="📺"
                                    />
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card-background/50">
                            <span className="text-6xl mb-4 opacity-50">🍿</span>
                            <h3 className="text-lg font-bold text-white mb-2">
                                {busca ? "Nenhum anime encontrado" : "Sua coleção está vazia"}
                            </h3>
                            <p className="text-sm text-muted max-w-sm mb-6">
                                {busca
                                    ? "Não encontramos nenhum anime com esse nome ou categoria na sua lista."
                                    : "Adicione os animes que você está assistindo, já assistiu ou quer assistir!"}
                            </p>
                            {!busca && (
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Encontrar Animes
                                </button>
                            )}
                        </div>
                    )}
                </main>
            </div>

            <MediaAddModal<AnimeStatus>
                open={modalOpen}
                title="Adicionar Anime"
                searchPlaceholder="Nome do anime..."
                statusOptions={STATUS_OPTIONS}
                defaultStatus="quero_assistir"
                fallbackIcon="📺"
                onClose={() => setModalOpen(false)}
                onSearch={async (q) => {
                    const res = await searchAnimes(q)
                    return res.map(a => ({
                        apiId: a.apiId,
                        titulo: a.titulo,
                        coverUrl: a.capaUrl,
                        categoria: a.categoria
                    }))
                }}
                onSave={handleAdd}
            />

            <MediaDetailModal<AnimeStatus>
                key={selectedAnime?.id ?? "modal"}
                data={selectedAnime ? {
                    id: selectedAnime.id,
                    titulo: selectedAnime.titulo,
                    coverUrl: selectedAnime.capaUrl,
                    categoria: selectedAnime.categoria,
                    nota: selectedAnime.nota,
                    status: selectedAnime.status,
                } : null}
                statusOptions={STATUS_OPTIONS}
                fallbackIcon="📺"
                onClose={() => setSelectedAnime(null)}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
            />
        </div>
    )
}
