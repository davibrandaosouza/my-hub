"use client"

import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

type Props = {
    value: number | null
    onChange: (val: number | null) => void
    className?: string
}

export function RatingSlider({ value, onChange, className }: Props) {
    const percent = value !== null ? value / 10 : 0
    const displayValue = value !== null ? value.toFixed(1).replace('.0', '') : "-"

    return (
        <div className={cn("relative w-full h-12 rounded-full border border-white/10 bg-black/40 overflow-hidden select-none", className)}>
            <div className="absolute inset-0 flex items-center px-4 pointer-events-none overflow-hidden text-white/30">
                <Star className="w-4 h-4 mr-3 shrink-0" />
                <span className="text-sm whitespace-nowrap min-w-full font-medium italic tracking-wide">
                    Qual sua nota?
                </span>
            </div>

            <input 
                type="range" 
                min={0} 
                max={10} 
                step={0.5} 
                value={value ?? 0}
                onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    onChange(val === 0 ? null : val)
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 m-0"
            />

            <div 
                className="absolute left-0 top-0 bottom-0 bg-primary/10 transition-all duration-75 pointer-events-none"
                style={{ width: `calc(4px + ${percent} * (100% - 48px) + 20px)` }}
            />

            <div 
                className={cn(
                    "absolute top-1 bottom-1 w-10 rounded-full border-[3px] flex items-center justify-center shadow-lg shadow-black/50 transition-all duration-75 pointer-events-none z-20 backdrop-blur-sm",
                    value !== null ? "bg-violet-900/40 border-primary text-white" : "bg-violet-900/10 border-primary/40 text-white/50"
                )}
                style={{ 
                    left: `calc(4px + ${percent} * (100% - 48px))`
                }}
            >
                <span className="font-bold text-sm tracking-tighter">
                    {displayValue}
                </span>
            </div>
        </div>
    )
}
