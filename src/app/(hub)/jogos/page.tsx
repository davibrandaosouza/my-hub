"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Gamepad2, Flag, Clock3, XCircle, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useToastContext } from "@/app/(hub)/layout"
import { Header } from "@/components/layout/Header"
import { Skeleton } from "@/components/ui/skeleton"
import { MediaStatsBar, FilterOption } from "@/components/shared/MediaStatsBar"
import { MediaCard, MediaData } from "@/components/shared/MediaCard"
import { MediaAddModal } from "@/components/shared/MediaAddModal"
import { MediaDetailModal, StatusOption } from "@/components/shared/MediaDetailModal"
import { getJogos, addJogo, deleteJogo, updateJogo } from "@/lib/firebase/jogos"
import { searchGames } from "@/lib/rawg"
import type { Jogo, JogoStatus } from "@/types/jogo"

type FilterKey = JogoStatus | "todos"

const STATUS_STYLES: Record<JogoStatus, string> = {
    jogando: "bg-blue-600 text-white font-medium border-blue-400 shadow-md",
    zerado: "bg-cyan-600 text-white font-medium border-cyan-400 shadow-md",
    abandonado: "bg-red-600 text-white font-medium border-red-400 shadow-md",
    quero_jogar: "bg-violet-600 text-white font-medium border-violet-400 shadow-md",
}

const STATUS_LABELS: Record<JogoStatus, string> = {
    jogando: "Jogando",
    zerado: "Concluído",
    abandonado: "Abandonado",
    quero_jogar: "Quero Jogar",
}

const FILTERS: FilterOption<FilterKey>[] = [
    { key: "todos", label: "Todos", icon: Gamepad2 },
    { key: "zerado", label: "Concluídos", icon: Flag },
    { key: "jogando", label: "Jogando", icon: Clock3 },
    { key: "abandonado", label: "Abandonados", icon: XCircle },
    { key: "quero_jogar", label: "Quero Jogar", icon: Sparkles },
]

