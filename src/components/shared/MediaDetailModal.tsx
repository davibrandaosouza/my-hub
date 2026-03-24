/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import { X, Star, Tag, Trash2, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { RatingSlider } from "@/components/shared/RatingSlider"

export type DetailModalData<TStatus extends string> = {
    id: string
    titulo: string
    coverUrl: string
    categoria: string
    nota: number | null
    status: TStatus
}

export type StatusOption<TStatus extends string> = {
    value: TStatus
    label: string
    color: string
}

type Props<TStatus extends string> = {
    data: DetailModalData<TStatus> | null
    statusOptions: StatusOption<TStatus>[]
    fallbackIcon?: React.ReactNode
    onClose: () => void
    onDelete: (id: string) => void
    onUpdate: (id: string, updates: { nota: number | null; status: TStatus }) => Promise<void>
}

export function MediaDetailModal<TStatus extends string>({ 
    data, 
    statusOptions, 
    fallbackIcon = "🎮", 
    onClose, 
    onDelete, 
    onUpdate 
}: Props<TStatus>) {
    const [notaInput, setNotaInput] = useState<number | null>(data?.nota ?? null)
    const [statusInput, setStatusInput] = useState<TStatus | "">(data?.status ?? "")
    const [savingNota, setSavingNota] = useState(false)
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

    if (!data) return null

    const handleSave = async () => {
        if (statusInput === "") return
        if (notaInput !== data.nota || statusInput !== data.status) {
            setSavingNota(true)
            await onUpdate(data.id, { nota: notaInput, status: statusInput })
            setSavingNota(false)
        }
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xl rounded-2xl border border-white/10 bg-card-background shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header Cover */}
                <div className="relative h-64 sm:h-80 w-full bg-white/5">
                    {data.coverUrl ? (
                        <img
                            src={data.coverUrl}
                            alt={data.titulo}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl opacity-20">{fallbackIcon}</span>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-card-background via-card-background/40 to-transparent" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white/80 hover:bg-black/60 hover:text-white backdrop-blur-md transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 px-6 pb-2 pt-6 flex flex-col gap-1.5">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-md">
                            {data.titulo}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium border border-white/20 bg-black/40 text-white/90 backdrop-blur-md">
                                <Tag className="w-3 h-3" />
                                {data.categoria}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pt-2 pb-6 space-y-6">
                    <div className="flex flex-col gap-3">
                        <label className="text-sm text-muted font-medium flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" /> Minha Nota
                        </label>

                        <RatingSlider
                            value={notaInput}
                            onChange={setNotaInput}
                        />

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 w-full">
                            {statusOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setStatusInput(opt.value)}
                                    className={cn(
                                        "px-2 py-2.5 rounded-xl text-[13px] transition-colors border outline-none w-full flex items-center justify-center",
                                        statusInput === opt.value
                                            ? opt.color
                                            : "bg-transparent text-white/50 border-white/10 hover:bg-white/5 hover:text-white/80 font-normal"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            onClick={() => {
                                if (isConfirmingDelete) {
                                    onDelete(data.id)
                                } else {
                                    setIsConfirmingDelete(true)
                                }
                            }}
                            onMouseLeave={() => setIsConfirmingDelete(false)}
                            className={cn(
                                "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 flex-wide sm:flex-1",
                                isConfirmingDelete
                                    ? "bg-red-500/10 text-red-500 border-red-500/40 hover:bg-red-500/20 scale-[0.99] font-medium"
                                    : "border-red-500/30 text-red-500 hover:bg-red-500/10"
                            )}
                        >
                            <Trash2 className={cn("shrink-0 transition-transform duration-300", isConfirmingDelete ? "w-4 h-4 scale-110" : "w-4 h-4")} />
                            <span className="text-sm font-medium">
                                {isConfirmingDelete ? "Tem certeza?" : "Remover da coleção"}
                            </span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={savingNota}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 transition-colors flex-wide sm:flex-1 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 shrink-0" />
                            <span className="text-sm font-medium">
                                {savingNota ? "Salvando..." : "Salvar"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
