"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, CheckCircle, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Devocional } from "@/types/devocional"

type Props = {
    devocionais: Devocional[]
}

const DAYS = ["D", "S", "T", "Q", "Q", "S", "S"]
const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export function DevocionalCalendar({ devocionais }: Props) {
    const today = new Date()
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

    const completedDates = new Set(
        devocionais.filter(d => d.completed).map(d => d.date)
    )

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

    const isToday = (day: number) =>
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()

    const isCompleted = (day: number) => {
        const pad = (n: number) => String(n).padStart(2, "0")
        const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`
        return completedDates.has(dateStr)
    }

    return (
        <div>
            {/* Header do calendário */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm flex items-center gap-2 font-semibold text-white">
                        <Calendar className="w-4 h-4 text-primary" /> {MONTHS[month]} {year}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={prevMonth}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 mb-2">
                {DAYS.map((day, i) => (
                    <div key={i} className="text-center text-xs text-muted font-medium py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-1">
                {/* Espaços vazios antes do primeiro dia */}
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const completed = isCompleted(day)
                    const todayDay = isToday(day)

                    return (
                        <div
                            key={day}
                            className={cn(
                                "aspect-square flex items-center justify-center rounded-lg text-xs transition-all",
                                completed && "bg-emerald-500/20",
                                todayDay && !completed && "border border-primary text-primary font-bold",
                                !completed && !todayDay && "text-muted",
                            )}
                        >
                            {completed ? (
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <span>{day}</span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}