"use client"

import { cn } from "@/lib/utils"

export type FilterOption<T extends string> = {
    key: T
    label: string
    icon: React.ElementType
}

type Props<T extends string> = {
    options: FilterOption<T>[]
    counts: Record<T, number>
    active: T
    onChange: (f: T) => void
}

export function MediaStatsBar<T extends string>({ options, counts, active, onChange }: Props<T>) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {options.map(({ key, label, icon: Icon }) => {
                const isActive = active === key
                return (
                    <button
                        key={key}
                        onClick={() => onChange(key)}
                        className={cn(
                            "relative flex flex-col p-4 rounded-xl border transition-all text-left overflow-hidden group",
                            isActive
                                ? "border-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                                : "border-border bg-card-background hover:border-white/10 hover:bg-white/5"
                        )}
                    >
                        <div className="flex items-center gap-3 mb-1">
                            <div className={cn(
                                "p-2 rounded-lg transition-colors",
                                isActive ? "bg-primary/20 text-primary" : "bg-white/5 text-muted group-hover:text-white"
                            )}>
                                <Icon className="w-4 h-4" />
                            </div>
                            
                            <span className={cn(
                                "text-2xl font-bold transition-colors",
                                isActive ? "text-white" : "text-muted group-hover:text-white"
                            )}>
                                {counts[key] ?? 0}
                            </span>
                        </div>
                        
                        <span className={cn(
                            "text-xs font-medium mt-1 transition-colors",
                            isActive ? "text-primary/80" : "text-muted group-hover:text-white/60"
                        )}>
                            {label}
                        </span>
                        
                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary to-primary-active" />
                        )}
                    </button>
                )
            })}
        </div>
    )
}
