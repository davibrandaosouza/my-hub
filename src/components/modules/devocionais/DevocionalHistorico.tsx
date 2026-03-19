"use client"

import { useState } from "react"
import { Search, BookOpen, Calendar, FileText, Pencil, Check, X as XIcon, Loader2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { saveDevocional } from "@/lib/firebase/devocionais"
import { useAuth } from "@/hooks/useAuth"
import type { Devocional } from "@/types/devocional"

type Props = {
    devocionais: Devocional[]
    onUpdated: () => void
}

export function DevocionalHistorico({ devocionais, onUpdated }: Props) {
    const { user } = useAuth()
    const [search, setSearch] = useState("")
    const [selected, setSelected] = useState<Devocional | null>(null)
    const [editing, setEditing] = useState(false)
    const [editedReflection, setEditedReflection] = useState("")
    const [saving, setSaving] = useState(false)

    const filtered = devocionais.filter(d =>
        d.reading.toLowerCase().includes(search.toLowerCase()) ||
        d.reflection.toLowerCase().includes(search.toLowerCase())
    )

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split("-")
        const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
            "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
        return `${day} ${MONTHS[parseInt(month) - 1]} ${year}`
    }

    const formatDateFull = (dateStr: string) => {
        const date = new Date(dateStr + "T12:00:00")
        return date.toLocaleDateString("pt-BR", {
            weekday: "long", day: "2-digit", month: "long", year: "numeric",
        })
    }

    const handleOpen = (d: Devocional) => {
        setSelected(d)
        setEditing(false)
        setEditedReflection(d.reflection)
    }

    const handleClose = () => {
        setSelected(null)
        setEditing(false)
        setEditedReflection("")
    }

    const handleStartEdit = () => {
        setEditedReflection(selected?.reflection ?? "")
        setEditing(true)
    }

    const handleCancelEdit = () => {
        setEditing(false)
        setEditedReflection(selected?.reflection ?? "")
    }

    const handleSave = async () => {
        if (!user || !selected) return
        setSaving(true)

        const { error } = await saveDevocional(
            user.uid,
            selected.date,
            selected.reading,
            editedReflection,
            selected.completed,
        )

        if (!error) {
            // Atualiza o objeto local para refletir na UI sem recarregar
            setSelected({ ...selected, reflection: editedReflection })
            setEditing(false)
            onUpdated()
        }

        setSaving(false)
    }

    return (
        <>
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Histórico</h3>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar devocionais..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                </div>

                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                    {filtered.length === 0 ? (
                        <p className="text-xs text-muted text-center py-8">
                            Nenhum devocional encontrado
                        </p>
                    ) : (
                        filtered.map((d) => (
                            <button
                                key={d.id}
                                onClick={() => handleOpen(d)}
                                className="w-full flex items-start justify-between gap-2 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group text-left"
                            >
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                                        {d.reading}
                                    </p>
                                    {d.reflection && (
                                        <p className="text-xs text-muted truncate mt-0.5">
                                            {d.reflection}
                                        </p>
                                    )}
                                </div>
                                <span className="text-xs text-muted shrink-0">
                                    {formatDate(d.date)}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            <Modal
                open={!!selected}
                onClose={handleClose}
                title="Devocional"
            >
                {selected && (
                    <div className="space-y-5">

                        {/* Data */}
                        <div className="flex items-center gap-2 text-muted">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs capitalize">
                                {formatDateFull(selected.date)}
                            </span>
                        </div>

                        {/* Leitura */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-medium text-muted uppercase tracking-wider">
                                    Leitura
                                </span>
                            </div>
                            <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
                                <p className="text-sm font-semibold text-white">
                                    {selected.reading}
                                </p>
                            </div>
                        </div>

                        {/* Reflexão */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-xs font-medium text-muted uppercase tracking-wider">
                                        Reflexão
                                    </span>
                                </div>

                                {/* Botões de edição */}
                                {!editing ? (
                                    <button
                                        onClick={handleStartEdit}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-muted hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <Pencil className="w-3 h-3" />
                                        Editar
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={saving}
                                            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                                        >
                                            <XIcon className="w-3 h-3" />
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-white bg-primary hover:opacity-80 transition-opacity disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Check className="w-3 h-3" />
                                            )}
                                            Salvar
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Visualização ou edição */}
                            {editing ? (
                                <textarea
                                    value={editedReflection}
                                    onChange={(e) => setEditedReflection(e.target.value)}
                                    rows={5}
                                    autoFocus
                                    className="w-full rounded-lg border border-primary bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
                                />
                            ) : selected.reflection ? (
                                <div className="rounded-lg border border-border bg-background px-4 py-3 min-h-[80px]">
                                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                        {selected.reflection}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-muted italic px-1">
                                    Nenhuma reflexão registrada.
                                </p>
                            )}
                        </div>

                    </div>
                )}
            </Modal>
        </>
    )
}