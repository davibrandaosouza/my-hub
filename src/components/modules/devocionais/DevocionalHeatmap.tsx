"use client"

import { cn } from "@/lib/utils"
import type { Devocional } from "@/types/devocional"

type Props = {
    devocionais: Devocional[]
    year: number
}

const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
const DAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export function DevocionalHeatmap({ devocionais, year }: Props) {
    const completedDates = new Set(
        devocionais.filter(d => d.completed).map(d => d.date)
    )

    // Gera todas as semanas do ano
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)

    // Ajusta para começar no domingo anterior ao 1o de janeiro
    const start = new Date(startDate)
    start.setDate(start.getDate() - start.getDay())

    const weeks: Date[][] = []
    const current = new Date(start)

    while (current <= endDate) {
        const week: Date[] = []
        for (let d = 0; d < 7; d++) {
            week.push(new Date(current))
            current.setDate(current.getDate() + 1)
        }
        weeks.push(week)
    }

    const isCompleted = (date: Date) => {
        const str = date.toISOString().split("T")[0]
        return completedDates.has(str)
    }

    const isCurrentYear = (date: Date) => date.getFullYear() === year

    const today = new Date().toISOString().split("T")[0]
    const isToday = (date: Date) => date.toISOString().split("T")[0] === today

    // Calcula posição dos labels dos meses
    const monthLabels: { label: string; weekIndex: number }[] = []
    weeks.forEach((week, i) => {
        const firstOfWeek = week[0]
        if (firstOfWeek.getDate() <= 7 && isCurrentYear(firstOfWeek)) {
            monthLabels.push({
                label: MONTHS_SHORT[firstOfWeek.getMonth()],
                weekIndex: i,
            })
        }
    })

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <div className="min-w-max">
                    {/* Labels dos meses */}
                    <div className="flex ml-8 mb-1">
                        {weeks.map((_, i) => {
                            const label = monthLabels.find(m => m.weekIndex === i)
                            return (
                                <div key={i} className="w-[14px] mr-[2px]">
                                    {label && (
                                        <span className="text-[10px] text-muted">{label.label}</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex gap-0">
                        {/* Labels dos dias */}
                        <div className="flex flex-col gap-[2px] mr-1">
                            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                                <div key={d} className="h-[14px] w-7 flex items-center">
                                    {d % 2 !== 0 && (
                                        <span className="text-[9px] text-muted">{DAYS_SHORT[d]}</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Grid de semanas */}
                        <div className="flex gap-[2px]">
                            {weeks.map((week, wi) => (
                                <div key={wi} className="flex flex-col gap-[2px]">
                                    {week.map((date, di) => {
                                        const inYear = isCurrentYear(date)
                                        const done = isCompleted(date)
                                        const todayCell = isToday(date)

                                        return (
                                            <div
                                                key={di}
                                                title={date.toLocaleDateString("pt-BR")}
                                                className={cn(
                                                    "w-[14px] h-[14px] rounded-sm",
                                                    !inYear && "opacity-0",
                                                    inYear && !done && "bg-white/5",
                                                    done && "bg-emerald-500",
                                                    todayCell && !done && "ring-1 ring-primary",
                                                )}
                                            />
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legenda */}
                    <div className="flex items-center justify-end gap-2 mt-2">
                        <span className="text-[10px] text-muted">Não feito</span>
                        <div className="w-[14px] h-[14px] rounded-sm bg-white/5" />
                        <div className="w-[14px] h-[14px] rounded-sm bg-emerald-500" />
                        <span className="text-[10px] text-muted">Feito</span>
                    </div>
                </div>
            </div>
        </div>
    )
}