"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Plus, Notebook, FileText, Trash2, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Notebook as NotebookType, Note } from "@/types/anotacao"

type Props = {
    notebooks: NotebookType[]
    notes: Note[]
    selectedNoteId: string | null
    onSelectNote: (note: Note) => void
    onNewNote: (notebookId: string) => void
    onNewNotebook: () => void
    onDeleteNote: (noteId: string) => void
    onDeleteNotebook: (notebookId: string) => void
}

export function NotebookList({
    notebooks,
    notes,
    selectedNoteId,
    onSelectNote,
    onNewNote,
    onNewNotebook,
    onDeleteNote,
    onDeleteNotebook,
}: Props) {
    const [search, setSearch] = useState("")
    const [openNotebooks, setOpenNotebooks] = useState<string[]>([])
    const [hoveredNote, setHoveredNote] = useState<string | null>(null)
    const [hoveredNotebook, setHoveredNotebook] = useState<string | null>(null)

    const toggleNotebook = (id: string) => {
        setOpenNotebooks(prev =>
            prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
        )
    }

    const handleNewNoteClick = (notebookId: string) => {
        setOpenNotebooks(prev => prev.includes(notebookId) ? prev : [...prev, notebookId])
        onNewNote(notebookId)
    }

    const filteredNotes = (notebookId: string) =>
        notes.filter(
            n =>
                n.notebookId === notebookId &&
                (search === "" ||
                    n.titulo.toLowerCase().includes(search.toLowerCase()) ||
                    n.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
        )

    const allFilteredNotes = search
        ? notes.filter(
            n =>
                n.titulo.toLowerCase().includes(search.toLowerCase()) ||
                n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
        )
        : null

    function formatRelativeDate(ts: number): string {
        const now = Date.now()
        const diff = now - ts
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return "Agora"
        if (minutes < 60) return `${minutes}min atrás`
        if (hours < 24) return `${hours}h atrás`
        if (days === 1) return "Ontem"
        return `${days} dias atrás`
    }

    return (
        <div className="flex flex-col h-full">
            {/* Busca */}
            <div className="px-6 pt-6 pb-3 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted/70" />
                    <input
                        type="text"
                        placeholder="Buscar notas..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-transparent pl-7 pr-3 py-1 text-sm text-foreground placeholder-muted/50 focus:outline-none transition-colors font-medium"
                    />
                </div>
            </div>

            {/* Lista de cadernos */}
            <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
                {search && allFilteredNotes ? (
                    // Resultados da busca
                    <div className="px-2">
                        <p className="text-[10px] text-muted uppercase tracking-wider px-2 py-1.5 font-semibold">
                            {allFilteredNotes.length} resultado{allFilteredNotes.length !== 1 ? "s" : ""}
                        </p>
                        {allFilteredNotes.map(note => (
                            <NoteItem
                                key={note.id}
                                note={note}
                                isSelected={selectedNoteId === note.id}
                                isHovered={hoveredNote === note.id}
                                onSelect={() => onSelectNote(note)}
                                onDelete={() => onDeleteNote(note.id)}
                                onHover={setHoveredNote}
                                formatDate={formatRelativeDate}
                                notebooks={notebooks}
                                showNotebook
                            />
                        ))}
                    </div>
                ) : (
                    notebooks.map(nb => {
                        const isOpen = openNotebooks.includes(nb.id)
                        const nbNotes = filteredNotes(nb.id)

                        return (
                            <div key={nb.id}>
                                {/* Cabeçalho do caderno */}
                                <div
                                    className="group flex items-center gap-1 mx-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-foreground/5 transition-colors"
                                    onMouseEnter={() => setHoveredNotebook(nb.id)}
                                    onMouseLeave={() => setHoveredNotebook(null)}
                                >
                                    <button
                                        onClick={() => toggleNotebook(nb.id)}
                                        className="flex items-center gap-1.5 flex-1 min-w-0"
                                    >
                                        {isOpen ? (
                                            <ChevronDown className="w-3 h-3 text-muted shrink-0" />
                                        ) : (
                                            <ChevronRight className="w-3 h-3 text-muted shrink-0" />
                                        )}
                                        <span className="text-base leading-none">{nb.emoji}</span>
                                        <span
                                            className="text-xs font-semibold truncate"
                                            style={{ color: nb.cor }}
                                        >
                                            {nb.nome}
                                        </span>
                                        <span className="text-[10px] text-muted ml-auto shrink-0">
                                            {notes.filter(n => n.notebookId === nb.id).length}
                                        </span>
                                    </button>

                                    {/* Ações */}
                                    <div className={cn(
                                        "flex items-center gap-0.5 transition-opacity",
                                        hoveredNotebook === nb.id ? "opacity-100" : "opacity-0"
                                    )}>
                                        <button
                                            onClick={() => handleNewNoteClick(nb.id)}
                                            className="p-1 rounded hover:bg-foreground/10 text-muted hover:text-foreground transition-colors"
                                            title="Nova nota"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => onDeleteNotebook(nb.id)}
                                            className="p-1 rounded hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors"
                                            title="Deletar caderno"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Notas */}
                                {isOpen && (
                                    <div className="ml-4 mb-1">
                                        {nbNotes.length === 0 ? (
                                            <div
                                                onClick={() => handleNewNoteClick(nb.id)}
                                                className="group flex items-center gap-1.5 mx-2 px-2 py-2 rounded-lg cursor-pointer text-[11px] text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Nova nota
                                            </div>
                                        ) : (
                                            nbNotes.map(note => (
                                                <NoteItem
                                                    key={note.id}
                                                    note={note}
                                                    isSelected={selectedNoteId === note.id}
                                                    isHovered={hoveredNote === note.id}
                                                    onSelect={() => onSelectNote(note)}
                                                    onDelete={() => onDeleteNote(note.id)}
                                                    onHover={setHoveredNote}
                                                    formatDate={formatRelativeDate}
                                                    notebooks={notebooks}
                                                />
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}

                {notebooks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <Notebook className="w-8 h-8 text-muted mb-3" />
                        <p className="text-xs font-medium text-foreground mb-1">Nenhum caderno</p>
                        <p className="text-[11px] text-muted">Crie um caderno para começar</p>
                    </div>
                )}
            </div>

            {/* Rodapé */}
            <div className="p-3 border-t border-border">
                <button
                    onClick={onNewNotebook}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Novo Caderno
                </button>
            </div>
        </div>
    )
}

// Sub-componente NoteItem

function NoteItem({
    note,
    isSelected,
    isHovered,
    onSelect,
    onDelete,
    onHover,
    formatDate,
    notebooks,
    showNotebook,
}: {
    note: Note
    isSelected: boolean
    isHovered: boolean
    onSelect: () => void
    onDelete: () => void
    onHover: (id: string | null) => void
    formatDate: (ts: number) => string
    notebooks: NotebookType[]
    showNotebook?: boolean
}) {
    const nb = showNotebook ? notebooks.find(n => n.id === note.notebookId) : null

    return (
        <div
            className={cn(
                "group relative flex items-start gap-2 mx-2 px-2 py-2 rounded-lg cursor-pointer transition-all",
                isSelected
                    ? "bg-primary/15 border border-primary/20"
                    : "hover:bg-foreground/5 border border-transparent"
            )}
            onClick={onSelect}
            onMouseEnter={() => onHover(note.id)}
            onMouseLeave={() => onHover(null)}
        >
            <FileText className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", isSelected ? "text-primary" : "text-muted")} />
            <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-medium truncate", isSelected ? "text-primary" : "text-foreground")}>
                    {note.titulo || "Sem título"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    {nb && (
                        <span className="text-[10px]" style={{ color: nb.cor }}>{nb.emoji}</span>
                    )}
                    <span className="text-[10px] text-muted">{formatDate(note.updatedAt)}</span>
                </div>
            </div>

            <button
                onClick={e => { e.stopPropagation(); onDelete() }}
                className={cn(
                    "shrink-0 p-0.5 rounded transition-all",
                    isHovered ? "opacity-100" : "opacity-0",
                    "hover:text-red-400 text-muted"
                )}
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    )
}
