"use client"

import { cn } from "@/lib/utils"
import { useCalendarStore } from "@/hooks/useCalendarStore"
import { formatTime } from "@/lib/utils/calendar"
import type { CalendarEvent } from "@/types/calendario"
import { motion } from "framer-motion"

type Props = {
    event: CalendarEvent
    style?: React.CSSProperties
    compact?: boolean
    onClick?: (e: CalendarEvent) => void
    onDragStart?: (e: CalendarEvent) => void
}

export function EventCard({ event, style, compact, onClick, onDragStart }: Props) {
    const { categories } = useCalendarStore()
    const cat = categories.find(c => c.id === event.categoryId)
    const color = cat?.color || "#6366f1"

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            draggable
            onDragStart={(e) => {
                const de = e as unknown as DragEvent
                de.dataTransfer?.setData("text/plain", JSON.stringify({ type: "calendar-event", id: event.id }))
                onDragStart?.(event)
            }}
            onClick={() => onClick?.(event)}
            style={style}
            className={cn(
                "group rounded-lg px-2.5 py-1.5 cursor-pointer transition-all hover:ring-1 hover:ring-white/20 overflow-hidden select-none",
                compact ? "text-[10px]" : "text-xs"
            )}
            title={event.title}
        >
            {/* Color accent */}
            <div
                className="absolute inset-0 opacity-20 rounded-lg"
                style={{ backgroundColor: color }}
            />
            <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
                style={{ backgroundColor: color }}
            />

            <div className="relative z-10">
                <p className="font-medium text-foreground truncate leading-tight">
                    {event.title}
                </p>
                {!compact && (
                    <p className="text-muted text-[10px] mt-0.5">
                        {formatTime(event.start)} – {formatTime(event.end)}
                    </p>
                )}
            </div>
        </motion.div>
    )
}
