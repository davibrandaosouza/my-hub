"use client"

import { FileEdit } from "lucide-react"
import type { Note } from "@/types/anotacao"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

type Props = {
    notes: Note[]
    loading: boolean
}

export function RecentNotes({ notes, loading }: Props) {
    const formatWhen = (timestamp: number) => {
        const now = new Date()
        const date = new Date(timestamp)
        
        // Reset times to compare dates specifically
        const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const d2 = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        
        const diffDays = Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 0) return "Hoje"
        if (diffDays === 1) return "Ontem"
        if (diffDays < 7) return `${diffDays} dias atrás`
        
        return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    }

    return (
        <div className="rounded-xl border border-border bg-card-background p-5 h-[280px] flex flex-col">
            <div className="flex items-center gap-2 mb-4 shrink-0">
                <FileEdit className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-white">Notas Recentes</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-start justify-between gap-4">
                             <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-[60%] rounded-md" />
                                <Skeleton className="h-3 w-[40%] rounded-md" />
                             </div>
                             <Skeleton className="h-3 w-10 rounded-md" />
                        </div>
                    ))
                ) : notes.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border rounded-xl px-4 my-1">
                        <p className="text-xs text-muted">Nenhuma nota encontrada.</p>
                        <Link href="/anotacoes" className="text-xs text-primary hover:underline mt-2 inline-block">
                            Criar minha primeira nota
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notes.map((note) => (
                        <Link 
                            key={note.id} 
                            href={`/anotacoes?noteId=${note.id}`}
                            className="flex items-start justify-between gap-4 group"
                        >
                            <div className="overflow-hidden flex-1">
                                <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                                    {note.titulo || "Sem Título"}
                                </p>
                                <p className="text-xs text-muted truncate mt-0.5 opacity-70">
                                    {note.content.replace(/<[^>]*>/g, '').substring(0, 40)}...
                                </p>
                            </div>
                            <span className="text-[10px] text-muted shrink-0 font-medium uppercase tracking-wider pt-1">
                                {formatWhen(note.updatedAt)}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
            </div>
        </div>
    )
}
