"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useToastContext } from "@/app/(hub)/layout"
import { Header } from "@/components/layout/Header"
import { Skeleton } from "@/components/ui/skeleton"
import { useCalendarStore } from "@/hooks/useCalendarStore"
import { CalendarGrid } from "@/components/modules/calendario/CalendarGrid"
import { CategoryFilter } from "@/components/modules/calendario/CategoryFilter"
import { EventModal } from "@/components/modules/calendario/EventModal"
import { EventPopover } from "@/components/modules/calendario/EventPopover"
import { WeeklyPanel } from "@/components/modules/calendario/WeeklyPanel"
import {
    formatMonthYear,
    formatWeekRange,
    formatDayFull,
} from "@/lib/utils/calendar"
import type { CalendarEvent } from "@/types/calendario"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const VIEW_OPTIONS = [
    { id: "month" as const, label: "Mês" },
    { id: "week" as const, label: "Semana" },
    { id: "day" as const, label: "Dia" },
]

export default function CalendarioPage() {
    const { user } = useAuth()
    const toast = useToastContext()

    const {
        loading,
        viewMode,
        setViewMode,
        currentDate,
        navigateForward,
        navigateBackward,
        goToToday,
        modalOpen,
        setModalOpen,
        editingEvent,
        setEditingEvent,
        selectedEvent,
        setSelectedEvent,
        loadData,
        addEvent,
        updateEvent,
        deleteEvent,
        duplicateEvent,
        moveEvent,
        markTaskScheduled,
        categories,
    } = useCalendarStore()

    const [defaultStart, setDefaultStart] = useState<string | undefined>()

    // ── Load data ──
    useEffect(() => {
        if (user?.uid) {
            loadData(user.uid)
        }
    }, [user?.uid, loadData])

    // ── Listen for panel drops ──
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail
            console.log("📅 Drop detected in page.tsx:", detail)
            if (!user?.uid || !detail) return

            try {
                const endDate = new Date(detail.datetime)
                endDate.setHours(endDate.getHours() + 1)
                const y = endDate.getFullYear()
                const m = String(endDate.getMonth() + 1).padStart(2, "0")
                const d = String(endDate.getDate()).padStart(2, "0")
                const hh = String(endDate.getHours()).padStart(2, "0")
                const mm = String(endDate.getMinutes()).padStart(2, "0")
                const endStr = `${y}-${m}-${d}T${hh}:${mm}`

                // Pick a category based on source
                let categoryId = categories[0]?.id || "trabalho"
                if (detail.categoryId) categoryId = detail.categoryId

                const newEvent: CalendarEvent = {
                    id: crypto.randomUUID(),
                    userId: user.uid,
                    title: detail.title || "Sem título",
                    start: detail.datetime,
                    end: endStr,
                    allDay: false,
                    repeat: "never",
                    categoryId,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                }

                addEvent(user.uid, newEvent).then(({ error }: { error: string | null }) => {
                    if (error) {
                        toast.error(error)
                    } else {
                        toast.success("Evento criado a partir do painel!")
                        // Mark task as scheduled if from tasks tab
                        if (detail.source === "tarefas" && detail.id) {
                            markTaskScheduled(detail.id)
                        }
                    }
                })
            } catch (err) {
                console.error("❌ Error handling calendar drop:", err)
            }
        }

        const moveHandler = (e: Event) => {
            const detail = (e as CustomEvent).detail
            if (!user?.uid || !detail.id || !detail.newStart) return

            const event = useCalendarStore.getState().events.find(ev => ev.id === detail.id)
            if (!event) return

            // Calcula a duração original para manter ao mover
            const start = new Date(event.start).getTime()
            const end = new Date(event.end).getTime()
            const duration = end - start

            const newStart = new Date(detail.newStart).getTime()
            const newEnd = new Date(newStart + duration).toISOString().split(".")[0].slice(0, 16)

            moveEvent(user.uid, detail.id, detail.newStart, newEnd).then(({ error }: { error: string | null }) => {
                if (error) toast.error(error)
                else toast.success("Evento movido!")
            })
        }

        const resizeHandler = (e: Event) => {
            const detail = (e as CustomEvent).detail
            if (!user?.uid || !detail.id || !detail.newEnd) return

            const event = useCalendarStore.getState().events.find(ev => ev.id === detail.id)
            if (!event) return

            const updated: CalendarEvent = { ...event, end: detail.newEnd, updatedAt: Date.now() }
            updateEvent(user.uid, updated)
            // Não exibimos toast para resize para não poluir, já que é um drag contínuo
        }

        window.addEventListener("calendar-drop-panel-item", handler)
        window.addEventListener("calendar-move-event", moveHandler)
        window.addEventListener("calendar-resize-event", resizeHandler)
        return () => {
            window.removeEventListener("calendar-drop-panel-item", handler)
            window.removeEventListener("calendar-move-event", moveHandler)
            window.removeEventListener("calendar-resize-event", resizeHandler)
        }
    }, [user?.uid, addEvent, moveEvent, updateEvent, toast, markTaskScheduled, categories])

    // ── Handlers ──
    const handleEventClick = useCallback((event: CalendarEvent) => {
        setSelectedEvent(event)
    }, [setSelectedEvent])

    const handleSlotDoubleClick = useCallback((datetime: string) => {
        setEditingEvent(null)
        setDefaultStart(datetime)
        setModalOpen(true)
    }, [setEditingEvent, setModalOpen])

    const handleSave = async (data: Omit<CalendarEvent, "id" | "userId" | "createdAt" | "updatedAt">) => {
        if (!user?.uid) return

        if (editingEvent) {
            const updated: CalendarEvent = {
                ...editingEvent,
                ...data,
                updatedAt: Date.now(),
            }
            const { error } = await updateEvent(user.uid, updated)
            if (error) toast.error(error)
            else toast.success("Evento atualizado!")
        } else {
            const newEvent: CalendarEvent = {
                id: crypto.randomUUID(),
                userId: user.uid,
                ...data,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }
            const { error } = await addEvent(user.uid, newEvent)
            if (error) toast.error(error)
            else toast.success("Evento criado!")
        }

        setEditingEvent(null)
        setDefaultStart(undefined)
    }

    const handleEdit = (event: CalendarEvent) => {
        setSelectedEvent(null)
        setEditingEvent(event)
        setModalOpen(true)
    }

    const handleDuplicate = async (event: CalendarEvent) => {
        if (!user?.uid) return
        setSelectedEvent(null)
        const { error } = await duplicateEvent(user.uid, event)
        if (error) toast.error(error)
        else toast.success("Evento duplicado!")
    }

    const handleDelete = async (eventId: string) => {
        if (!user?.uid) return
        setSelectedEvent(null)
        const { error } = await deleteEvent(user.uid, eventId)
        if (error) toast.error(error)
        else toast.success("Evento excluído.")
    }

    // ── Title ──
    const periodTitle =
        viewMode === "month"
            ? formatMonthYear(currentDate)
            : viewMode === "week"
                ? formatWeekRange(currentDate)
                : formatDayFull(currentDate)

    return (
        <div>
            <Header title="Calendário" />

            <div className="p-6 space-y-5">

                {/* ── TOOLBAR ── */}
                <div className="flex items-center justify-between gap-4 flex-wrap">

                    {/* Left: View toggle + Navigation */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* View mode */}
                        <div className="flex items-center bg-foreground/5 rounded-lg p-0.5">
                            {VIEW_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setViewMode(opt.id)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                        viewMode === opt.id
                                            ? "bg-primary text-white shadow-sm"
                                            : "text-muted hover:text-foreground"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={navigateBackward}
                                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={goToToday}
                                className="px-3 py-1 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
                            >
                                Hoje
                            </button>
                            <button
                                onClick={navigateForward}
                                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Period title */}
                        {viewMode !== "week" && (
                            <motion.h2
                                key={periodTitle}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm font-semibold text-foreground capitalize"
                            >
                                {periodTitle}
                            </motion.h2>
                        )}
                    </div>

                    {/* Right: Filters + New Event */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <CategoryFilter />
                        <button
                            onClick={() => {
                                setEditingEvent(null)
                                setDefaultStart(undefined)
                                setModalOpen(true)
                            }}
                            className="flex items-center gap-2 px-4 h-9 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-80 transition-opacity shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Evento
                        </button>
                    </div>
                </div>

                {/* ── CALENDAR GRID ── */}
                {loading ? (
                    <Skeleton className="h-[500px] rounded-xl" />
                ) : (
                    <CalendarGrid
                        onEventClick={handleEventClick}
                        onSlotDoubleClick={handleSlotDoubleClick}
                    />
                )}

                {/* ── WEEKLY PANEL ── */}
                {loading ? (
                    <Skeleton className="h-[200px] rounded-xl" />
                ) : (
                    <WeeklyPanel />
                )}
            </div>

            {/* ── MODALS ── */}
            <EventModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false)
                    setEditingEvent(null)
                    setDefaultStart(undefined)
                }}
                onSave={handleSave}
                editingEvent={editingEvent}
                defaultStart={defaultStart}
            />

            <EventPopover
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
            />
        </div>
    )
}
