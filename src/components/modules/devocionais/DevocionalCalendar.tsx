"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, CheckCircle, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Devocional } from "@/types/devocional"

type Props = {
    devocionais: Devocional[]
    selectedDate: string
    onDateSelect: (date: string) => void
}

const DAYS = ["D", "S", "T", "Q", "Q", "S", "S"]
const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export function DevocionalCalendar({ devocionais, selectedDate, onDateSelect }: Props) {
    const today = new Date()
    // Inicializa o mês atual baseado na data selecionada ou hoje
    const [initialYear, initialMonth] = selectedDate.split("-").map(Number)
    const [currentDate, setCurrentDate] = useState(new Date(initialYear, initialMonth - 1, 1))

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

    const getDevocionalStatus = (day: number) => {
        const pad = (n: number) => String(n).padStart(2, "0")
        const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`
        const dev = devocionais.find(d => d.date === dateStr && d.completed)
        if (!dev) return null

        const createdStr = new Intl.DateTimeFormat('en-CA', {
            timeZone: "America/Sao_Paulo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(new Date(dev.createdAt))

        return dev.date < createdStr ? "late" : "ontime"
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
                    const status = getDevocionalStatus(day)
                    const todayDay = isToday(day)
                    const pad = (n: number) => String(n).padStart(2, "0")
                    const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`
                    const isSelected = selectedDate === dateStr

                    return (
                        <button
                            key={day}
                            onClick={() => onDateSelect(dateStr)}
                            className={cn(
                                "aspect-square flex items-center justify-center rounded-lg text-xs transition-all relative",
                                status === "ontime" && "bg-emerald-500/20 hover:bg-emerald-500/30",
                                status === "late" && "bg-amber-500/20 hover:bg-amber-500/30",
                                isSelected && !status && "bg-primary/20 ring-1 ring-primary",
                                isSelected && status && "ring-2 ring-primary ring-offset-2 ring-offset-background z-10",
                                todayDay && !status && !isSelected && "border border-primary/50 text-white font-bold",
                                !status && !todayDay && !isSelected && "text-muted hover:bg-white/5",
                            )}
                            title={status === "late" ? "Devocional Atrasado" : status === "ontime" ? "Devocional Concluído" : ""}
                        >
                            {status ? (
                                <CheckCircle className={cn(
                                    "w-5 h-5",
                                    status === "ontime" ? "text-emerald-400" : "text-amber-400"
                                )} />
                            ) : (
                                <span>{day}</span>
                            )}
                            {todayDay && !status && (
                                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}