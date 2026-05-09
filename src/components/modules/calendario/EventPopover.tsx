"use client"

import { cn } from "@/lib/utils"
import { useCalendarStore } from "@/hooks/useCalendarStore"
import { formatTime } from "@/lib/utils/calendar"
import type { CalendarEvent } from "@/types/calendario"
import { AnimatePresence, motion } from "framer-motion"
import { X, Pencil, Trash2, ExternalLink, Clock, Tag } from "lucide-react"

type Props = {
    event: CalendarEvent | null
    onClose: () => void
    onEdit: (event: CalendarEvent) => void
    onDuplicate: (event: CalendarEvent) => void
    onDelete: (eventId: string) => void
}

export function EventPopover({ event, onClose, onEdit, onDelete }: Props) {
    const { categories } = useCalendarStore()

    if (!event) return null
    const cat = categories.find(c => c.id === event.categoryId)
    const color = cat?.color || "#6366f1"

    return (
        <AnimatePresence>
            {event && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="relative w-full max-w-sm rounded-2xl border border-border bg-card-background shadow-xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                        {/* Color top bar */}
                        <div className="h-1.5" style={{ backgroundColor: color }} />

                        {/* Header */}
                        <div className="flex items-start justify-between px-5 pt-4 pb-2">
                            <div className="flex-1 min-w-0 pr-3">
                                <h3 className="text-sm font-semibold text-foreground truncate">
                                    {event.title}
                                </h3>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="flex items-center gap-1 text-xs text-muted">
                                        <Clock className="w-3 h-3" />
                                        {formatTime(event.start)} – {formatTime(event.end)}
                                    </span>
                                    {cat && (
                                        <span className="flex items-center gap-1 text-xs text-muted">
                                            <Tag className="w-3 h-3" />
                                            {cat.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-6 h-6 rounded-md flex items-center justify-center text-muted hover:text-foreground hover:bg-foreground/5 transition-colors shrink-0"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-5 pb-4 space-y-3">
                            {event.description && (
                                <div className="text-xs text-muted leading-relaxed bg-foreground/3 rounded-lg px-3 py-2.5 border border-border/50 whitespace-pre-wrap">
                                    {event.description}
                                </div>
                            )}

                            {event.linkUrl && (
                                <a
                                    href={event.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    {event.linkUrl.length > 45
                                        ? event.linkUrl.slice(0, 45) + "..."
                                        : event.linkUrl}
                                </a>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-4 border-t border-border">
                                <button
                                    onClick={() => onEdit(event)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                        "text-foreground bg-foreground/5 hover:bg-foreground/10"
                                    )}
                                >
                                    <Pencil className="w-3 h-3" /> Editar
                                </button>
                                <button
                                    onClick={() => onDelete(event.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ml-auto",
                                        "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                                    )}
                                >
                                    <Trash2 className="w-3 h-3" /> Excluir
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
