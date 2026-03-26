"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Plus } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { Header } from "@/components/layout/Header"
import { Skeleton } from "@/components/ui/skeleton"
import { HabitItem } from "@/components/modules/rotinas/HabitItem"
import { HabitProgress } from "@/components/modules/rotinas/HabitProgress"
import { HabitHeatmap } from "@/components/modules/rotinas/HabitHeatmap"
import { AddHabitModal } from "@/components/modules/rotinas/AddHabitModal"
import {
    getHabits,
    saveHabit,
    deleteHabit,
    getTodayLogs,
    toggleHabitLog,
    getLogsByYear,
    calculateStreak,
    calculateBestStreak,
} from "@/lib/firebase/habitos"
import type { Habit, HabitLog } from "@/types/habit"

function todayDate() {
    return new Date().toISOString().split("T")[0]
}

function formatDateBR(date: Date) {
    return date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    })
}

export default function RotinaPage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const userId = user?.uid
    const today = todayDate()
    const currentYear = new Date().getFullYear()

    const [habits, setHabits] = useState<Habit[]>([])
    const [todayLogs, setTodayLogs] = useState<HabitLog[]>([])
    const [yearLogs, setYearLogs] = useState<HabitLog[]>([])
    const [pageLoading, setPageLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    // ── Carga inicial ──────────────────────────
    const loadData = useCallback(async () => {
        if (!userId) return
        const [habitsData, logsData, yearData] = await Promise.all([
            getHabits(userId),
            getTodayLogs(userId, today),
            getLogsByYear(userId, currentYear),
        ])
        setHabits(habitsData)
        setTodayLogs(logsData)
        setYearLogs(yearData)
    }, [userId, today, currentYear])

    useEffect(() => {
        if (!userId) return
        async function fetchInitial() {
            await loadData()
            setPageLoading(false)
        }
        void fetchInitial()
    }, [userId, loadData])

    // ── Marcar / desmarcar hábito ──────────────
    async function handleToggle(habitId: string, current: boolean) {
        if (!userId) return
        const next = !current
        // Optimistic update
        setTodayLogs(prev => {
            const existing = prev.find(l => l.habitId === habitId)
            if (existing) {
                return prev.map(l => l.habitId === habitId ? { ...l, completed: next, completedAt: next ? Date.now() : null } : l)
            }
            return [...prev, { id: `${userId}_${today}_${habitId}`, userId, habitId, date: today, completed: next, completedAt: next ? Date.now() : null }]
        })
        const { error } = await toggleHabitLog(userId, habitId, today, next)

        if (error) {
            toast.error(error)
            // Reverter update otimista
            setTodayLogs(prev => prev.map(l => l.habitId === habitId ? { ...l, completed: current } : l))
            return
        }

        // Atualiza yearLogs sem reload completo se sucesso
        setYearLogs(prev => {
            const id = `${userId}_${today}_${habitId}`
            const existing = prev.find(l => l.id === id)
            if (existing) return prev.map(l => l.id === id ? { ...l, completed: next } : l)
            return [...prev, { id, userId, habitId, date: today, completed: next, completedAt: next ? Date.now() : null }]
        })
    }

    // ── Deletar hábito ─────────────────────────
    async function handleDelete(habitId: string) {
        if (!userId) return
        setHabits(prev => prev.filter(h => h.id !== habitId))
        setTodayLogs(prev => prev.filter(l => l.habitId !== habitId))
        setYearLogs(prev => prev.filter(l => l.habitId !== habitId))
        
        const { error } = await deleteHabit(userId, habitId)
        if (error) {
            toast.error(error)
            await loadData()
        }
    }

    // ── Criar hábito ───────────────────────────
    async function handleCreate(name: string, emoji: string, xp: number) {
        if (!userId) return
        const id = crypto.randomUUID()
        const habit: Habit = { id, userId, name, emoji, xp, createdAt: Date.now() }
        setHabits(prev => [...prev, habit])
        setShowModal(false)
        const { error } = await saveHabit(userId, habit)

        if (error) {
            toast.error(error)
            setHabits(prev => prev.filter(h => h.id !== id))
        }
    }

    // ── Cálculos Derivados (Memorizados) ────────
    const stats = useMemo(() => {
        const existingIds = new Set(habits.map(h => h.id))
        
        // Filtrar todos os logs por hábitos que ainda existem
        const validTodayLogs = todayLogs.filter(l => l.completed && existingIds.has(l.habitId))
        const validYearLogs = yearLogs.filter(l => l.completed && existingIds.has(l.habitId))

        const completedCount = validTodayLogs.length

        const totalXpToday = validTodayLogs.reduce((acc, log) => {
            const habit = habits.find(h => h.id === log.habitId)
            return acc + (habit?.xp ?? 0)
        }, 0)

        const streakValue = calculateStreak(validYearLogs)
        const bestStreakValue = calculateBestStreak(validYearLogs)
        const totalYearCompletedValue = validYearLogs.length

        // XP total do ano
        const totalXpYearValue = validYearLogs.reduce((acc, log) => {
            const habit = habits.find(h => h.id === log.habitId)
            return acc + (habit?.xp ?? 0)
        }, 0)

        // Hábito mais forte
        const completionsByHabitMap: Record<string, number> = {}
        for (const log of validYearLogs) {
            completionsByHabitMap[log.habitId] = (completionsByHabitMap[log.habitId] ?? 0) + 1
        }
        const strId = Object.entries(completionsByHabitMap).sort((a, b) => b[1] - a[1])[0]?.[0]
        const strHabit = habits.find(h => h.id === strId) ?? null

        // Hoje vs. média diária
        const uDays = new Set(validYearLogs.map(l => l.date)).size
        const avDay = uDays > 0 ? totalYearCompletedValue / uDays : 0

        return {
            completedCount,
            totalXpToday,
            streak: streakValue,
            bestStreak: bestStreakValue,
            totalYearCompleted: totalYearCompletedValue,
            totalXpYear: totalXpYearValue,
            strongestHabit: strHabit,
            avgPerDay: avDay
        }
    }, [habits, todayLogs, yearLogs])

    const sortedHabits = useMemo(() => {
        return [...habits].sort((a, b) => {
            const aDone = todayLogs.find(l => l.habitId === a.id)?.completed ? 1 : 0
            const bDone = todayLogs.find(l => l.habitId === b.id)?.completed ? 1 : 0
            if (aDone !== bDone) return aDone - bDone
            return 0 // Mantém a ordem original para o resto
        })
    }, [habits, todayLogs])

    return (
        <div>
            <Header title="Rotinas" />

            <div className="p-6 space-y-6">

                {/* ── GRID PRINCIPAL ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

                    {/* Coluna esquerda: Lista + Heatmap */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Lista de Hábitos */}
                        <div className="rounded-xl border border-border bg-card-background overflow-hidden">

                            {/* Header do card */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                                <div>
                                    <h2 className="text-sm font-semibold text-white">Hábitos de Hoje</h2>
                                    <p className="text-xs text-muted mt-0.5 capitalize">{formatDateBR(new Date())}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted">
                                        {pageLoading ? "—" : `${stats.completedCount}/${habits.length}`}
                                    </span>
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Novo Hábito
                                    </button>
                                </div>
                            </div>

                            {/* Lista */}
                            <div className="p-4 space-y-2">
                                {pageLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton key={i} className="h-14 w-full rounded-xl" />
                                    ))
                                ) : habits.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-14 text-center">
                                        <span className="text-4xl mb-3">🌱</span>
                                        <p className="text-sm font-medium text-white mb-1">Nenhum hábito ainda</p>
                                        <p className="text-xs text-muted">Crie seu primeiro hábito para começar sua jornada</p>
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="mt-5 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Criar meu primeiro hábito
                                        </button>
                                    </div>
                                ) : (
                                    sortedHabits.map(habit => (
                                        <HabitItem
                                            key={habit.id}
                                            habit={habit}
                                            log={todayLogs.find(l => l.habitId === habit.id)}
                                            onToggle={handleToggle}
                                            onDelete={handleDelete}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Heatmap Anual */}
                        {pageLoading ? (
                            <Skeleton className="h-40 w-full rounded-xl" />
                        ) : (
                            <HabitHeatmap
                                logs={yearLogs}
                                year={currentYear}
                                totalCompleted={stats.totalYearCompleted}
                            />
                        )}
                    </div>

                    {/* Coluna direita: Progresso — ocupa toda a altura */}
                    <div className="lg:col-span-1 self-stretch">
                        {pageLoading ? (
                            <Skeleton className="h-full w-full rounded-xl" />
                        ) : (
                            <HabitProgress
                                completed={stats.completedCount}
                                total={habits.length}
                                streak={stats.streak}
                                totalXp={stats.totalXpToday}
                                bestStreak={stats.bestStreak}
                                strongestHabit={stats.strongestHabit}
                                totalXpYear={stats.totalXpYear}
                                avgPerDay={stats.avgPerDay}
                            />
                        )}
                    </div>

                </div>


            </div>

            {/* Modal para criar hábito */}
            {showModal && (
                <AddHabitModal
                    onClose={() => setShowModal(false)}
                    onSave={handleCreate}
                />
            )}
        </div>
    )
}
