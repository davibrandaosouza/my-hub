"use client"

import { Flame, Trophy, TrendingUp } from "lucide-react"

interface Props {
    completed: number
    total: number
    streak: number
    totalXp: number
    bestStreak: number
    strongestHabit: { name: string; emoji: string } | null
    totalXpYear: number
    avgPerDay: number
}

export function HabitProgress({
    completed, total, streak, totalXp,
    bestStreak, strongestHabit, totalXpYear, avgPerDay,
}: Props) {
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100)

    // SVG ring
    const radius = 52
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (pct / 100) * circumference

    // Hoje vs. média
    const diff = completed - avgPerDay
    const aboveAvg = diff > 0
    const onAvg = Math.abs(diff) < 0.5

    return (
        <div className="rounded-xl border border-border bg-card-background p-5 flex flex-col gap-5 h-full">

            {/* Progresso do dia */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-semibold text-white">Progresso de Hoje</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                            <circle
                                cx="60" cy="60" r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="10"
                                className="text-border"
                            />
                            <circle
                                cx="60" cy="60" r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                className="text-primary transition-all duration-700"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-bold text-white">{pct}%</span>
                        </div>
                    </div>
                    <p className="text-sm text-muted text-center">
                        {completed} de {total} hábitos completos
                    </p>
                </div>
            </div>

            <div className="border-t border-border" />

            {/* Sequência atual */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                    <p className="text-base font-bold text-white">{streak} {streak === 1 ? "dia" : "dias"}</p>
                    <p className="text-xs text-muted">Sequência atual</p>
                </div>
            </div>

            <div className="border-t border-border" />

            {/* Melhor sequência */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <p className="text-base font-bold text-white">{bestStreak} {bestStreak === 1 ? "dia" : "dias"}</p>
                    <p className="text-xs text-muted">Melhor sequência</p>
                </div>
            </div>

            <div className="border-t border-border" />

            {/* Hábito mais forte */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 text-xl">
                    {strongestHabit ? strongestHabit.emoji : "🌱"}
                </div>
                <div className="overflow-hidden">
                    <p className="text-base font-bold text-white truncate">
                        {strongestHabit ? strongestHabit.name : "Em progresso..."}
                    </p>
                    <p className="text-xs text-muted">
                        {strongestHabit ? "Hábito mais forte" : "Continue praticando"}
                    </p>
                </div>
            </div>

            <div className="border-t border-border" />

            {/* XP total do ano */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <span className="text-lg">⚡</span>
                </div>
                <div>
                    <p className="text-base font-bold text-white">
                        {totalXp} <span className="text-xs font-normal text-muted">hoje</span>
                        {" · "}
                        <span className="text-primary">{totalXpYear}</span>
                        <span className="text-xs font-normal text-muted"> /ano</span>
                    </p>
                    <p className="text-xs text-muted">XP ganhos</p>
                </div>
            </div>

            <div className="border-t border-border" />

            {/* Hoje vs média */}
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${avgPerDay === 0 ? "bg-muted/10" : aboveAvg ? "bg-emerald-500/10" : onAvg ? "bg-blue-500/10" : "bg-red-500/10"}`}>
                    <TrendingUp className={`w-5 h-5 ${avgPerDay === 0 ? "text-muted" : aboveAvg ? "text-emerald-400" : onAvg ? "text-blue-400" : "text-red-400"}`} />
                </div>
                <div>
                    <p className={`text-base font-bold ${avgPerDay === 0 ? "text-muted" : aboveAvg ? "text-emerald-400" : onAvg ? "text-blue-400" : "text-red-400"}`}>
                        {avgPerDay === 0 ? "Primeiro dia?" : onAvg ? "Na média" : aboveAvg ? `+${diff.toFixed(1)} acima` : `${diff.toFixed(1)} abaixo`}
                    </p>
                    <p className="text-xs text-muted">
                        {avgPerDay === 0 ? "Inicie sua jornada hoje" : `Média: ${avgPerDay.toFixed(1)} /dia`}
                    </p>
                </div>
            </div>

        </div>
    )
}
