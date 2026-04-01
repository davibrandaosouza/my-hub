"use client"

import { useSettings } from "@/hooks/useSettings"
import { cn } from "@/lib/utils"
import { Star, Frown, Meh, Smile, X } from "lucide-react"
import { RatingSlider } from "./RatingSlider"
import { getFormattedRating } from "@/lib/utils/ratings"

type Props = {
    value: number | null
    onChange: (val: number | null) => void
    className?: string
}

export function RatingInput({ value, onChange, className }: Props) {
    const { settings } = useSettings()
    const format = settings.entertainment.ratingFormat

    // ── CONFIGURAÇÕES DO SLIDER POR FORMATO ────────────────
    const sliderProps = {
        default: { min: 0, max: 10, step: 0.5 },
        integers: { min: 0, max: 10, step: 1 },
        stars: { min: 0, max: 5, step: 1 },
        emojis: { min: 1, max: 3, step: 1 }
    }[format] || { min: 0, max: 10, step: 0.5 }

    // ── MAPEAMENTO: DECIMAL -> VALOR DO SLIDER ─────────────
    const getSliderValue = (decimal: number | null): number | null => {
        if (decimal === null) return null
        if (format === "stars") return Math.round(decimal / 2)
        if (format === "emojis") return decimal <= 3 ? 1 : decimal <= 7 ? 2 : 3
        if (format === "integers") return Math.round(decimal)
        return decimal
    }

    // ── MAPEAMENTO: VALOR DO SLIDER -> DECIMAL ─────────────
    const handleSliderChange = (sliderVal: number | null) => {
        if (sliderVal === null) {
            onChange(null)
            return
        }
        
        let decimal = sliderVal
        if (format === "stars") decimal = sliderVal * 2
        if (format === "emojis") {
            const emojiMap = { 1: 2, 2: 5, 3: 9 }
            decimal = emojiMap[sliderVal as keyof typeof emojiMap] || 5
        }
        
        onChange(decimal)
    }

    // Valor mapeado para exibição visual
    const mappedValue = getFormattedRating(value, format)
    const sliderValue = getSliderValue(value)

    return (
        <div className={cn("space-y-4", className)}>
            {/* Visual Display based on Format */}
            <div className="flex items-center justify-center min-h-[60px] p-4 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
                {value === null ? (
                    <span className="text-sm text-muted italic">Mova o slider abaixo para avaliar</span>
                ) : (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                        {format === "stars" && (
                            <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                        key={star}
                                        className={cn(
                                            "w-7 h-7 transition-all",
                                            star <= (mappedValue as number) 
                                                ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" 
                                                : "text-white/10 fill-transparent"
                                        )} 
                                    />
                                ))}
                            </div>
                        )}

                        {format === "emojis" && (
                            <div className="transform scale-125">
                                {mappedValue === "sad" && <Frown className="w-9 h-9 text-red-400 fill-red-400/10" />}
                                {mappedValue === "neutral" && <Meh className="w-9 h-9 text-yellow-500 fill-yellow-500/10" />}
                                {mappedValue === "happy" && <Smile className="w-9 h-9 text-green-400 fill-green-400/10" />}
                            </div>
                        )}

                        {format === "integers" && (
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-primary tracking-tighter">
                                    {mappedValue}
                                </span>
                                <span className="text-xs text-muted font-medium">/ 10</span>
                            </div>
                        )}

                        {format === "default" && (
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white tracking-tighter">
                                    {mappedValue}
                                </span>
                                <span className="text-xs text-muted font-medium">/ 10.0</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Unified Slider Input */}
            <div className="space-y-2">
                <RatingSlider 
                    value={sliderValue} 
                    onChange={handleSliderChange} 
                    min={sliderProps.min}
                    max={sliderProps.max}
                    step={sliderProps.step}
                />
                
                <div className="flex justify-between items-center px-1">
                     {value !== null && format !== "default" && (
                        <p className="text-[10px] text-muted italic">
                            Sistema decimal: {value.toFixed(1)}
                        </p>
                    )}
                    
                    {value !== null && (
                        <button 
                            onClick={() => onChange(null)}
                            className="text-[11px] font-medium text-muted hover:text-red-400 transition-colors flex items-center gap-1.5 ml-auto group"
                        >
                            <X className="w-3.5 h-3.5 transition-transform group-hover:scale-110" /> 
                            Remover nota
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
