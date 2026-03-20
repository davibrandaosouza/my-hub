"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

type TagInputProps = {
    value: string
    onChange: (value: string) => void
    suggestions: string[]
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function TagInput({ value, onChange, suggestions, placeholder, disabled, className }: TagInputProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const filtered = suggestions.filter(
        (s) => s.toLowerCase().includes(value.toLowerCase()) && s !== value
    )

    // Fecha ao clicar fora
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    return (
        <div ref={ref} className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value)
                    setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    "flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
            />

            {/* DROPDOWN DE SUGESTÕES */}
            {open && filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-card-background shadow-xl py-1 max-h-40 overflow-y-auto">
                    {filtered.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault() // evita blur antes do click
                                onChange(s)
                                setOpen(false)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-white hover:bg-white/5 transition-colors text-left"
                        >
                            <span className="text-primary text-xs">◆</span>
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}