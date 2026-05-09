"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, ClipboardList, ListTodo, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCalendarStore } from "@/hooks/useCalendarStore"
import { useDashboardData } from "@/hooks/useDashboardData"
import { useAuth } from "@/hooks/useAuth"
import { TaskCard } from "./TaskCard"
import { Input } from "@/components/ui/input"
import { AnimatePresence, motion } from "framer-motion"
import type { Planejamento } from "@/types/planejamento"
import { getPlanejamentos } from "@/lib/firebase/planejamentos"
import type { DashboardEvent } from "@/types/dashboard"
import type { CalendarTask } from "@/types/calendario"

const TABS = [
    { id: "eventos" as const, label: "Próximos Eventos", icon: Calendar },
    { id: "planejamentos" as const, label: "Planejamentos", icon: ClipboardList },
    { id: "tarefas" as const, label: "Tarefas", icon: ListTodo },
]

export function WeeklyPanel() {
    const { user } = useAuth()
    const { activeTab, setActiveTab, tasks, categories, addTask, deleteTask } = useCalendarStore()
    const { events: dashboardEvents, isLoading: eventsLoading } = useDashboardData(user?.uid)

    const [planejamentos, setPlanejamentos] = useState<Planejamento[]>([])
    const [planejamentosLoading, setPlanejamentosLoading] = useState(true)
    const [newTaskTitle, setNewTaskTitle] = useState("")
    const [newTaskCategoryId, setNewTaskCategoryId] = useState(categories[0]?.id || "")

    // Load planejamentos
    useEffect(() => {
        if (!user?.uid) return
        getPlanejamentos(user.uid).then((data) => {
            setPlanejamentos(data.filter(p => p.status !== "concluido"))
            setPlanejamentosLoading(false)
        })
    }, [user?.uid])

    const handleAddTask = async () => {
        if (!user?.uid || !newTaskTitle.trim()) return
        const task: CalendarTask = {
            id: crypto.randomUUID(),
            userId: user.uid,
            title: newTaskTitle.trim(),
            categoryId: newTaskCategoryId,
            scheduled: false,
            createdAt: Date.now(),
        }
        await addTask(user.uid, task)
        setNewTaskTitle("")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleAddTask()
        }
    }

    return (
        <div className="rounded-xl border border-border bg-card-background overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center border-b border-border">
                {TABS.map(tab => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "relative flex items-center gap-2 px-4 py-3 text-xs font-medium transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="tab-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                    transition={{ duration: 0.2 }}
                                />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Tab content */}
            <div className="p-4 max-h-[280px] overflow-y-auto">
                <AnimatePresence mode="wait">
                    {activeTab === "eventos" && (
                        <motion.div
                            key="eventos"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-2"
                        >
                            <EventsTab events={dashboardEvents} loading={eventsLoading} />
                        </motion.div>
                    )}

                    {activeTab === "planejamentos" && (
                        <motion.div
                            key="planejamentos"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-2"
                        >
                            <PlanejamentosTab planejamentos={planejamentos} loading={planejamentosLoading} />
                        </motion.div>
                    )}

                    {activeTab === "tarefas" && (
                        <motion.div
                            key="tarefas"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-3"
                        >
                            {/* Add task form */}
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Nova tarefa..."
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="h-9 text-xs"
                                />
                                <div className="flex items-center gap-1">
                                    {categories.slice(0, 4).map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setNewTaskCategoryId(cat.id)}
                                            className={cn(
                                                "w-5 h-5 rounded-full border-2 transition-all shrink-0",
                                                newTaskCategoryId === cat.id
                                                    ? "border-foreground/40 scale-110"
                                                    : "border-transparent opacity-50 hover:opacity-80"
                                            )}
                                            style={{ backgroundColor: cat.color }}
                                            title={cat.name}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={handleAddTask}
                                    disabled={!newTaskTitle.trim()}
                                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white hover:opacity-80 transition-opacity disabled:opacity-40 shrink-0"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Task list */}
                            <TasksTab
                                tasks={tasks}
                                categories={categories}
                                onDelete={(id) => user?.uid && deleteTask(user.uid, id)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// ── SUB-TABS ──────────────────────────────────

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <Inbox className="w-8 h-8 text-muted/30 mb-2" />
            <p className="text-xs text-muted">{message}</p>
        </div>
    )
}

function EventsTab({ events, loading }: { events: DashboardEvent[]; loading: boolean }) {
    if (loading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
                ))}
            </div>
        )
    }

    if (events.length === 0) {
        return <EmptyState message="Nenhum evento próximo registrado." />
    }

    return (
        <AnimatePresence>
            {events.map(ev => (
                <TaskCard
                    key={ev.id}
                    id={ev.id}
                    title={ev.title}
                    subtitle={ev.time}
                    dragData={{ tag: ev.tag, source: "eventos" }}
                />
            ))}
        </AnimatePresence>
    )
}

function PlanejamentosTab({ planejamentos, loading }: { planejamentos: Planejamento[]; loading: boolean }) {
    const PRIORITY_COLORS: Record<string, string> = {
        alta: "#ef4444",
        media: "#f59e0b",
        baixa: "#10b981",
    }

    if (loading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
                ))}
            </div>
        )
    }

    if (planejamentos.length === 0) {
        return <EmptyState message="Nenhum planejamento pendente." />
    }

    return (
        <AnimatePresence>
            {planejamentos.map(p => (
                <TaskCard
                    key={p.id}
                    id={p.id}
                    title={p.titulo}
                    subtitle={`${p.categoria} · ${p.prioridade}`}
                    color={PRIORITY_COLORS[p.prioridade] || "#6366f1"}
                    dragData={{ categoria: p.categoria, prioridade: p.prioridade, source: "planejamentos" }}
                />
            ))}
        </AnimatePresence>
    )
}

function TasksTab({
    tasks,
    categories,
    onDelete,
}: {
    tasks: CalendarTask[]
    categories: { id: string; color: string; name: string }[]
    onDelete: (id: string) => void
}) {
    if (tasks.length === 0) {
        return <EmptyState message="Crie tarefas para arrastar ao calendário." />
    }

    return (
        <AnimatePresence>
            {tasks.map(task => {
                const cat = categories.find(c => c.id === task.categoryId)
                return (
                    <TaskCard
                        key={task.id}
                        id={task.id}
                        title={task.title}
                        subtitle={cat?.name}
                        color={cat?.color}
                        scheduled={task.scheduled}
                        onDelete={() => onDelete(task.id)}
                        dragData={{ categoryId: task.categoryId, source: "tarefas" }}
                    />
                )
            })}
        </AnimatePresence>
    )
}
