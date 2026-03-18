"use client"

import { Sparkles, CalendarDays } from "lucide-react"

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
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-md border-b border-border">
            <div>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                <div className="flex items-center gap-1.5 mt-1">
                    <CalendarDays className="w-4 h-4 text-muted" />
                    <span className="text-xs text-muted">{dateDisplay}</span>
                </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-primary to-primary-active text-white text-sm font-medium hover:opacity-80 transition-opacity">
                <Sparkles className="w-4 h-4" />
                Ações Rápidas
            </button>
        </header>
    )
}