"use client"

import { useState, useMemo } from "react"
import { Search, Plus, Gamepad2, Flag, Clock3, XCircle, Sparkles, Folder } from "lucide-react"
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
import { getJogos, addJogo, deleteJogo, updateJogo } from "@/lib/firebase/jogos"
import { searchGames } from "@/lib/rawg"
import { useMediaData } from "@/hooks/useMediaData"
import { useColecoes } from "@/hooks/useColecoes"
import type { Jogo, JogoStatus } from "@/types/jogo"
import type { Colecao } from "@/types/colecao"

type FilterKey = JogoStatus | "todos" | "colecoes"

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

const STATUS_OPTIONS: StatusOption<JogoStatus>[] = [
    { value: "jogando", label: "Jogando", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { value: "zerado", label: "Concluído", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    { value: "abandonado", label: "Abandonado", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    { value: "quero_jogar", label: "Quero Jogar", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
]

function applySort(list: Jogo[], sort: SortKey): Jogo[] {
    return [...list].sort((a, b) => {
        const notaA = a.nota ?? -1
        const notaB = b.nota ?? -1
        if (notaA !== notaB) return notaB - notaA

        switch (sort) {
            case "alpha_asc":
                return a.titulo.localeCompare(b.titulo, "pt-BR")
            case "alpha_desc":
                return b.titulo.localeCompare(a.titulo, "pt-BR")
            case "added_asc":
                return a.createdAt - b.createdAt
            case "added_desc":
                return b.createdAt - a.createdAt
            case "release_asc": {
                const yrA = a.anoLancamento ?? Infinity
                const yrB = b.anoLancamento ?? Infinity
                return yrA - yrB
            }
            case "release_desc": {
                const yrA = a.anoLancamento ?? -Infinity
                const yrB = b.anoLancamento ?? -Infinity
                return yrB - yrA
            }
            default:
                return a.titulo.localeCompare(b.titulo, "pt-BR")
        }
    })
}

export default function JogosPage() {
    const { user } = useAuth()
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedJogo, setSelectedJogo] = useState<Jogo | null>(null)
    const [filtro, setFiltro] = useState<FilterKey>("todos")
    const [busca, setBusca] = useState("")
    const [sortOrder, setSortOrder] = useState<SortKey>("alpha_asc")

    // Coleções
    const [colecaoModalOpen, setColecaoModalOpen] = useState(false)
    const [colecaoModalMode, setColecaoModalMode] = useState<{ mode: "create"; tipo: "jogos" } | { mode: "edit"; colecao: Colecao }>({ mode: "create", tipo: "jogos" })
    const [selectedColecao, setSelectedColecao] = useState<Colecao | null>(null)

    const {
        data: jogos,
        loading,
        addItem,
        updateItem,
        deleteItem
    } = useMediaData<Jogo>(user?.uid, "jogos", {
        getAll: getJogos,
        add: addJogo,
        update: updateJogo,
        delete: deleteJogo,
    })

    const {
        colecoes,
        createColecao,
        updateColecao: updateColecaoData,
        deleteColecao,
        addItem: addToColecao,
        removeItem: removeFromColecao,
    } = useColecoes(user?.uid, "jogos")

    const counts = useMemo<Record<FilterKey, number>>(() => ({
        todos: jogos.length,
        zerado: jogos.filter(j => j.status === "zerado").length,
        jogando: jogos.filter(j => j.status === "jogando").length,
        abandonado: jogos.filter(j => j.status === "abandonado").length,
        quero_jogar: jogos.filter(j => j.status === "quero_jogar").length,
        colecoes: colecoes.length,
    }), [jogos, colecoes])

    const FILTERS: FilterOption<FilterKey>[] = [
        { key: "todos", label: "Todos", icon: Gamepad2 },
        { key: "zerado", label: "Concluídos", icon: Flag },
        { key: "jogando", label: "Jogando", icon: Clock3 },
        { key: "abandonado", label: "Abandonados", icon: XCircle },
        { key: "quero_jogar", label: "Quero Jogar", icon: Sparkles },
        { key: "colecoes", label: "Coleções", icon: Folder },
    ]

    const filtrados = useMemo(() => {
        if (filtro === "colecoes") return []
        let list = filtro === "todos" ? jogos : jogos.filter(j => j.status === (filtro as JogoStatus))
        if (busca.trim()) {
            const q = busca.toLowerCase()
            list = list.filter(j =>
                j.titulo.toLowerCase().includes(q) ||
                j.categoria.toLowerCase().includes(q)
            )
        }
        return applySort(list, sortOrder)
    }, [jogos, filtro, busca, sortOrder])

    const handleAdd = async (data: {
        apiId: string
        titulo: string
        coverUrl: string
        categoria: string
        status: JogoStatus
        nota: number | null
        anoLancamento?: number | null
    }) => {
        await addItem({
            rawgId: Number(data.apiId),
            titulo: data.titulo,
            coverUrl: data.coverUrl,
            categoria: data.categoria,
            status: data.status,
            nota: data.nota,
            anoLancamento: data.anoLancamento ?? null,
        })
        setModalOpen(false)
    }

    const handleUpdate = async (id: string, updates: Partial<Jogo>) => {
        await updateItem({ id, updates })
        if (selectedJogo && selectedJogo.id === id) {
            setSelectedJogo(prev => prev ? { ...prev, ...updates } : null)
        }
    }

    // Coleção: add/remove item
    const handleAddToColecao = async (colecaoId: string) => {
        if (!selectedJogo) return
        const colecao = colecoes.find(c => c.id === colecaoId)
        const capaUrl = colecao?.itemIds.length === 0 ? (selectedJogo.coverUrl || null) : null
        await addToColecao({ colecaoId, itemId: selectedJogo.id, capaUrl })
    }

    const handleRemoveFromColecao = async (colecaoId: string) => {
        if (!selectedJogo) return
        await removeFromColecao({ colecaoId, itemId: selectedJogo.id })
    }

    // Colecao items para a view de detalhe
    const colecaoItems = useMemo(() => {
        if (!selectedColecao) return []
        return jogos
            .filter(j => selectedColecao.itemIds.includes(j.id))
            .map(j => ({
                id: j.id,
                titulo: j.titulo,
                imagemUrl: j.coverUrl,
                categoria: j.categoria,
                statusLabel: STATUS_LABELS[j.status],
                statusCor: STATUS_STYLES[j.status],
                nota: j.nota,
                anoLancamento: j.anoLancamento ?? null,
            }))
    }, [selectedColecao, jogos])

    // Items disponíveis para adicionar à coleção
    const availableItems = useMemo(() => jogos.map(j => ({
        id: j.id,
        titulo: j.titulo,
        imagemUrl: j.coverUrl,
        nota: j.nota,
    })), [jogos])

    const isColecaoView = filtro === "colecoes"

    return (
        <div className="flex-1 flex flex-col h-dvh bg-background">
            <Header title="Jogos" />

            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 custom-scrollbar relative">
                <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8">
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-[90px] rounded-xl bg-foreground/5" />
                            ))}
                        </div>
                    ) : (
                        <MediaStatsBar<FilterKey>
                            counts={counts}
                            active={filtro}
                            onChange={(f) => {
                                setFiltro(f)
                                if (f !== "colecoes") setSelectedColecao(null)
                            }}
                            options={FILTERS}
                        />
                    )}

                    {/* Barra de busca + sort / ações de coleção */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {!isColecaoView ? (
                            <>
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                                    <input
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                        placeholder="Buscar nos seus jogos..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-card-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
                                    />
                                </div>

                                <div className="flex items-center gap-2 sm:gap-3">
                                    <SortDropdown value={sortOrder} onChange={setSortOrder} />
                                    <button
                                        onClick={() => setModalOpen(true)}
                                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span className="hidden sm:inline">Adicionar Jogo</span>
                                        <span className="sm:hidden">Adicionar</span>
                                    </button>
                                </div>
                            </>
                        ) : !selectedColecao ? (
                            <>
                                <div />
                                <button
                                    onClick={() => {
                                        setColecaoModalMode({ mode: "create", tipo: "jogos" })
                                        setColecaoModalOpen(true)
                                    }}
                                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="hidden sm:inline">Nova Coleção</span>
                                    <span className="sm:hidden">Nova</span>
                                </button>
                            </>
                        ) : null}
                    </div>

                    {/* Conteúdo principal */}
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                            {[...Array(12)].map((_, i) => (
                                <Skeleton key={i} className="aspect-3/4 rounded-xl bg-foreground/5" />
                            ))}
                        </div>
                    ) : isColecaoView ? (
                        // == View de Coleções ==
                        selectedColecao ? (
                            <ColecaoDetailView
                                colecao={selectedColecao}
                                items={colecaoItems}
                                fallbackIcon="🎮"
                                onBack={() => setSelectedColecao(null)}
                                onItemClick={(id) => {
                                    const jogo = jogos.find(j => j.id === id)
                                    if (jogo) setSelectedJogo(jogo)
                                }}
                                onAddItems={() => {
                                    setColecaoModalMode({ mode: "edit", colecao: selectedColecao })
                                    setColecaoModalOpen(true)
                                }}
                            />
                        ) : colecoes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card-background/50">
                                <span className="text-6xl mb-4 opacity-50">📁</span>
                                <h3 className="text-lg font-bold text-foreground mb-2">Nenhuma coleção criada</h3>
                                <p className="text-sm text-muted max-w-sm mb-6">
                                    Crie coleções para organizar seus jogos por franquia, gênero ou qualquer critério que desejar!
                                </p>
                                <button
                                    onClick={() => {
                                        setColecaoModalMode({ mode: "create", tipo: "jogos" })
                                        setColecaoModalOpen(true)
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Criar primeira coleção
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                                {colecoes.map(colecao => (
                                    <ColecaoCard
                                        key={colecao.id}
                                        colecao={colecao}
                                        onClick={() => setSelectedColecao(colecao)}
                                        onEdit={() => {
                                            setColecaoModalMode({ mode: "edit", colecao })
                                            setColecaoModalOpen(true)
                                        }}
                                        onDelete={() => deleteColecao(colecao.id)}
                                    />
                                ))}
                            </div>
                        )
                    ) : filtrados.length > 0 ? (
                        // == View normal de jogos ==
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
                            <h3 className="text-lg font-bold text-foreground mb-2">
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

            {/* Modal de adição */}
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
                        categoria: g.genres?.[0]?.name ?? "Outros",
                        anoLancamento: g.released ? new Date(g.released).getFullYear() : null,
                    }))
                }}
                onSave={handleAdd}
            />

            {/* Modal de detalhes */}
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
                colecoes={colecoes}
                onAddToColecao={handleAddToColecao}
                onRemoveFromColecao={handleRemoveFromColecao}
                onCreateColecao={() => {
                    setColecaoModalMode({ mode: "create", tipo: "jogos" })
                    setColecaoModalOpen(true)
                }}
                onClose={() => setSelectedJogo(null)}
                onDelete={deleteItem}
                onUpdate={handleUpdate}
            />

            {/* Modal de coleção */}
            <ColecaoModal
                open={colecaoModalOpen}
                config={colecaoModalMode}
                availableItems={availableItems}
                onClose={() => setColecaoModalOpen(false)}
                onCreate={async (nome) => {
                    await createColecao(nome)
                }}
                onUpdate={async (id, nome, itemIds, capaUrl) => {
                    await updateColecaoData({ id, data: { nome, itemIds, capaUrl } })
                    // Actualizar selectedColecao se for a que esta sendo editada
                    if (selectedColecao?.id === id) {
                        setSelectedColecao(prev => prev ? { ...prev, nome, itemIds, capaUrl } : null)
                    }
                }}
            />
        </div>
    )
}
