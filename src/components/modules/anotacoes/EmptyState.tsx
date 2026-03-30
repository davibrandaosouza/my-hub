"use client"

import { BookOpen, Plus } from "lucide-react"

type Props = {
    hasNotebooks: boolean
    onNewNotebook: () => void
    onNewNote?: () => void
}

export function EmptyState({ hasNotebooks, onNewNotebook, onNewNote }: Props) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                <BookOpen className="w-9 h-9 text-primary/60" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
                {hasNotebooks ? "Selecione uma nota" : "Seu espaço de ideias"}
            </h2>
            <p className="text-sm text-muted max-w-xs mb-6">
                {hasNotebooks
                    ? "Clique em uma nota na lista ou crie uma nova para começar a escrever."
                    : "Crie um caderno para organizar suas notas, ideias e blocos de código."}
            </p>
            <div className="flex gap-3">
                {!hasNotebooks && (
                    <button
                        onClick={onNewNotebook}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-4 h-4" />
                        Criar Caderno
                    </button>
                )}
                {hasNotebooks && onNewNote && (
                    <button
                        onClick={onNewNote}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Nota
                    </button>
                )}
            </div>
        </div>
    )
}
