"use client"

import { Trash2, GripVertical, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type Props = {
    id: string
    title: string
    subtitle?: string
    color?: string
    scheduled?: boolean
    onDelete?: () => void
    dragData: Record<string, unknown>
}

export function TaskCard({ id, title, subtitle, color, scheduled, onDelete, dragData }: Props) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            draggable
            onDragStart={(e) => {
                const de = e as unknown as DragEvent
                de.dataTransfer?.setData("text/plain", JSON.stringify({
                    type: "panel-item",
                    id,
                    title,
                    ...dragData,
                }))
                de.dataTransfer!.effectAllowed = "copy"
            }}
            className={cn(
                "group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing",
                scheduled
                    ? "border-primary/20 bg-primary/5"
                    : "border-border bg-card-background hover:border-border/80 hover:bg-foreground/2"
            )}
        >
            {/* Drag handle */}
            <GripVertical className="w-3.5 h-3.5 text-muted/50 shrink-0" />

            {/* Color dot */}
            {color && (
                <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{title}</p>
                {subtitle && (
                    <p className="text-[10px] text-muted truncate">{subtitle}</p>
                )}
            </div>

            {/* Scheduled badge */}
            {scheduled && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                    <Calendar className="w-2.5 h-2.5" /> Agendado
                </span>
            )}

            {/* Delete */}
            {onDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete() }}
                    className="p-1 opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-all shrink-0"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            )}
        </motion.div>
    )
}
