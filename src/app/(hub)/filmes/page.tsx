"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Film, Flag, PlayCircle, XCircle, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useToastContext } from "@/app/(hub)/layout"
import { Header } from "@/components/layout/Header"
import { Skeleton } from "@/components/ui/skeleton"
import { MediaStatsBar, FilterOption } from "@/components/shared/MediaStatsBar"
import { MediaCard, MediaData } from "@/components/shared/MediaCard"
import { MediaAddModal } from "@/components/shared/MediaAddModal"
import { MediaDetailModal, StatusOption } from "@/components/shared/MediaDetailModal"
import { getFilmes, addFilme, deleteFilme, updateFilme } from "@/lib/firebase/filmes"
import { searchFilmes } from "@/lib/tmdb"
import type { Filme, FilmeStatus } from "@/types/filme"

type FilterKey = FilmeStatus | "todos"

const STATUS_STYLES: Record<FilmeStatus, string> = {
    assistindo: "bg-blue-600 text-white font-medium border-blue-400 shadow-md",
    concluido: "bg-cyan-600 text-white font-medium border-cyan-400 shadow-md",
    abandonado: "bg-red-600 text-white font-medium border-red-400 shadow-md",
    quero_assistir: "bg-violet-600 text-white font-medium border-violet-400 shadow-md",
}

const STATUS_LABELS: Record<FilmeStatus, string> = {
    assistindo: "Assistindo",
    concluido: "Assistido",
    abandonado: "Abandonado",
    quero_assistir: "Quero Assistir",
}

const FILTERS: FilterOption<FilterKey>[] = [
    { key: "todos", label: "Todos", icon: Film },
    { key: "concluido", label: "Assistidos", icon: Flag },
    { key: "assistindo", label: "Assistindo", icon: PlayCircle },
    { key: "abandonado", label: "Abandonados", icon: XCircle },
    { key: "quero_assistir", label: "Quero Assistir", icon: Sparkles },
]