const STATUS_OPTIONS: StatusOption<JogoStatus>[] = [
    { value: "jogando", label: "Jogando", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { value: "zerado", label: "Concluído", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    { value: "abandonado", label: "Abandonado", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    { value: "quero_jogar", label: "Quero Jogar", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
]

export default function JogosPage() {
    const { user } = useAuth()
    const toast = useToastContext()

    const [jogos, setJogos] = useState<Jogo[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedJogo, setSelectedJogo] = useState<Jogo | null>(null)
    const [filtro, setFiltro] = useState<FilterKey>("todos")
    const [busca, setBusca] = useState("")

    useEffect(() => {
        if (!user?.uid) return
        getJogos(user.uid).then((data) => {
            setJogos(data)
            setLoading(false)
        })
    }, [user?.uid])

    const counts = useMemo<Record<FilterKey, number>>(() => ({
        todos: jogos.length,
        zerado: jogos.filter(j => j.status === "zerado").length,
        jogando: jogos.filter(j => j.status === "jogando").length,
        abandonado: jogos.filter(j => j.status === "abandonado").length,
        quero_jogar: jogos.filter(j => j.status === "quero_jogar").length,
    }), [jogos])

    const filtrados = useMemo(() => {
        let list = filtro === "todos" ? jogos : jogos.filter(j => j.status === filtro)
        if (busca.trim()) {
            const q = busca.toLowerCase()
            list = list.filter(j =>
                j.titulo.toLowerCase().includes(q) ||
                j.categoria.toLowerCase().includes(q)
            )
        }
        return list.sort((a, b) => {
            const notaA = a.nota ?? -1
            const notaB = b.nota ?? -1
            if (notaA !== notaB) return notaB - notaA
            return b.createdAt - a.createdAt
        })
    }, [jogos, filtro, busca])

    const handleAdd = async (data: {
        apiId: string
        titulo: string
        coverUrl: string
        categoria: string
        status: JogoStatus
        nota: number | null
    }) => {
        if (!user?.uid) return
        const jogoData = {
            rawgId: Number(data.apiId),
            titulo: data.titulo,
            coverUrl: data.coverUrl,
            categoria: data.categoria,
            status: data.status,
            nota: data.nota,
        }
        const { id, error } = await addJogo(user.uid, jogoData)
        if (error || !id) {
            toast.error(error ?? "Erro ao adicionar jogo.")
            return
        }
        const novo: Jogo = {
            id,
            userId: user.uid,
            ...jogoData,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }
        setJogos(prev => [novo, ...prev])
        toast.success("Jogo adicionado!")
        setModalOpen(false)
    }

    const handleDelete = async (id: string) => {
        setJogos(prev => prev.filter(j => j.id !== id))
        toast.success("Jogo removido da coleção!")
        const { error } = await deleteJogo(id)
        if (error) {
            toast.error(error)
            getJogos(user!.uid).then(setJogos)
        }
    }

    const handleUpdateJogo = async (id: string, updates: Partial<Jogo>) => {
        const { error } = await updateJogo(id, updates)
        if (error) {
            toast.error(error)
            return
        }
        setJogos(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j))
        if (selectedJogo?.id === id) {
            setSelectedJogo(prev => prev ? { ...prev, ...updates } : null)
        }
        toast.success("Jogo atualizado!")
    }

    return (
        <div className="flex-1 flex flex-col h-dvh bg-background">
            <Header title="Jogos" />

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
                                placeholder="Buscar nos seus jogos..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card-background border border-border text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
                            />
                        </div>

                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">Adicionar Jogo</span>
                            <span className="sm:hidden">Adicionar</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                            {[...Array(12)].map((_, i) => (
                                <Skeleton key={i} className="aspect-3/4 rounded-xl bg-white/5" />
                            ))}
                        </div>
                    ) : filtrados.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                            {filtrados.map((jogo) => {
                                const mediaData: MediaData = {
                                    id: jogo.id,
                                    titulo: jogo.titulo,
                                    imagemUrl: jogo.coverUrl,
                                    categoria: jogo.categoria,
                                    statusLabel: STATUS_LABELS[jogo.status] || jogo.status,
                                    statusCor: STATUS_STYLES[jogo.status] || "",
                                    nota: jogo.nota,
                                }
                                return (
                                    <MediaCard
                                        key={jogo.id}
                                        data={mediaData}
                                        onClick={() => setSelectedJogo(jogo)}
                                        fallbackIcon="🎮"
                                    />
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card-background/50">
                            <span className="text-6xl mb-4 opacity-50">🎮</span>
                            <h3 className="text-lg font-bold text-white mb-2">
                                {busca ? "Nenhum jogo encontrado" : "Sua coleção está vazia"}
                            </h3>
                            <p className="text-sm text-muted max-w-sm mb-6">
                                {busca
                                    ? "Não encontramos nenhum jogo com esse nome ou categoria na sua lista."
                                    : "Adicione os jogos que você está jogando, já zerou ou quer jogar!"}
                            </p>
                            {!busca && (
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Encontrar Jogos
                                </button>
                            )}
                        </div>
                    )}
                </main>
            </div>

            <MediaAddModal<JogoStatus>
                open={modalOpen}
                title="Adicionar Jogo"
                searchPlaceholder="Nome do jogo..."
                statusOptions={STATUS_OPTIONS}
                defaultStatus="quero_jogar"
                fallbackIcon="🎮"
                onClose={() => setModalOpen(false)}
                onSearch={async (q) => {
                    const res = await searchGames(q)
                    return res.map(g => ({
                        apiId: String(g.id),
                        titulo: g.name,
                        coverUrl: g.background_image ?? "",
                        categoria: g.genres?.[0]?.name ?? "Outros"
                    }))
                }}
                onSave={handleAdd}
            />

            <MediaDetailModal<JogoStatus>
                key={selectedJogo?.id ?? "modal"}
                data={selectedJogo ? {
                    id: selectedJogo.id,
                    titulo: selectedJogo.titulo,
                    coverUrl: selectedJogo.coverUrl,
                    categoria: selectedJogo.categoria,
                    nota: selectedJogo.nota,
                    status: selectedJogo.status,
                } : null}
                statusOptions={STATUS_OPTIONS}
                fallbackIcon="🎮"
                onClose={() => setSelectedJogo(null)}
                onDelete={(id) => {
                    handleDelete(id)
                    setSelectedJogo(null)
                }}
                onUpdate={handleUpdateJogo}
            />
        </div>
    )
}
