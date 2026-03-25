"use client"

import { CalendarDays } from "lucide-react"

type HeaderProps = {
    title: string
}

export function Header({ title }: HeaderProps) {
    const now = new Date()
    const dateFormatted = now.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    })

    // Capitaliza a primeira letra
    const dateDisplay = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1)

    return (
        <header className="sticky top-0 z-10 flex flex-col items-start justify-between w-full px-6 py-3 bg-background/80 backdrop-blur-md border-b border-border">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <div className="flex items-center gap-1.5 mt-1">
                <CalendarDays className="w-4 h-4 text-muted" />
                <span className="text-xs text-muted">{dateDisplay}</span>
            </div>
        </header>
    )
}