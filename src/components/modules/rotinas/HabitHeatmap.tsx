"use client"

import type { HabitLog } from "@/types/habit"

interface Props {
    logs: HabitLog[]
    year: number
    totalCompleted: number
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function getDaysInYear(year: number) {
    const days: { date: string; dayOfWeek: number }[] = []
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push({
            date: d.toISOString().split("T")[0],
            dayOfWeek: d.getDay(),
        })
    }
    return days
}

function buildWeeks(days: { date: string; dayOfWeek: number }[]) {
    const weeks: ({ date: string; dayOfWeek: number } | null)[][] = []
    let week: ({ date: string; dayOfWeek: number } | null)[] = Array(days[0].dayOfWeek).fill(null)
    for (const day of days) {
        week.push(day)
        if (week.length === 7) {
            weeks.push(week)
            week = []
        }
    }
    if (week.length > 0) {
        while (week.length < 7) week.push(null)
        weeks.push(week)
    }
    return weeks
}

function getMonthPositions(weeks: ({ date: string; dayOfWeek: number } | null)[][]) {
    const positions: { label: string; col: number }[] = []
    let lastMonth = -1
    weeks.forEach((week, col) => {
        const firstDay = week.find(d => d !== null)
        if (!firstDay) return
        const month = new Date(firstDay.date).getMonth()
        if (month !== lastMonth) {
            positions.push({ label: MONTHS[month], col })
            lastMonth = month
        }
    })
    return positions
}

function getIntensity(count: number): string {
    if (count === 0) return "bg-white/5"
    if (count === 1) return "bg-primary/30"
    if (count === 2) return "bg-primary/55"
    if (count <= 4) return "bg-primary/75"
    return "bg-primary"
}

export function HabitHeatmap({ logs, year, totalCompleted }: Props) {
    const countByDate: Record<string, number> = {}
    for (const log of logs) {
        if (log.completed) {
            countByDate[log.date] = (countByDate[log.date] ?? 0) + 1
        }
    }

    const days = getDaysInYear(year)
    const weeks = buildWeeks(days)
    const monthPositions = getMonthPositions(weeks)

    return (
        <div className="rounded-xl border border-border bg-card-background p-5">
            <p className="text-sm font-semibold text-white mb-4">
                {totalCompleted} hábitos completos no último ano
            </p>

            <div className="overflow-x-auto pb-1">
                <div className="inline-flex gap-2">
                    {/* Dias da semana */}
                    <div className="flex flex-col gap-[3px] pt-5 mr-1">
                        {[1, 3, 5].map(i => (
                            <div key={i} className="h-[11px] text-[9px] text-muted flex items-center" style={{ marginTop: i === 1 ? 0 : "calc(11px + 3px)" }}>
                                {WEEKDAYS[i]}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="relative">
                        {/* Meses */}
                        <div className="flex mb-1 h-4">
                            {monthPositions.map(({ label, col }) => (
                                <div
                                    key={`${label}-${col}`}
                                    className="absolute text-[10px] text-muted"
                                    style={{ left: col * (11 + 3) }}
                                >
                                    {label}
                                </div>
                            ))}
                        </div>

                        {/* Células */}
                        <div className="flex gap-[3px]">
                            {weeks.map((week, wi) => (
                                <div key={wi} className="flex flex-col gap-[3px]">
                                    {week.map((day, di) => {
                                        if (!day) {
                                            return <div key={di} className="w-[11px] h-[11px]" />
                                        }
                                        const count = countByDate[day.date] ?? 0
                                        return (
                                            <div
                                                key={day.date}
                                                title={`${day.date}: ${count} hábito(s)`}
                                                className={`w-[11px] h-[11px] rounded-sm ${getIntensity(count)}`}
                                            />
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-1.5 justify-end mt-3">
                <span className="text-[10px] text-muted">Menos</span>
                {[0, 1, 2, 3, 5].map(n => (
                    <div key={n} className={`w-[11px] h-[11px] rounded-sm ${getIntensity(n)}`} />
                ))}
                <span className="text-[10px] text-muted">Mais</span>
            </div>
        </div>
    )
}
