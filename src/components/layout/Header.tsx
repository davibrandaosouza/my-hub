"use client"

import { CalendarDays, ChevronLeft } from "lucide-react"

type HeaderProps = {
    title: string
    showBack?: boolean
    onBack?: () => void
}

export function Header({ title, showBack, onBack }: HeaderProps) {
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
            <div className="flex items-center gap-3">
                {showBack && (
                    <button
                        onClick={onBack}
                        className="p-1 -ml-1 rounded-full hover:bg-foreground/5 text-muted transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
                <CalendarDays className="w-4 h-4 text-muted" />
                <span className="text-xs text-muted">{dateDisplay}</span>
            </div>
        </header>
    )
}