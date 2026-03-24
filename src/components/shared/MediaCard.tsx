/* eslint-disable @next/next/no-img-element */
"use client"

import { Star, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

export type MediaData = {
    id: string
    titulo: string
    imagemUrl: string
    categoria: string
    statusLabel: string
    statusCor: string
    nota: number | null
}

type Props = {
    data: MediaData
    onClick: (id: string) => void
    fallbackIcon?: React.ReactNode
}

export function MediaCard({ data, onClick, fallbackIcon = "🎮" }: Props) {
    return (
        <div
            onClick={() => onClick(data.id)}
            className="group relative flex flex-col h-full rounded-xl overflow-hidden border border-border bg-card-background cursor-pointer hover:border-primary/40 transition-all hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]"
        >
            {/* Capa */}
            <div className="relative aspect-3/4 overflow-hidden bg-white/5 shrink-0">
                {data.imagemUrl ? (
                    <img
                        src={data.imagemUrl}
                        alt={data.titulo}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl opacity-20">{fallbackIcon}</span>
                    </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />

                {/* Status tag */}
                <span className={cn(
                    "absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-medium border backdrop-blur-sm",
                    data.statusCor
                )}>
                    {data.statusLabel}
                </span>
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 p-3">
                <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
                    {data.titulo}
                </p>

                <div className="mt-auto pt-2 flex items-end justify-between gap-2">
                    <span className="flex items-center gap-1 text-[10px] text-muted bg-white/5 px-2 py-0.5 rounded-full border border-border truncate max-w-[70%]">
                        <Tag className="w-2.5 h-2.5 shrink-0" />
                        {data.categoria}
                    </span>

                    {data.nota !== null && (
                        <span className="flex items-center gap-0.5 text-xs font-bold text-yellow-400">
                            <Star className="w-3 h-3 fill-yellow-400" />
                            {data.nota.toFixed(1)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
