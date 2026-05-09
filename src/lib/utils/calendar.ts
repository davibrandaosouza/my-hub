// ── Helpers para cálculos de datas do calendário ──
import type { CalendarEvent } from "@/types/calendario"

export function getWeekDays(date: Date): Date[] {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day // início no domingo
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
        const dd = new Date(d)
        dd.setDate(diff + i)
        days.push(dd)
    }
    return days
}

export function getMonthDays(date: Date): Date[] {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startPad = firstDay.getDay() // dias antes do mês
    const days: Date[] = []

    // Dias do mês anterior
    for (let i = startPad - 1; i >= 0; i--) {
        const d = new Date(year, month, -i)
        days.push(d)
    }

    // Dias do mês atual
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i))
    }

    // Dias do próximo mês (completa até 42 = 6 semanas)
    const endPad = 42 - days.length
    for (let i = 1; i <= endPad; i++) {
        days.push(new Date(year, month + 1, i))
    }

    return days
}

export function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

export function isToday(date: Date): boolean {
    return isSameDay(date, new Date())
}

export function formatDateISO(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

export function formatTime(datetime: string): string {
    return datetime.split("T")[1] || "00:00"
}

export function getHourFromDatetime(datetime: string): number {
    const time = datetime.split("T")[1] || "00:00"
    return parseInt(time.split(":")[0], 10)
}

export function getMinuteFromDatetime(datetime: string): number {
    const time = datetime.split("T")[1] || "00:00"
    return parseInt(time.split(":")[1], 10)
}

export function getDurationMinutes(start: string, end: string): number {
    const s = new Date(start).getTime()
    const e = new Date(end).getTime()
    return Math.max(30, (e - s) / 60000)
}

export function formatMonthYear(date: Date): string {
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
}

export function formatWeekRange(date: Date): string {
    const days = getWeekDays(date)
    const first = days[0]
    const last = days[6]
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
    return `${first.toLocaleDateString("pt-BR", opts)} — ${last.toLocaleDateString("pt-BR", opts)}`
}

export function formatDayFull(date: Date): string {
    return date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    })
}

export function isEventVisibleOnDay(event: CalendarEvent, dayIso: string): boolean {
    const startIso = event.start.split("T")[0]
    if (dayIso < startIso) return false
    if (event.repeat === "never") return dayIso === startIso

    const date = new Date(dayIso + "T12:00:00")
    const startDate = new Date(startIso + "T12:00:00")

    switch (event.repeat) {
        case "daily":
            return true
        case "weekly":
            return date.getDay() === startDate.getDay()
        case "monthly":
            return date.getDate() === startDate.getDate()
        case "yearly":
            return date.getMonth() === startDate.getMonth() && date.getDate() === startDate.getDate()
        default:
            return dayIso === startIso
    }
}

export const HOURS = Array.from({ length: 24 }, (_, i) => i)

export const WEEK_DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
