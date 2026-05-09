"use client"

import { useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { useCalendarStore } from "@/hooks/useCalendarStore"
import {
    getMonthDays,
    getWeekDays,
    isToday,
    formatDateISO,
    formatTime,
    HOURS,
    WEEK_DAY_NAMES,
    getHourFromDatetime,
    getMinuteFromDatetime,
    getDurationMinutes,
    isEventVisibleOnDay,
} from "@/lib/utils/calendar"
import type { CalendarEvent } from "@/types/calendario"
import { AnimatePresence, motion } from "framer-motion"

type Props = {
    onEventClick: (event: CalendarEvent) => void
    onSlotDoubleClick: (datetime: string) => void
}

export function CalendarGrid({ onEventClick, onSlotDoubleClick }: Props) {
    const { viewMode, currentDate, events, categories, categoryFilter } = useCalendarStore()

    const visibleEvents = events.filter(
        e => !categoryFilter.includes(e.categoryId)
    )

    if (viewMode === "month") {
        return (
            <MonthView
                currentDate={currentDate}
                events={visibleEvents}
                categories={categories}
                onEventClick={onEventClick}
                onSlotDoubleClick={onSlotDoubleClick}
            />
        )
    }

    if (viewMode === "day") {
        return (
            <DayView
                currentDate={currentDate}
                events={visibleEvents}
                categories={categories}
                onEventClick={onEventClick}
                onSlotDoubleClick={onSlotDoubleClick}
            />
        )
    }

    return (
        <WeekView
            currentDate={currentDate}
            events={visibleEvents}
            categories={categories}
            onEventClick={onEventClick}
            onSlotDoubleClick={onSlotDoubleClick}
        />
    )
}

// ═══════════════════════════════════════════════
// MONTH VIEW
// ═══════════════════════════════════════════════
function MonthView({
    currentDate,
    events,
    categories,
    onEventClick,
    onSlotDoubleClick,
}: {
    currentDate: Date
    events: CalendarEvent[]
    categories: { id: string; color: string }[]
    onEventClick: (e: CalendarEvent) => void
    onSlotDoubleClick: (dt: string) => void
}) {
    const days = getMonthDays(currentDate)
    const month = currentDate.getMonth()

    return (
        <div className="rounded-xl border border-border bg-card-background overflow-hidden">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-border">
                {WEEK_DAY_NAMES.map(d => (
                    <div key={d} className="text-center text-[11px] font-semibold text-muted uppercase tracking-wider py-2.5">
                        {d}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7">
                {days.map((day, i) => {
                    const iso = formatDateISO(day)
                    const dayEvents = events.filter(e => isEventVisibleOnDay(e, iso))
                    const isCurrentMonth = day.getMonth() === month
                    const today = isToday(day)

                    return (
                        <div
                            key={i}
                            className={cn(
                                "min-h-[90px] border-b border-r border-border/50 p-1.5 transition-colors cursor-pointer hover:bg-foreground/2",
                                !isCurrentMonth && "opacity-40",
                                i % 7 === 6 && "border-r-0"
                            )}
                            onDoubleClick={() => onSlotDoubleClick(`${iso}T09:00`)}
                        >
                            <span className={cn(
                                "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1",
                                today
                                    ? "bg-primary text-white"
                                    : "text-foreground"
                            )}>
                                {day.getDate()}
                            </span>

                            <div className="space-y-0.5">
                                <AnimatePresence>
                                    {dayEvents.slice(0, 3).map(ev => {
                                        const cat = categories.find(c => c.id === ev.categoryId)
                                        return (
                                            <motion.div
                                                key={ev.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                onClick={(e) => { e.stopPropagation(); onEventClick(ev) }}
                                                className={cn(
                                                    "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] truncate cursor-pointer transition-all",
                                                    ev.allDay
                                                        ? "text-white font-medium shadow-sm"
                                                        : "hover:ring-1 hover:ring-white/20"
                                                )}
                                                style={{
                                                    backgroundColor: ev.allDay
                                                        ? (cat?.color || "#6366f1")
                                                        : (cat?.color || "#6366f1") + "25"
                                                }}
                                            >
                                                {!ev.allDay && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cat?.color || "#6366f1" }} />}
                                                <span className={cn("truncate", ev.allDay ? "text-white" : "text-foreground")}>{ev.title}</span>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                                {dayEvents.length > 3 && (
                                    <p className="text-[10px] text-muted px-1.5">+{dayEvents.length - 3} mais</p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════
// WEEK VIEW
// ═══════════════════════════════════════════════
function WeekView({
    currentDate,
    events,
    categories,
    onEventClick,
    onSlotDoubleClick,
}: {
    currentDate: Date
    events: CalendarEvent[]
    categories: { id: string; color: string }[]
    onEventClick: (e: CalendarEvent) => void
    onSlotDoubleClick: (dt: string) => void
}) {
    const days = getWeekDays(currentDate)
    const scrollRef = useRef<HTMLDivElement>(null)

    const handleDrop = useCallback(
        (dayIndex: number, hour: number) => {
            const day = days[dayIndex]
            const iso = formatDateISO(day)
            const hh = String(hour).padStart(2, "0")
            return `${iso}T${hh}:00`
        },
        [days]
    )

    return (
        <div className="rounded-xl border border-border bg-card-background overflow-hidden">
            {/* Scrollable Container */}
            <div ref={scrollRef} className="max-h-[600px] overflow-y-auto relative custom-scrollbar">
                {/* Sticky Day headers */}
                <div className="sticky top-0 z-30 grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-[#121214]">
                    <div className="bg-[#121214]" />
                    {days.map((day, i) => {
                        const iso = formatDateISO(day)
                        const allDayEvents = events.filter(e => e.allDay && isEventVisibleOnDay(e, iso))

                        return (
                            <div
                                key={i}
                                className={cn(
                                    "flex flex-col border-l border-border/50",
                                    isToday(day) && "bg-primary/5"
                                )}
                            >
                                <div className="text-center py-2.5">
                                    <p className="text-[11px] font-semibold text-muted uppercase">{WEEK_DAY_NAMES[i]}</p>
                                    <p className={cn(
                                        "text-lg font-bold mt-0.5",
                                        isToday(day) ? "text-primary" : "text-foreground"
                                    )}>
                                        {day.getDate()}
                                    </p>
                                </div>

                                {/* All day events area */}
                                {allDayEvents.length > 0 && (
                                    <div className="px-1 pb-1 space-y-1">
                                        {allDayEvents.map(ev => (
                                            <div
                                                key={ev.id}
                                                onClick={() => onEventClick(ev)}
                                                className="px-1.5 py-0.5 rounded bg-primary text-[10px] text-white font-medium truncate cursor-pointer hover:opacity-90"
                                            >
                                                {ev.title}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Time grid */}
                <div className="grid grid-cols-[60px_repeat(7,1fr)]">
                    {HOURS.map(hour => (
                        <div key={hour} className="contents">
                            <div className="h-14 flex items-start justify-end pr-2 pt-0 border-r border-border/50">
                                <span className="text-[10px] text-muted font-mono -mt-1.5">
                                    {hour === 0 ? "" : `${String(hour).padStart(2, "0")}:00`}
                                </span>
                            </div>

                            {days.map((day, di) => {
                                const iso = formatDateISO(day)
                                const cellEvents = events.filter(e => {
                                    if (e.allDay) return false
                                    if (!isEventVisibleOnDay(e, iso)) return false

                                    const startIso = e.start.split("T")[0]
                                    // For recurring events, we use the original start hour. 
                                    // For long events (not allDay), the second day+ starts at 0
                                    const startH = (e.repeat !== "never" || iso === startIso)
                                        ? getHourFromDatetime(e.start)
                                        : 0
                                    return startH === hour
                                })

                                return (
                                    <div
                                        key={di}
                                        className={cn(
                                            "h-14 border-l border-b border-border/30 relative transition-colors hover:bg-foreground/1.5",
                                            isToday(day) && "bg-primary/2"
                                        )}
                                        onDoubleClick={() => onSlotDoubleClick(handleDrop(di, hour))}
                                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy" }}
                                        onDrop={(e) => {
                                            e.preventDefault()
                                            const raw = e.dataTransfer.getData("text/plain")
                                            try {
                                                const data = JSON.parse(raw)
                                                const dt = handleDrop(di, hour)
                                                if (data.type === "panel-item") {
                                                    window.dispatchEvent(new CustomEvent("calendar-drop-panel-item", {
                                                        detail: { ...data, datetime: dt }
                                                    }))
                                                } else if (data.type === "calendar-event") {
                                                    window.dispatchEvent(new CustomEvent("calendar-move-event", {
                                                        detail: { id: data.id, newStart: dt }
                                                    }))
                                                }
                                            } catch { /* ignore */ }
                                        }}
                                    >
                                        {cellEvents.map(ev => {
                                            const cat = categories.find(c => c.id === ev.categoryId)
                                            const color = cat?.color || "#6366f1"

                                            const startIso = ev.start.split("T")[0]
                                            const endIso = ev.end.split("T")[0]

                                            // For recurring events, we treat every occurrence as a start/end day to preserve time
                                            const isStartDay = ev.repeat !== "never" || iso === startIso
                                            const isEndDay = ev.repeat !== "never" || iso === endIso

                                            const startMin = isStartDay ? getMinuteFromDatetime(ev.start) : 0
                                            const startHour = isStartDay ? getHourFromDatetime(ev.start) : 0

                                            // Duration calculation for THIS day
                                            let dayDurationMinutes = 1440 // Full day
                                            if (isStartDay && isEndDay) {
                                                dayDurationMinutes = getDurationMinutes(ev.start, ev.end)
                                            } else if (isStartDay) {
                                                dayDurationMinutes = 1440 - (startHour * 60 + startMin)
                                            } else if (isEndDay) {
                                                dayDurationMinutes = getHourFromDatetime(ev.end) * 60 + getMinuteFromDatetime(ev.end)
                                            }

                                            const topPx = (startMin / 60) * 56
                                            const heightPx = Math.max(22, (dayDurationMinutes / 60) * 56)

                                            return (
                                                <motion.div
                                                    key={ev.id}
                                                    layout
                                                    initial={{ opacity: 0, x: -4 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="absolute left-0.5 right-0.5 z-10 rounded-md px-2 py-1 cursor-pointer group/ev"
                                                    style={{
                                                        top: topPx,
                                                        height: heightPx,
                                                        backgroundColor: color + "20",
                                                        borderLeft: `3px solid ${color}`,
                                                    }}
                                                    onClick={(e) => { e.stopPropagation(); onEventClick(ev) }}
                                                    draggable
                                                    onDragStart={(e) => {
                                                        const de = e as unknown as DragEvent
                                                        de.dataTransfer?.setData("text/plain", JSON.stringify({ type: "calendar-event", id: ev.id }))
                                                    }}
                                                >
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-[10px] font-bold text-foreground truncate leading-tight">{ev.title}</p>
                                                        {heightPx >= 35 && (
                                                            <p className="text-[9px] text-muted font-medium opacity-80">{formatTime(ev.start)}</p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════
// DAY VIEW
// ═══════════════════════════════════════════════
function DayView({
    currentDate,
    events,
    categories,
    onEventClick,
    onSlotDoubleClick,
}: {
    currentDate: Date
    events: CalendarEvent[]
    categories: { id: string; color: string }[]
    onEventClick: (e: CalendarEvent) => void
    onSlotDoubleClick: (dt: string) => void
}) {
    const iso = formatDateISO(currentDate)
    const dayEvents = events.filter(e => isEventVisibleOnDay(e, iso))
    const allDayEvents = dayEvents.filter(e => e.allDay)

    return (
        <div className="rounded-xl border border-border bg-card-background overflow-hidden">
            {/* Header */}
            <div className={cn("text-center py-3 border-b border-border", isToday(currentDate) && "bg-primary/5")}>
                <p className="text-[11px] font-semibold text-muted uppercase">{WEEK_DAY_NAMES[currentDate.getDay()]}</p>
                <p className={cn("text-2xl font-bold mt-0.5", isToday(currentDate) ? "text-primary" : "text-foreground")}>
                    {currentDate.getDate()}
                </p>
            </div>

            {/* All Day Events Area */}
            {allDayEvents.length > 0 && (
                <div className="px-4 py-2 border-b border-border space-y-1 bg-foreground/2">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-tighter mb-1">Dia Inteiro</p>
                    {allDayEvents.map(ev => (
                        <div
                            key={ev.id}
                            onClick={() => onEventClick(ev)}
                            className="px-3 py-1.5 rounded-lg bg-primary text-xs text-white font-medium cursor-pointer hover:opacity-90 shadow-sm"
                        >
                            {ev.title}
                        </div>
                    ))}
                </div>
            )}

            {/* Time grid */}
            <div className="max-h-[500px] overflow-y-auto">
                <div className="grid grid-cols-[60px_1fr] relative">
                    {HOURS.map(hour => {
                        const cellEvents = dayEvents.filter(e => !e.allDay && getHourFromDatetime(e.start) === hour)

                        return (
                            <div key={hour} className="contents">
                                <div className="h-16 flex items-start justify-end pr-2 border-r border-border/50">
                                    <span className="text-[10px] text-muted font-mono -mt-1.5">
                                        {hour === 0 ? "" : `${String(hour).padStart(2, "0")}:00`}
                                    </span>
                                </div>
                                <div
                                    className="h-16 border-b border-border/30 relative transition-colors hover:bg-foreground/1.5"
                                    onDoubleClick={() => onSlotDoubleClick(`${iso}T${String(hour).padStart(2, "0")}:00`)}
                                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy" }}
                                    onDrop={(e) => {
                                        e.preventDefault()
                                        const raw = e.dataTransfer.getData("text/plain")
                                        try {
                                            const data = JSON.parse(raw)
                                            const dt = `${iso}T${String(hour).padStart(2, "0")}:00`
                                            if (data.type === "panel-item") {
                                                window.dispatchEvent(new CustomEvent("calendar-drop-panel-item", {
                                                    detail: { ...data, datetime: dt }
                                                }))
                                            } else if (data.type === "calendar-event") {
                                                window.dispatchEvent(new CustomEvent("calendar-move-event", {
                                                    detail: { id: data.id, newStart: dt }
                                                }))
                                            }
                                        } catch { /* ignore */ }
                                    }}
                                >
                                    {cellEvents.map(ev => {
                                        const cat = categories.find(c => c.id === ev.categoryId)
                                        const color = cat?.color || "#6366f1"
                                        const min = getMinuteFromDatetime(ev.start)
                                        const dur = getDurationMinutes(ev.start, ev.end)
                                        const topPx = (min / 60) * 64
                                        const heightPx = Math.max(24, (dur / 60) * 64)

                                        return (
                                            <motion.div
                                                key={ev.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="absolute left-1 right-1 z-10 rounded-lg px-2.5 py-1.5 cursor-pointer group/ev"
                                                style={{
                                                    top: topPx,
                                                    height: heightPx,
                                                    backgroundColor: color + "20",
                                                    borderLeft: `3px solid ${color}`,
                                                }}
                                                onClick={(e) => { e.stopPropagation(); onEventClick(ev) }}
                                                draggable
                                                onDragStart={(e) => {
                                                    const de = e as unknown as DragEvent
                                                    de.dataTransfer?.setData("text/plain", JSON.stringify({ type: "calendar-event", id: ev.id }))
                                                }}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-sm font-bold text-foreground truncate">{ev.title}</p>
                                                    {heightPx >= 45 && (
                                                        <p className="text-[10px] text-muted font-medium bg-foreground/5 w-fit px-1.5 py-0.5 rounded">
                                                            {formatTime(ev.start)} – {formatTime(ev.end)}
                                                        </p>
                                                    )}
                                                    {heightPx >= 85 && ev.description && (
                                                        <p className="text-[11px] text-muted leading-relaxed mt-0.5 whitespace-pre-wrap">
                                                            {ev.description.length > 300 ? ev.description.slice(0, 300) + "..." : ev.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                    <div className="bg-transparent h-4" /> {/* Spacer */}
                </div>
            </div>
        </div>
    )
}


