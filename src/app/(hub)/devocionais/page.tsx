"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Flame } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/layout/Header"
import { DevocionalCalendar } from "@/components/modules/devocionais/DevocionalCalendar"
import { DevocionalHoje } from "@/components/modules/devocionais/DevocionalHoje"
import { DevocionalHistorico } from "@/components/modules/devocionais/DevocionalHistorico"
import { DevocionalHeatmap } from "@/components/modules/devocionais/DevocionalHeatmap"
import { Skeleton } from "@/components/ui/skeleton"
import {
    getDevocionalsByYear,
    getDevocionalsByMonth,
    calculateStreak,
} from "@/lib/firebase/devocionais"
import type { Devocional } from "@/types/devocional"

export default function DevocionalPage() {
    const { user } = useAuth()
    const userId = user?.uid
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    const [allYear, setAllYear] = useState<Devocional[]>([])
    const [thisMonth, setThisMonth] = useState<Devocional[]>([])
    const [refreshKey, setRefreshKey] = useState(0)
    const [pageLoading, setPageLoading] = useState(true)
    const isInitialLoad = useRef(true)

    const loadData = useCallback(async () => {
        if (!userId) return
        const [yearData, monthData] = await Promise.all([
            getDevocionalsByYear(userId, currentYear),
            getDevocionalsByMonth(userId, currentYear, currentMonth),
        ])
        setAllYear(yearData)
        setThisMonth(monthData)
        if (isInitialLoad.current) {
            isInitialLoad.current = false
            setPageLoading(false)
        } else {
            setRefreshKey(k => k + 1)
        }
    }, [userId, currentYear, currentMonth])

    useEffect(() => {
        void loadData()
    }, [loadData])

    const streak = calculateStreak(allYear)
    const totalThisMonth = thisMonth.filter(d => d.completed).length
    const total = allYear.filter(d => d.completed).length

    return (
        <div>
            <Header title="Devocionais" />

            <div className="p-6 space-y-6">

                {/* ── STREAK BANNER ── */}
                <div className="rounded-xl border border-border bg-card-background p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <Flame className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{streak} dias</p>
                            <p className="text-sm text-muted">Sequência atual de devocionais</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 text-center">
                        <div>
                            <p className="text-2xl font-bold text-white">{totalThisMonth}</p>
                            <p className="text-xs text-muted uppercase tracking-wider">Este mês</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{total}</p>
                            <p className="text-xs text-muted uppercase tracking-wider">Total</p>
                        </div>
                    </div>
                </div>

                {/* ── CALENDÁRIO + HOJE + HISTÓRICO ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Calendário */}
                    <div className="rounded-xl border border-border bg-card-background p-5">
                        {pageLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-full" />
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: 35 }).map((_, i) => (
                                        <Skeleton key={i} className="aspect-square rounded-sm" />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <DevocionalCalendar devocionais={allYear} />
                        )}
                    </div>

                    {/* Devocional de Hoje */}
                    <div className="rounded-xl border border-border bg-card-background p-5">
                        {pageLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-14 w-full rounded-lg" />
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-32 w-full rounded-lg" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </div>
                        ) : (
                            <DevocionalHoje key={refreshKey} onSaved={loadData} />
                        )}
                    </div>

                    {/* Histórico */}
                    <div className="rounded-xl border border-border bg-card-background p-5">
                        {pageLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-9 w-full rounded-lg" />
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <DevocionalHistorico devocionais={allYear} onUpdated={loadData} />
                        )}
                    </div>

                </div>

                {/* ── HEATMAP ANUAL ── */}
                <div className="rounded-xl border border-border bg-card-background p-5">
                    <p className="text-sm font-semibold text-white mb-4">
                        {total} devocionais completos em {currentYear}
                    </p>
                    <DevocionalHeatmap devocionais={allYear} year={currentYear} />
                </div>

            </div>
        </div>
    )
}