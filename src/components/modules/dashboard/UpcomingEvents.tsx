"use client"

import { useState } from "react"
import { Calendar, Clock, Plus, Trash2 } from "lucide-react"
import type { DashboardEvent } from "@/types/dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { EventModal } from "./EventModal"
import { saveDashboardEvent, deleteDashboardEvent } from "@/lib/firebase/dashboard"
import { useToastContext } from "@/app/(hub)/layout"
import { cn } from "@/lib/utils"

type Props = {
    userId: string
    events: DashboardEvent[]
    loading: boolean
    onUpdate: () => void
}

export function UpcomingEvents({ userId, events, loading, onUpdate }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const toast = useToastContext()

    const getTagColor = (tag: string) => {
        const t = tag.toLowerCase().trim()
        if (t.includes("trab") || t.includes("work")) return "bg-blue-500/20 text-blue-400"
        if (t.includes("estud") || t.includes("estu") || t.includes("school") || t.includes("ufes")) return "bg-purple-500/20 text-purple-400"
        if (t.includes("saud") || t.includes("gym") || t.includes("acad") || t.includes("health")) return "bg-emerald-500/20 text-emerald-400"
        if (t.includes("pess") || t.includes("self")) return "bg-amber-500/20 text-amber-400"
        if (t.includes("dev") || t.includes("prog")) return "bg-indigo-500/20 text-indigo-400"

        // Default based on first letter hash
        const colors = [
            "bg-blue-500/20 text-blue-400",
            "bg-purple-500/20 text-purple-400",
            "bg-emerald-500/20 text-emerald-400",
            "bg-amber-500/20 text-amber-400",
            "bg-rose-500/20 text-rose-400",
            "bg-cyan-500/20 text-cyan-400"
        ]
        const index = t.charCodeAt(0) % colors.length
        return colors[index]
    }

    const tagSuggestions = Array.from(new Set(events.map(e => e.tag)))

    const handleSave = async (data: Omit<DashboardEvent, "id" | "userId" | "createdAt">) => {
        const newEvent: DashboardEvent = {
            id: crypto.randomUUID(),
            userId,
            ...data,
            createdAt: Date.now()
        }

        const { error } = await saveDashboardEvent(userId, newEvent)
        if (error) {
            toast.error(error)
        } else {
            toast.success("Evento adicionado!")
            onUpdate()
        }
    }

    const handleDelete = async (id: string) => {
        const { error } = await deleteDashboardEvent(userId, id)
        if (error) {
            toast.error(error)
        } else {
            toast.success("Evento removido.")
            onUpdate()
        }
    }

    // Sort events by time HH:mm
    const sortedEvents = [...events].sort((a, b) => a.time.localeCompare(b.time))

    return (
        <div className="rounded-xl border border-border bg-card-background p-5 h-[280px] flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Próximos Eventos</h3>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-1 hover:bg-white/5 rounded-md text-primary transition-colors"
                    title="Adicionar Evento"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <Skeleton className="h-4 w-[70%] rounded-md" />
                            <Skeleton className="h-4 w-12 rounded-full" />
                        </div>
                    ))
                ) : events.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border rounded-xl px-4 my-1">
                        <p className="text-xs text-muted">Nenhum evento registrado hoje.</p>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs text-primary hover:underline mt-2 flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> Adicionar evento
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedEvents.map((event) => (
                            <div key={event.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-muted">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-xs font-mono">{event.time}</span>
                                    </div>
                                    <span className="text-sm text-foreground">{event.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter",
                                        getTagColor(event.tag)
                                    )}>
                                        {event.tag}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="p-1 opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-all"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <EventModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                tagSuggestions={tagSuggestions}
            />
        </div>
    )
}
