"use client"

import { usePomodoroStore } from "@/hooks/usePomodoroStore"
import { Timer, CheckCircle, Flame } from "lucide-react"

export function PomodoroStats() {
    const { stats } = usePomodoroStore()

    const statItems = [
        {
            label: "Tempo focado",
            value: `${stats.totalFocusMinutes}m`,
            icon: Timer,
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            label: "Sessões",
            value: stats.sessionsCompleted,
            icon: CheckCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            label: "Tarefas",
            value: stats.tasksCompleted,
            icon: Flame,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        }
    ]

    return (
        <div className="grid grid-cols-3 gap-4">
            {statItems.map((item, index) => (
                <div
                    key={index}
                    className="bg-card-background border border-border p-4 rounded-2xl flex flex-col items-center text-center space-y-2 hover:border-white/10 transition-colors"
                >
                    <div className={`${item.bg} p-2 rounded-xl`}>
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-xl font-bold text-white tabular-nums">{item.value}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted font-medium">{item.label}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
