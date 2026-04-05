"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowUpDown, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type SortKey =
    | "alpha_asc"
    | "alpha_desc"
    | "added_desc"
    | "added_asc"
    | "release_desc"
    | "release_asc"

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "alpha_asc",     label: "A → Z" },
    { key: "alpha_desc",    label: "Z → A" },
    { key: "added_desc",    label: "Adicionados recentemente" },
    { key: "added_asc",     label: "Adicionados primeiro" },
    { key: "release_desc",  label: "Lançamento (mais novo)" },
    { key: "release_asc",   label: "Lançamento (mais antigo)" },
]

type Props = {
    value: SortKey
    onChange: (key: SortKey) => void
}

export function SortDropdown({ value, onChange }: Props) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const current = SORT_OPTIONS.find(o => o.key === value)

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
            <button
                onClick={() => setOpen(o => !o)}
                className={cn(
                    "flex items-center gap-2 px-3.5 py-3 rounded-xl border text-sm transition-all whitespace-nowrap",
                    open
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-card-background text-muted hover:text-foreground hover:border-border/80 hover:bg-foreground/5"
                )}
            >
                <ArrowUpDown className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{current?.label ?? "Ordenar"}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform shrink-0", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-border bg-card-background shadow-2xl shadow-black/30 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {SORT_OPTIONS.map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => { onChange(opt.key); setOpen(false) }}
                            className={cn(
                                "flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors text-left",
                                opt.key === value
                                    ? "text-primary bg-primary/10"
                                    : "text-foreground hover:bg-foreground/5"
                            )}
                        >
                            {opt.label}
                            {opt.key === value && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