const STATUS_OPTIONS: StatusOption<FilmeStatus>[] = [
    { value: "assistindo", label: "Assistindo", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { value: "concluido", label: "Assistido", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    { value: "abandonado", label: "Abandonado", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    { value: "quero_assistir", label: "Quero Assistir", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
]

export default function FilmesPage() {
    const { user } = useAuth()
    const toast = useToastContext()

    const [filmes, setFilmes] = useState<Filme[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedFilme, setSelectedFilme] = useState<Filme | null>(null)
    const [filtro, setFiltro] = useState<FilterKey>("todos")
    const [busca, setBusca] = useState("")

    useEffect(() => {
        if (!user?.uid) return
        getFilmes(user.uid).then((data) => {
            setFilmes(data)
            setLoading(false)
        })
    }, [user?.uid])

    const counts = useMemo<Record<FilterKey, number>>(() => ({
        todos: filmes.length,
        concluido: filmes.filter(f => f.status === "concluido").length,
        assistindo: filmes.filter(f => f.status === "assistindo").length,
        abandonado: filmes.filter(f => f.status === "abandonado").length,
        quero_assistir: filmes.filter(f => f.status === "quero_assistir").length,
    }), [filmes])

    const filtrados = useMemo(() => {
        let list = filtro === "todos" ? filmes : filmes.filter(f => f.status === filtro)
        if (busca.trim()) {
            const q = busca.toLowerCase()
            list = list.filter(f =>
                f.titulo.toLowerCase().includes(q) ||
                f.categoria.toLowerCase().includes(q)
            )
        }
        return list.sort((a, b) => {
            const notaA = a.nota ?? -1
            const notaB = b.nota ?? -1
            if (notaA !== notaB) return notaB - notaA
            return b.createdAt - a.createdAt
        })
    }, [filmes, filtro, busca])

    const handleAdd = async (data: {
        apiId: string
        titulo: string
        coverUrl: string
        categoria: string
        status: FilmeStatus
        nota: number | null
    }) => {
        if (!user) return
        const filmeData = {
             apiId: data.apiId,
             titulo: data.titulo,
             capaUrl: data.coverUrl,
             categoria: data.categoria,
             status: data.status,
             nota: data.nota,
        }
        const res = await addFilme(user.uid, filmeData)
        if (res.error || !res.id) return

        const novo: Filme = {
            ...filmeData,
            id: res.id,
            userId: user.uid,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }
        setFilmes(prev => [novo, ...prev])
        setModalOpen(false)
        toast.success("Filme adicionado com sucesso!")
    }

    const handleUpdate = async (id: string, updates: Partial<Filme>) => {
        const res = await updateFilme(id, updates)
        if (res.error) {
            toast.error("Erro ao tentar atualizar")
            return
        }

        setFilmes(prev => prev.map(f =>
            f.id === id ? { ...f, ...updates, updatedAt: Date.now() } : f
        ))

        if (selectedFilme && selectedFilme.id === id) {
            setSelectedFilme(prev => prev ? { ...prev, ...updates } : null)
        }
    }

    const handleDelete = async (id: string) => {
        if (!user) return
        const res = await deleteFilme(id)
        if (res.error) return

        setFilmes(prev => prev.filter(f => f.id !== id))
        setSelectedFilme(null)
        toast.success("Removido da coleção")
    }

    return (
        <div className="flex-1 flex flex-col h-dvh bg-background">
            <Header title="Filmes" />

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
                                placeholder="Buscar nos seus filmes..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card-background border border-border text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
                            />
                        </div>

                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">Adicionar Filme</span>
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
                            {filtrados.map(filme => {
                                const mediaData: MediaData = {
                                    id: filme.id,
                                    titulo: filme.titulo,
                                    imagemUrl: filme.capaUrl,
                                    categoria: filme.categoria,
                                    statusLabel: STATUS_LABELS[filme.status] || filme.status,
                                    statusCor: STATUS_STYLES[filme.status] || "",
                                    nota: filme.nota,
                                }
                                return (
                                    <MediaCard
                                        key={filme.id}
                                        data={mediaData}
                                        onClick={() => setSelectedFilme(filme)}
                                        fallbackIcon="🎬"
                                    />
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card-background/50">
                            <span className="text-6xl mb-4 opacity-50">🎬</span>
                            <h3 className="text-lg font-bold text-white mb-2">
                                {busca ? "Nenhum filme encontrado" : "Sua coleção está vazia"}
                            </h3>
                            <p className="text-sm text-muted max-w-sm mb-6">
                                {busca
                                    ? "Não encontramos nenhum filme com esse nome ou categoria na sua lista."
                                    : "Adicione os filmes que você está assistindo, já assistiu ou quer assistir!"}
                            </p>
                            {!busca && (
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Encontrar Filmes
                                </button>
                            )}
                        </div>
                    )}
                </main>
            </div>

            <MediaAddModal<FilmeStatus>
                open={modalOpen}
                title="Adicionar Filme"
                searchPlaceholder="Nome do filme..."
                statusOptions={STATUS_OPTIONS}
                defaultStatus="quero_assistir"
                fallbackIcon="🎬"
                onClose={() => setModalOpen(false)}
                onSearch={async (q) => {
                    const res = await searchFilmes(q)
                    return res.map(f => ({
                        apiId: f.apiId,
                        titulo: f.titulo,
                        coverUrl: f.capaUrl,
                        categoria: f.categoria
                    }))
                }}
                onSave={handleAdd}
            />

            <MediaDetailModal<FilmeStatus>
                key={selectedFilme?.id ?? "modal"}
                data={selectedFilme ? {
                    id: selectedFilme.id,
                    titulo: selectedFilme.titulo,
                    coverUrl: selectedFilme.capaUrl,
                    categoria: selectedFilme.categoria,
                    nota: selectedFilme.nota,
                    status: selectedFilme.status,
                } : null}
                statusOptions={STATUS_OPTIONS}
                fallbackIcon="🎬"
                onClose={() => setSelectedFilme(null)}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
            />
        </div>
    )
}
